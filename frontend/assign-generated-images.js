const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const artifacts = {
  Beverages: 'C:\\Users\\Gaurav Patel\\.gemini\\antigravity\\brain\\f33dd972-8561-4cc3-a6be-5dcee377f8f1\\beverage_chai_1780058069419.png',
  Breakfast: 'C:\\Users\\Gaurav Patel\\.gemini\\antigravity\\brain\\f33dd972-8561-4cc3-a6be-5dcee377f8f1\\breakfast_dosa_1780058084757.png',
  'Main Course': 'C:\\Users\\Gaurav Patel\\.gemini\\antigravity\\brain\\f33dd972-8561-4cc3-a6be-5dcee377f8f1\\main_paneer_1780058104220.png',
  Snacks: 'C:\\Users\\Gaurav Patel\\.gemini\\antigravity\\brain\\f33dd972-8561-4cc3-a6be-5dcee377f8f1\\snack_samosa_1780058120493.png',
  Desserts: 'C:\\Users\\Gaurav Patel\\.gemini\\antigravity\\brain\\f33dd972-8561-4cc3-a6be-5dcee377f8f1\\dessert_jamun_1780058135295.png'
};

const publicDir = path.join(__dirname, 'public', 'products');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Map the copied files to their public URLs
const publicUrls = {};
for (const [cat, srcPath] of Object.entries(artifacts)) {
  const destName = cat.replace(' ', '_').toLowerCase() + '.png';
  const destPath = path.join(publicDir, destName);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    publicUrls[cat] = '/products/' + destName;
    console.log(`Copied image for ${cat}`);
  } else {
    console.log(`Warning: Could not find image for ${cat} at ${srcPath}`);
  }
}

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  const res = await client.query("SELECT p.id, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = true");
  
  let count = 0;
  for (const p of res.rows) {
    const url = publicUrls[p.category_name];
    if (url) {
      await client.query("UPDATE products SET image_url = $1 WHERE id = $2", [url, p.id]);
      count++;
    }
  }

  await client.end();
  console.log(`Assigned images to ${count} products in the database!`);
}

run().catch(console.error);
