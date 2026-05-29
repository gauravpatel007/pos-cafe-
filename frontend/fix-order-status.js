const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  // Fix all orders that have successful payments but aren't marked as 'paid'
  const result = await client.query(`
    UPDATE orders SET status = 'paid', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
    WHERE status != 'paid'
    AND EXISTS (
      SELECT 1 FROM payment_transactions pt 
      WHERE pt.order_id = orders.id AND pt.status = 'success'
    )
  `);
  console.log("Fixed " + result.rowCount + " orders that had payments but wrong status");

  // Verify
  const verify = await client.query(`
    SELECT status, COUNT(*) as cnt 
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY status 
    ORDER BY cnt DESC
  `);
  console.log("\nToday's orders by status:");
  verify.rows.forEach(r => console.log("  " + r.status + ": " + r.cnt));

  await client.end();
}

run().catch(console.error);
