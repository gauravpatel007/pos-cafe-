const { Client } = require('pg');

async function debugDB() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/cafe_pos' });
  await client.connect();
  
  const tables = await client.query('SELECT id, name, status, current_order_id FROM tables ORDER BY id');
  const orders = await client.query('SELECT id, order_number, table_id, status, payment_status FROM orders ORDER BY id DESC LIMIT 5');
  
  console.log("----- TABLES -----");
  console.log(JSON.stringify(tables.rows, null, 2));

  console.log("----- ORDERS -----");
  console.log(JSON.stringify(orders.rows, null, 2));

  await client.end();
}

debugDB().catch(console.error);
