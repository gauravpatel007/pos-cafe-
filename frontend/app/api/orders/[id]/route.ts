import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// PATCH /api/orders/[id] — update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    await query(`UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [status, id])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/orders/[id] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// GET /api/orders/[id] — get single order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderRes = await query(`
      SELECT o.*, t.name as table_name FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.id = $1
    `, [id])

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const itemsRes = await query(`SELECT * FROM order_items WHERE order_id = $1`, [id])

    return NextResponse.json({
      ...orderRes.rows[0],
      items: itemsRes.rows,
    })
  } catch (err) {
    console.error('GET /api/orders/[id] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
