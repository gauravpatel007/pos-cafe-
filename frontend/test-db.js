const { Client } = require('pg');

async function test() {
  const connectionUrl = 'postgresql://postgres@localhost:5432/postgres';
  const client = new Client({
    connectionString: connectionUrl
  });
  await client.connect();
  
  const res = await client.query("SELECT oid, datname FROM pg_database WHERE datname = 'odoo_pos_cafe'");
  if (res.rows.length > 0) {
    console.log(`Database OID: ${res.rows[0].oid}`);
  } else {
    console.log("Database odoo_pos_cafe not found");
  }
  await client.end();
}

test().catch(console.error);
