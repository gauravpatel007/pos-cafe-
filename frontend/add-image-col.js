const { Client } = require('pg');

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/odoo_pos_cafe';
  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
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
