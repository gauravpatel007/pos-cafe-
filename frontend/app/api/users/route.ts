import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    let result = await query(`SELECT * FROM users ORDER BY created_at ASC`)
    
    // Seed original mock data if empty
    if (result.rows.length === 0) {
       await query(`INSERT INTO users (name, email, password_hash, role) VALUES ('John Doe', 'john@cafe.com', 'default', 'Admin')`)
       await query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Jane Smith', 'jane@cafe.com', 'default', 'Manager')`)
       await query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Mike Johnson', 'mike@cafe.com', 'default', 'Cashier')`)
       await query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Sarah Wilson', 'sarah@cafe.com', 'default', 'Kitchen Staff')`)
       await query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Dave Brown', 'dave@cafe.com', 'default', 'Waiter')`)
       
       result = await query(`SELECT * FROM users ORDER BY created_at ASC`)
    }

    const mapped = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
      status: r.role === 'Waiter' ? 'Off Today' : (r.role === 'Cashier' ? 'On Break' : 'On Shift'),
      shiftStart: r.role === 'Waiter' ? '-' : '08:00 AM',
      ordersServed: r.role === 'Cashier' ? 54 : (r.role === 'Admin' ? 42 : '-'),
      salesTotal: r.role === 'Cashier' ? 18900 : (r.role === 'Admin' ? 12500 : '-'),
      avatar: r.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    }))
    return NextResponse.json(mapped)
  } catch (err) {
    console.error('GET /api/users error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, role } = await req.json()
    const email = `${name.split(' ')[0].toLowerCase()}${Math.floor(Math.random() * 1000)}@cafe.com`
    const result = await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, 'default', $3)
      RETURNING *
    `, [name, email, role])
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error('POST /api/users error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await query(`DELETE FROM users WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/users error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
