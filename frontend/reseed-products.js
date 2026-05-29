const { Client } = require('pg');

const products = [
  // Beverages
  { name: 'Masala Chai', price: 40, cat: 'Beverages', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Masala_Chai.JPG/800px-Masala_Chai.JPG' },
  { name: 'Filter Coffee', price: 60, cat: 'Beverages', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Filter_Coffee_in_Traditional_Cup.jpg/800px-Filter_Coffee_in_Traditional_Cup.jpg' },
  { name: 'Mango Lassi', price: 100, cat: 'Beverages', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Mango_Lassi.jpg/800px-Mango_Lassi.jpg' },
  { name: 'Sweet Lassi', price: 80, cat: 'Beverages', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Lassi.jpg/800px-Lassi.jpg' },
  { name: 'Fresh Lime Soda', price: 80, cat: 'Beverages', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Nimbu_Pani.jpg/800px-Nimbu_Pani.jpg' },

  // Breakfast
  { name: 'Masala Dosa', price: 120, cat: 'Breakfast', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Dosa_and_ghee.jpg/800px-Dosa_and_ghee.jpg' },
  { name: 'Idli Sambar', price: 80, cat: 'Breakfast', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Idli_Sambar_2.JPG/800px-Idli_Sambar_2.JPG' },
  { name: 'Aloo Paratha', price: 100, cat: 'Breakfast', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Aloo_Paratha_also_known_as_Batatay_Jo_Phulko.jpg/800px-Aloo_Paratha_also_known_as_Batatay_Jo_Phulko.jpg' },
  { name: 'Poha', price: 60, cat: 'Breakfast', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Poha_aka_Kanda_Poha.jpg/800px-Poha_aka_Kanda_Poha.jpg' },
  { name: 'Upma', price: 70, cat: 'Breakfast', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Upma.jpg/800px-Upma.jpg' },

  // Desserts
  { name: 'Gulab Jamun', price: 80, cat: 'Desserts', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Gulab_jamun_%28Dessert%29.jpg/800px-Gulab_jamun_%28Dessert%29.jpg' },
  { name: 'Rasgulla', price: 70, cat: 'Desserts', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Rasgulla_from_Bengal.jpg/800px-Rasgulla_from_Bengal.jpg' },
  { name: 'Jalebi', price: 60, cat: 'Desserts', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Awadhi_jalebi.jpg/800px-Awadhi_jalebi.jpg' },
  { name: 'Gajar Halwa', price: 100, cat: 'Desserts', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Gajar_Halwa_1.JPG/800px-Gajar_Halwa_1.JPG' },
  { name: 'Rasmalai', price: 120, cat: 'Desserts', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Rasmalai_Indian_Dessert.jpg/800px-Rasmalai_Indian_Dessert.jpg' },

  // Main Course
  { name: 'Paneer Butter Masala', price: 280, cat: 'Main Course', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Paneer_butter_masala_in_a_copper_kadai.jpg/800px-Paneer_butter_masala_in_a_copper_kadai.jpg' },
  { name: 'Dal Makhani', price: 220, cat: 'Main Course', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Dal_Makhani_in_a_bowl.jpg/800px-Dal_Makhani_in_a_bowl.jpg' },
  { name: 'Veg Biryani', price: 250, cat: 'Main Course', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Vegetable_biryani.jpg/800px-Vegetable_biryani.jpg' },
  { name: 'Butter Chicken', price: 320, cat: 'Main Course', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Butter_chicken_2.jpg/800px-Butter_chicken_2.jpg' },
  { name: 'Palak Paneer', price: 260, cat: 'Main Course', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Palak_paneer.jpg/800px-Palak_paneer.jpg' },
  { name: 'Butter Naan', price: 50, cat: 'Main Course', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Indian_Naan_Bread.jpg/800px-Indian_Naan_Bread.jpg' },

  // Snacks
  { name: 'Samosa', price: 40, cat: 'Snacks', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Samosachutney.jpg/800px-Samosachutney.jpg' },
  { name: 'Chole Bhature', price: 150, cat: 'Snacks', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chole_Bhature_at_an_Indian_restaurant.jpg/800px-Chole_Bhature_at_an_Indian_restaurant.jpg' },
  { name: 'Pani Puri', price: 60, cat: 'Snacks', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Pani_Puri_in_New_Delhi.jpg/800px-Pani_Puri_in_New_Delhi.jpg' },
  { name: 'Pav Bhaji', price: 120, cat: 'Snacks', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/BOMBAY_PAV_BHAJI.jpg/800px-BOMBAY_PAV_BHAJI.jpg' },
  { name: 'Vada Pav', price: 50, cat: 'Snacks', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Vada_Pav_in_Mumbai.jpg/800px-Vada_Pav_in_Mumbai.jpg' },
  { name: 'Masala Maggi', price: 80, cat: 'Snacks', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Maggi_Noodles.jpg/800px-Maggi_Noodles.jpg' },
  { name: 'Dahi Vada', price: 90, cat: 'Snacks', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Dahi_vada.jpg/800px-Dahi_vada.jpg' }
];

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/odoo_pos_cafe';
  console.log("Connecting to database...");
  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
  });
  await client.connect();

  console.log("Hiding current products (setting active=false)...");
  await client.query("UPDATE products SET active = false");

  // Get categories
  const catRes = await client.query("SELECT id, name FROM categories");
  const catMap = {};
  catRes.rows.forEach(r => catMap[r.name] = r.id);

  console.log("Inserting new products...");
  for (const p of products) {
    let catId = catMap[p.cat];
    if (!catId) {
      console.log("Creating new category: " + p.cat);
      const res = await client.query("INSERT INTO categories (name) VALUES ($1) RETURNING id", [p.cat]);
      catId = res.rows[0].id;
      catMap[p.cat] = catId;
    }
    
    await client.query(`
      INSERT INTO products (category_id, name, price, tax_rate, description, active, image_url)
      VALUES ($1, $2, $3, 5.00, $4, true, $5)
    `, [catId, p.name, p.price, 'Fresh ' + p.name, p.img]);
  }

  console.log("Successfully inserted " + products.length + " products!");
  await client.end();
}

run().catch(console.error);
