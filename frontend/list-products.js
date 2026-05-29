const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  // Get column names from products table
  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'products' ORDER BY ordinal_position
  `);
  console.log("Product columns:", cols.rows.map(r => r.column_name).join(', '));

  // Get all products with their current categories
  const res = await client.query(`
    SELECT p.id, p.name, p.price, p.image_url, c.name as category_name, p.category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name
  `);

  console.log("\nTotal products: " + res.rows.length);
  console.log("\n--- ALL PRODUCTS ---");
  res.rows.forEach(r => {
    console.log(r.id + " | " + r.name + " | Rs" + r.price + " | Cat: " + (r.category_name || 'NONE') + " | Img: " + (r.image_url ? 'YES' : 'NONE'));
  });

  // Get categories
  const cats = await client.query("SELECT * FROM categories ORDER BY id");
  console.log("\n--- CATEGORIES ---");
  cats.rows.forEach(r => console.log(r.id + " | " + r.name));

  await client.end();
}

run().catch(console.error);
