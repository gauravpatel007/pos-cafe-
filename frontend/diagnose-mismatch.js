const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  // Check recent orders with their status and whether they have payment_transactions
  const res = await client.query(`
    SELECT o.order_number, o.status, o.grand_total, o.created_at,
           COALESCE(SUM(pt.amount), 0) as paid_amount,
           COUNT(pt.id) as payment_count
    FROM orders o
    LEFT JOIN payment_transactions pt ON pt.order_id = o.id AND pt.status = 'success'
    GROUP BY o.id, o.order_number, o.status, o.grand_total, o.created_at
    ORDER BY o.created_at DESC
    LIMIT 15
  `);

  console.log("Recent orders - Status vs Payments:");
  console.log("---------------------------------------------------");
  res.rows.forEach(r => {
    const mismatch = (r.status !== 'paid' && Number(r.paid_amount) > 0) ? ' ⚠️ MISMATCH!' : '';
    console.log(r.order_number + " | status=" + r.status + " | total=₹" + r.grand_total + " | paid=₹" + r.paid_amount + " | txns=" + r.payment_count + mismatch);
  });

  // Count mismatches
  const mismatchRes = await client.query(`
    SELECT COUNT(*) as cnt FROM orders o
    WHERE o.status != 'paid'
    AND EXISTS (SELECT 1 FROM payment_transactions pt WHERE pt.order_id = o.id AND pt.status = 'success')
  `);
  console.log("\nTotal orders with payments but NOT marked 'paid': " + mismatchRes.rows[0].cnt);

  // Revenue comparison
  const revPaid = await client.query("SELECT COALESCE(SUM(grand_total), 0) as r FROM orders WHERE status = 'paid' AND DATE(created_at) = CURRENT_DATE");
  const revAll = await client.query("SELECT COALESCE(SUM(amount), 0) as r FROM payment_transactions WHERE status = 'success' AND DATE(created_at) = CURRENT_DATE");
  console.log("\nRevenue (orders WHERE paid): ₹" + revPaid.rows[0].r);
  console.log("Revenue (payment_transactions): ₹" + revAll.rows[0].r);
  console.log("Difference: ₹" + (Number(revAll.rows[0].r) - Number(revPaid.rows[0].r)));

  await client.end();
}

run().catch(console.error);
