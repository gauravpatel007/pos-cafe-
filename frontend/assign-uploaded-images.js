const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  // Get all active products
  const res = await client.query(`
    SELECT p.id, p.name 
    FROM products p 
    WHERE p.active = true
  `);
  
  const dbProducts = res.rows;
  console.log(`Found ${dbProducts.length} active products in the database.`);

  const imagesSourceDir = path.join(__dirname, '..', 'IMAGES');
  const publicDestDir = path.join(__dirname, 'public', 'products');

  if (!fs.existsSync(publicDestDir)) {
    fs.mkdirSync(publicDestDir, { recursive: true });
  }

  // Read all files in the source IMAGES folder
  const files = fs.readdirSync(imagesSourceDir);
  console.log(`Found ${files.length} items in IMAGES directory.`);

  // Map file names (without extensions) to their full file names and extensions
  const imageFilesMap = {};
  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
      const baseName = path.basename(file, ext).trim().toLowerCase();
      // Keep track of the file path. Prefer .png or .jpg if duplicates exist.
      if (!imageFilesMap[baseName] || ext === '.png' || ext === '.jpg') {
        imageFilesMap[baseName] = file;
      }
    }
  });

  let matchCount = 0;

  for (const product of dbProducts) {
    const normalizedDbName = product.name.trim().toLowerCase();
    const matchedFile = imageFilesMap[normalizedDbName];

    if (matchedFile) {
      const srcPath = path.join(imagesSourceDir, matchedFile);
      const ext = path.extname(matchedFile);
      // Create a clean destination filename: lowercase, spaces replaced by underscores
      const destFilename = product.name.trim().replace(/\s+/g, '_').toLowerCase() + ext;
      const destPath = path.join(publicDestDir, destFilename);

      // Copy file
      fs.copyFileSync(srcPath, destPath);

      // Update database URL path to /products/destFilename
      const relativePublicPath = `/products/${destFilename}`;
      await client.query(
        `UPDATE products SET image_url = $1 WHERE id = $2`,
        [relativePublicPath, product.id]
      );

      console.log(`✓ Matched: "${product.name}" -> Copied as "${destFilename}" & updated database path to "${relativePublicPath}"`);
      matchCount++;
    } else {
      console.log(`✗ No image found for product: "${product.name}"`);
    }
  }

  console.log(`\nSuccessfully matched and updated ${matchCount} out of ${dbProducts.length} products.`);

  await client.end();
}

run().catch(console.error);
