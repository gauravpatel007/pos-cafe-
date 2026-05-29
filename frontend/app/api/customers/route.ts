import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          tier VARCHAR(50) DEFAULT 'Bronze',
          visits INTEGER DEFAULT 0,
          total_spend DECIMAL(10,2) DEFAULT 0,
          last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    let result = await query(`SELECT * FROM customers ORDER BY created_at DESC`)
    
    // Ensure mock data is always there for demo purposes
    const hasMock = result.rows.find(r => r.name === 'Alisha Singh')
    if (!hasMock) {
       await query(`INSERT INTO customers (name, phone, visits, total_spend, tier) VALUES ('Alisha Singh', '+91 98765 43210', 42, 15400, 'Platinum')`)
       await query(`INSERT INTO customers (name, phone, visits, total_spend, tier) VALUES ('Raj Kumar', '+91 87654 32109', 18, 5200, 'Gold')`)
       await query(`INSERT INTO customers (name, phone, visits, total_spend, tier) VALUES ('Neha Sharma', '+91 76543 21098', 5, 1200, 'Bronze')`)
       await query(`INSERT INTO customers (name, phone, visits, total_spend, tier) VALUES ('Arjun Das', '+91 65432 10987', 27, 9800, 'Gold')`)
       await query(`INSERT INTO customers (name, phone, visits, total_spend, tier) VALUES ('Priya Verma', '+91 54321 09876', 64, 23100, 'Platinum')`)
       
       result = await query(`SELECT * FROM customers ORDER BY created_at DESC`)
    }

    const mapped = result.rows.map(r => ({
      id: `CUST-${(r.id || 0).toString().padStart(3, '0')}`,
      name: r.name,
      phone: r.phone || '—',
      visits: r.visits || 0,
      totalSpend: Number(r.total_spend) || 0,
      lastVisit: 'Recent',
      tier: r.tier || 'Bronze'
    }))
    return NextResponse.json(mapped)
  } catch (err) {
    console.error('GET /api/customers error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone } = await req.json()
    const result = await query(`
      INSERT INTO customers (name, phone, tier)
      VALUES ($1, $2, 'Bronze')
      RETURNING *
    `, [name, phone])
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error('POST /api/customers error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
