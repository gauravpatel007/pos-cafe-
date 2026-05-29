import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// POST /api/orders/[id]/send-to-kitchen — create kitchen ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get order + table info
    const orderRes = await query(`
      SELECT o.id, o.order_number, t.name as table_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.id = $1
    `, [id])

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderRes.rows[0]

    // Create kitchen ticket
    const ticketRes = await query(`
      INSERT INTO kitchen_tickets (order_id, table_name, status)
      VALUES ($1, $2, 'to_cook')
      RETURNING id
    `, [id, order.table_name || 'Takeaway'])

    const ticketId = ticketRes.rows[0].id

    // Get order items and create ticket items
    const itemsRes = await query(`SELECT product_name, quantity FROM order_items WHERE order_id = $1`, [id])
    for (const item of itemsRes.rows) {
      await query(`
        INSERT INTO ticket_items (ticket_id, name, quantity)
        VALUES ($1, $2, $3)
      `, [ticketId, item.product_name, item.quantity])
    }

    // Update order status
    await query(`UPDATE orders SET status = 'kitchen', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id])

    return NextResponse.json({ success: true, ticketId })
  } catch (err) {
    console.error('POST /api/orders/[id]/send-to-kitchen error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
