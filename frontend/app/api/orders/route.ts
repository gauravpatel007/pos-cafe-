import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/orders — list recent orders
export async function GET() {
  try {
    const result = await query(`
      SELECT o.*, t.name as table_name,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      ORDER BY o.created_at DESC LIMIT 50
    `)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST /api/orders — create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { source, items, tableId: explicitTableId } = body

    // Parse table_id from source (e.g. "Table 4" -> look up table)
    let tableId = explicitTableId || null
    if (!tableId && source && source.startsWith('Table')) {
      const tableName = source.replace('Table ', '').trim()
      const tableRes = await query(`SELECT id FROM tables WHERE name = $1`, [tableName])
      if (tableRes.rows.length > 0) tableId = tableRes.rows[0].id
    }

    // Generate order number
    const countRes = await query(`SELECT COUNT(*) as cnt FROM orders`)
    const orderCount = parseInt(countRes.rows[0].cnt) + 1
    const orderNumber = `ORD-${String(orderCount).padStart(4, '0')}`

    // Calculate totals
    const subtotal = items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0)
    const taxTotal = items.reduce((sum: number, i: any) => sum + (i.price * i.qty * (i.taxRate / 100)), 0)
    const grandTotal = subtotal + taxTotal

    // Insert order
    const orderRes = await query(`
      INSERT INTO orders (table_id, order_number, subtotal, tax_total, grand_total, status, source)
      VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)
      RETURNING id, order_number
    `, [tableId, orderNumber, subtotal, taxTotal, grandTotal, source || 'cashier'])

    const orderId = orderRes.rows[0].id

    // Insert order items
    for (const item of items) {
      await query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, tax_rate, variant)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [orderId, item.itemId, item.name, item.qty, item.price, item.taxRate, item.variant || null])
    }

    // Update table status if applicable
    if (tableId) {
      await query(`UPDATE tables SET status = 'occupied', current_order_id = $1 WHERE id = $2`, [orderId, tableId])
    }

    return NextResponse.json({ id: orderId, order_number: orderNumber })
  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
