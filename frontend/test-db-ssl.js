const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const match = envContent.match(/DATABASE_URL\s*=\s*["']?([^"'\n\r]+)["']?/);
    if (match) {
      databaseUrl = match[1];
    }
  } catch (err) {
    console.error("Could not read .env file:", err.message);
  }
}

async function tryConnect(name, sslConfig) {
  console.log(`\n--- Trying: ${name} ---`);
  const client = new Client({
    connectionString: databaseUrl,
    ssl: sslConfig
  });
  try {
    await client.connect();
    console.log(`Success! ${name} connected.`);
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("Tables:", tables.rows.map(r => r.table_name));
    await client.end();
    return true;
  } catch (err) {
    console.error(`Failed ${name}:`, err.message);
    try { await client.end(); } catch(e){}
    return false;
  }
}

async function run() {
  await tryConnect("No SSL Config", false);
  await tryConnect("ssl: true", true);
  await tryConnect("ssl: { rejectUnauthorized: false }", { rejectUnauthorized: false });
}

run().catch(console.error);
