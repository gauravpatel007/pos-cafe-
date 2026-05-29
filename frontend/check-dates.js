const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  // Check what the DB thinks "today" is
  const dbNow = await client.query("SELECT NOW() as now, CURRENT_DATE as today, CURRENT_TIMESTAMP as ts");
  console.log("DB NOW():", dbNow.rows[0].now);
  console.log("DB CURRENT_DATE:", dbNow.rows[0].today);

  // Check orders per day
  const perDay = await client.query("SELECT DATE(created_at) as d, COUNT(*) as cnt FROM orders GROUP BY DATE(created_at) ORDER BY d DESC");
  console.log("\nOrders per day:");
  perDay.rows.forEach(r => console.log("  " + r.d.toISOString().split('T')[0] + ": " + r.cnt));

  // Check today's dashboard query
  const rev = await client.query("SELECT COALESCE(SUM(grand_total), 0) as revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = CURRENT_DATE");
  console.log("\nToday's revenue (DB perspective):", rev.rows[0].revenue);

  const cnt = await client.query("SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE");
  console.log("Today's order count (DB perspective):", cnt.rows[0].count);

  await client.end();
}

run().catch(console.error);
