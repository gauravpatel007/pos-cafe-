const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function exportProducts() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  // Get active products with category name
  const res = await client.query(`
    SELECT p.id, p.name, p.price, p.tax_rate, p.description, p.image_url, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = true
    ORDER BY c.name, p.name
  `);

  const products = res.rows;
  console.log(`Retrieved ${products.length} active products.`);

  // 1. Generate Markdown file
  let mdContent = `# Cafe Odoo - Product Menu List\n\n`;
  mdContent += `This file contains a list of all active products categorized into **Beverages**, **Breakfast**, **Desserts**, **Main Course**, and **Snacks**.\n\n`;
  mdContent += `*Total Products:* **${products.length}**\n\n`;

  // Group by category
  const categories = {};
  products.forEach(p => {
    const cat = p.category_name || 'Uncategorized';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  for (const [catName, catProducts] of Object.entries(categories)) {
    mdContent += `## ${catName} (${catProducts.length} items)\n\n`;
    mdContent += `| ID | Product Name | Price (₹) | Tax Rate (%) | Description | Image URL / Path |\n`;
    mdContent += `|---|---|---|---|---|---|\n`;
    catProducts.forEach(p => {
      mdContent += `| ${p.id} | **${p.name}** | ₹${parseFloat(p.price).toFixed(2)} | ${parseFloat(p.tax_rate || 5.0).toFixed(1)}% | ${p.description || 'No description'} | \`${p.image_url || 'None'}\` |\n`;
    });
    mdContent += `\n`;
  }

  const mdPath = path.join(__dirname, '..', 'products_list.md');
  try {
    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log(`Markdown list generated at: ${mdPath}`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const backupMdPath = path.join(__dirname, '..', 'products_list_updated.md');
      fs.writeFileSync(backupMdPath, mdContent, 'utf8');
      console.log(`Warning: products_list.md was busy. Written to backup: ${backupMdPath}`);
    } else {
      throw err;
    }
  }

  // 2. Generate CSV file
  let csvContent = `ID,Product Name,Category,Price (INR),Tax Rate (%),Description,Image URL/Path\n`;
  products.forEach(p => {
    // Escape double quotes in text fields
    const name = `"${p.name.replace(/"/g, '""')}"`;
    const cat = `"${(p.category_name || 'Uncategorized').replace(/"/g, '""')}"`;
    const desc = `"${(p.description || '').replace(/"/g, '""')}"`;
    const imgUrl = `"${(p.image_url || '').replace(/"/g, '""')}"`;
    const price = parseFloat(p.price).toFixed(2);
    const tax = parseFloat(p.tax_rate || 5.0).toFixed(2);
    
    csvContent += `${p.id},${name},${cat},${price},${tax},${desc},${imgUrl}\n`;
  });

  const csvPath = path.join(__dirname, '..', 'products_list.csv');
  try {
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`CSV list generated at: ${csvPath}`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const backupCsvPath = path.join(__dirname, '..', 'products_list_updated.csv');
      fs.writeFileSync(backupCsvPath, csvContent, 'utf8');
      console.log(`Warning: products_list.csv was busy/locked. Written to backup: ${backupCsvPath}`);
    } else {
      throw err;
    }
  }

  await client.end();
}

exportProducts().catch(console.error);
