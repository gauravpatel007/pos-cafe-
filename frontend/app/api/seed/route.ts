import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// POST /api/seed — seed the database with sample data
export async function POST() {
  try {
    // Seed categories
    await query(`
      INSERT INTO categories (name) VALUES
        ('Breakfast'), ('Main Course'), ('Beverages'), ('Desserts'), ('Snacks')
      ON CONFLICT DO NOTHING
    `)

    // Get category IDs
    const catsRes = await query(`SELECT id, name FROM categories`)
    const catMap: Record<string, number> = {}
    catsRes.rows.forEach(c => { catMap[c.name] = c.id })

    // Seed products
    const products = [
      { name: 'Masala Dosa', price: 120, tax: 5, cat: 'Breakfast' },
      { name: 'Idli Sambar', price: 80, tax: 5, cat: 'Breakfast' },
      { name: 'Poha', price: 60, tax: 5, cat: 'Breakfast' },
      { name: 'Aloo Paratha', price: 100, tax: 5, cat: 'Breakfast' },
      { name: 'Paneer Butter Masala', price: 250, tax: 5, cat: 'Main Course' },
      { name: 'Dal Makhani', price: 200, tax: 5, cat: 'Main Course' },
      { name: 'Chole Bhature', price: 180, tax: 5, cat: 'Main Course' },
      { name: 'Veg Biryani', price: 220, tax: 5, cat: 'Main Course' },
      { name: 'Rajma Chawal', price: 160, tax: 5, cat: 'Main Course' },
      { name: 'Masala Chai', price: 40, tax: 5, cat: 'Beverages' },
      { name: 'Filter Coffee', price: 60, tax: 5, cat: 'Beverages' },
      { name: 'Mango Lassi', price: 90, tax: 5, cat: 'Beverages' },
      { name: 'Cold Coffee', price: 120, tax: 5, cat: 'Beverages' },
      { name: 'Fresh Lime Soda', price: 50, tax: 5, cat: 'Beverages' },
      { name: 'Gulab Jamun', price: 80, tax: 5, cat: 'Desserts' },
      { name: 'Rasmalai', price: 100, tax: 5, cat: 'Desserts' },
      { name: 'Kheer', price: 90, tax: 5, cat: 'Desserts' },
      { name: 'Samosa', price: 30, tax: 5, cat: 'Snacks' },
      { name: 'Vada Pav', price: 40, tax: 5, cat: 'Snacks' },
      { name: 'Pav Bhaji', price: 120, tax: 5, cat: 'Snacks' },
    ]

    for (const p of products) {
      await query(`
        INSERT INTO products (category_id, name, price, tax_rate)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [catMap[p.cat], p.name, p.price, p.tax])
    }

    // Seed floors
    await query(`
      INSERT INTO floors (name) VALUES ('Ground Floor'), ('1st Floor'), ('Terrace')
      ON CONFLICT DO NOTHING
    `)

    const floorsRes = await query(`SELECT id, name FROM floors`)

    // Seed tables
    for (const floor of floorsRes.rows) {
      const tableCount = floor.name === 'Terrace' ? 4 : floor.name === '1st Floor' ? 6 : 8
      for (let i = 1; i <= tableCount; i++) {
        await query(`
          INSERT INTO tables (floor_id, name, capacity)
          SELECT $1, $2, $3
          WHERE NOT EXISTS (SELECT 1 FROM tables WHERE floor_id = $1 AND name = $2)
        `, [floor.id, `T${i}`, i <= 4 ? 2 : 4])
      }
    }

    // Seed payment methods
    await query(`
      INSERT INTO payment_methods (name, type, upi_id, merchant_name) VALUES
        ('Cash', 'cash', NULL, NULL),
        ('UPI', 'upi', 'cafeodoo@upi', 'CaféPOS'),
        ('Card', 'card', NULL, NULL)
      ON CONFLICT DO NOTHING
    `)

    // Seed a default user
    await query(`
      INSERT INTO users (name, email, password_hash, role) VALUES
        ('Admin', 'admin@cafepos.com', 'hashed_password', 'manager')
      ON CONFLICT (email) DO NOTHING
    `)

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (err) {
    console.error('POST /api/seed error:', err)
    return NextResponse.json({ error: 'Seed failed', details: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Send a POST request to seed the database' })
}
