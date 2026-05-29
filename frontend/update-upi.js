const { Client } = require('pg');

async function update() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/cafe_pos' });
  await client.connect();
  await client.query("UPDATE payment_methods SET upi_id = 'gaurav.patel.1008.2006@okicici', merchant_name = 'Gaurav Patel' WHERE type = 'upi'");
  console.log('Updated UPI details in DB');
  await client.end();
}

update().catch(console.error);
