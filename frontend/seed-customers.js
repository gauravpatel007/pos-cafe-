const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cafe_pos' });

async function seed() {
  await client.connect();
  const res = await client.query('SELECT name FROM customers');
  const existingNames = res.rows.map(r => r.name);
  
  const mock = [
    { name: 'Alisha Singh', phone: '+91 98765 43210', visits: 42, spend: 15400, tier: 'Platinum' },
    { name: 'Raj Kumar', phone: '+91 87654 32109', visits: 18, spend: 5200, tier: 'Gold' },
    { name: 'Neha Sharma', phone: '+91 76543 21098', visits: 5, spend: 1200, tier: 'Bronze' },
    { name: 'Arjun Das', phone: '+91 65432 10987', visits: 27, spend: 9800, tier: 'Gold' },
    { name: 'Priya Verma', phone: '+91 54321 09876', visits: 64, spend: 23100, tier: 'Platinum' }
  ];

  for (const m of mock) {
    if (!existingNames.includes(m.name)) {
      await client.query(
        `INSERT INTO customers (name, phone, visits, total_spend, tier) VALUES ($1, $2, $3, $4, $5)`,
        [m.name, m.phone, m.visits, m.spend, m.tier]
      );
      console.log('Inserted', m.name);
    }
  }
  await client.end();
}
seed().catch(console.error);
