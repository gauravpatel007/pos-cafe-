const { Client } = require('pg');

const passwords = [
  "postgres123", 
  "Admin123", 
  "root1234", 
  "Pass@123", 
  "Postgres@123", 
  "postgres@123", 
  "gaurav", 
  "gaurav123", 
  "patel", 
  "patel123", 
  "root@123",
  "Odoo@123",
  "odoo"
];

async function tryPassword(pw) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: pw,
    port: 5432
  });
  try {
    await client.connect();
    console.log(`SUCCESS with password: "${pw}"`);
    await client.end();
    return pw;
  } catch (err) {
    console.log(`Failed for "${pw}":`, err.message);
    try { await client.end(); } catch (e) {}
    return null;
  }
}

async function run() {
  for (const pw of passwords) {
    const res = await tryPassword(pw);
    if (res !== null) {
      console.log(`\nFound working password: "${res}"`);
      break;
    }
  }
}

run().catch(console.error);
