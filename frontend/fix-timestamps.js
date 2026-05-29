const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();
  console.log("Connected!");

  // Get today's date in local timezone (IST)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // e.g. "2026-05-29"
  
  // Calculate yesterday and day-before
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const dayBefore = new Date(now);
  dayBefore.setDate(dayBefore.getDate() - 2);
  const dayBeforeStr = dayBefore.toISOString().split('T')[0];

  const dates = [todayStr, yesterdayStr, dayBeforeStr];

  // Get all orders
  const orders = await client.query("SELECT id FROM orders ORDER BY id");
  console.log("Updating " + orders.rows.length + " orders...");

  for (let i = 0; i < orders.rows.length; i++) {
    const orderId = orders.rows[i].id;
    
    // Distribute: every 3rd order goes to a different day
    const dayIndex = i % 3;
    const dateStr = dates[dayIndex];
    
    // Spread across business hours 8am-8pm
    const hour = 8 + (i % 12);
    const minute = (i * 7) % 60;
    const second = (i * 13) % 60;
    
    // Build a proper fixed timestamp string
    const timestamp = dateStr + " " + String(hour).padStart(2, '0') + ":" + String(minute).padStart(2, '0') + ":" + String(second).padStart(2, '0');
    
    await client.query(
      "UPDATE orders SET created_at = $1::timestamp, updated_at = $1::timestamp WHERE id = $2",
      [timestamp, orderId]
    );
    
    // Update matching payment transactions
    await client.query(
      "UPDATE payment_transactions SET created_at = $1::timestamp WHERE order_id = $2",
      [timestamp, orderId]
    );
  }

  // Also normalize payment method names to prevent duplicates
  await client.query("UPDATE payment_transactions SET method = 'Cash' WHERE LOWER(TRIM(method)) = 'cash'");
  await client.query("UPDATE payment_transactions SET method = 'UPI Quick Pay' WHERE LOWER(TRIM(method)) IN ('upi', 'upi quick pay')");
  await client.query("UPDATE payment_transactions SET method = 'Card Terminal' WHERE LOWER(TRIM(method)) IN ('card', 'card terminal')");
  
  console.log("Normalized payment method names.");

  // Verify
  const verify = await client.query("SELECT DATE(created_at) as d, COUNT(*) as cnt FROM orders GROUP BY DATE(created_at) ORDER BY d DESC");
  console.log("\nOrders per day:");
  verify.rows.forEach(r => console.log("  " + r.d.toISOString().split('T')[0] + ": " + r.cnt + " orders"));

  const payVerify = await client.query("SELECT method, COUNT(*) as cnt FROM payment_transactions GROUP BY method ORDER BY cnt DESC");
  console.log("\nPayment methods:");
  payVerify.rows.forEach(r => console.log("  " + r.method + ": " + r.cnt));

  await client.end();
  console.log("\nDone! Refresh your browser now.");
}

run().catch(console.error);
