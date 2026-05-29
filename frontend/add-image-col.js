const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  try {
    await client.query(`ALTER TABLE products ADD COLUMN image_url TEXT`);
    console.log("Added image_url column to products table.");
  } catch (e) {
    if (e.code === '42701') {
      console.log("image_url column already exists.");
    } else {
      console.error(e);
    }
  }

  await client.end();
}

run().catch(console.error);
