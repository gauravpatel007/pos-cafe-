const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();
  console.log("Connected to odoo_pos_cafe database!");

  // Shift sessions to be recent
  await client.query("UPDATE sessions SET opened_at = NOW() - INTERVAL '1 day', closed_at = NOW() - INTERVAL '12 hours' WHERE id = 1");
  console.log("Updated sessions.");

  // Distribute order dates across the last 3 days
  // Let's set some to today, some to yesterday, some to 2 days ago
  const orders = await client.query("SELECT id FROM orders ORDER BY id");
  console.log(`Updating ${orders.rows.length} orders...`);

  for (let i = 0; i < orders.rows.length; i++) {
    const orderId = orders.rows[i].id;
    let daysAgo = 0;
    if (i % 3 === 1) daysAgo = 1; // yesterday
    if (i % 3 === 2) daysAgo = 2; // 2 days ago
    
    const hour = 8 + (i % 12); // between 8am and 8pm
    const minute = (i * 7) % 60;
    
    const dateStr = `NOW() - INTERVAL '${daysAgo} days' + INTERVAL '${hour} hours' + INTERVAL '${minute} minutes'`;
    
    await client.query(`
      UPDATE orders 
      SET created_at = ${dateStr}, updated_at = ${dateStr}
      WHERE id = $1
    `, [orderId]);

    // Update corresponding payment transaction
    await client.query(`
      UPDATE payment_transactions
      SET created_at = ${dateStr}
      WHERE order_id = $1
    `, [orderId]);
  }

  console.log("Successfully shifted order and payment transaction timestamps to recent days!");
  await client.end();
}

run().catch(console.error);
