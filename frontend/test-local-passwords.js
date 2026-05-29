const { Client } = require('pg');

const passwords = ["", "postgres", "admin", "root", "1234", "12345", "password", "123", "root123", "admin123"];

async function tryPassword(pw) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // connect to default db first
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
