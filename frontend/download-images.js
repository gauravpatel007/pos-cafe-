const fs = require('fs');
const path = require('path');
const https = require('https');
const { Client } = require('pg');

const publicDir = path.join(__dirname, 'public', 'products');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Cafe POS App; mailto:admin@example.com)'
      }
    };
    
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => fs.unlink(dest, () => reject(err)));
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/odoo_pos_cafe'
  });
  await client.connect();

  const res = await client.query("SELECT id, name, image_url FROM products WHERE image_url LIKE 'http%' AND active = true");
  console.log(`Found ${res.rows.length} images to download...`);

  for (const p of res.rows) {
    if (!p.image_url) continue;
    
    // Change 800px to 320px for Wikimedia thumbnail bucket compliance
    let thumbUrl = p.image_url;
    if (thumbUrl.includes('/800px-')) {
      thumbUrl = thumbUrl.replace('/800px-', '/320px-');
    }
    
    const safeName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
    const destPath = path.join(publicDir, safeName);
    const dbPath = '/products/' + safeName;
    
    console.log(`Downloading ${thumbUrl} for ${p.name}...`);
    try {
      await downloadImage(thumbUrl, destPath);
      await client.query("UPDATE products SET image_url = $1 WHERE id = $2", [dbPath, p.id]);
      console.log(`✅ Saved ${safeName}`);
    } catch (err) {
      console.error(`❌ Error downloading for ${p.name}:`, err.message);
      // Try again with 220px if 320px fails (220 is another standard)
      try {
        let smallerUrl = thumbUrl.replace('/320px-', '/220px-');
        await downloadImage(smallerUrl, destPath);
        await client.query("UPDATE products SET image_url = $1 WHERE id = $2", [dbPath, p.id]);
        console.log(`✅ Saved ${safeName} (220px)`);
      } catch (e2) {
        console.error(`❌ Fallback failed too.`);
      }
    }
    // Small delay to prevent rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  await client.end();
  console.log("Done downloading images.");
}

run().catch(console.error);
