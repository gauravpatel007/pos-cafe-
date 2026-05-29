import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/kitchen — list kitchen tickets
export async function GET() {
  try {
    const ticketsRes = await query(`
      SELECT kt.*, o.order_number
      FROM kitchen_tickets kt
      JOIN orders o ON kt.order_id = o.id
      WHERE kt.status IN ('to_cook', 'cooking')
      ORDER BY kt.created_at ASC
    `)

    const tickets = []
    for (const ticket of ticketsRes.rows) {
      const itemsRes = await query(`SELECT * FROM ticket_items WHERE ticket_id = $1`, [ticket.id])
      const elapsed = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / 1000)
      tickets.push({
        ...ticket,
        elapsed_seconds: elapsed,
        items: itemsRes.rows,
      })
    }

    return NextResponse.json(tickets)
  } catch (err) {
    console.error('GET /api/kitchen error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// PATCH /api/kitchen — update ticket status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticketId, status, itemId, isDone } = body

    if (itemId !== undefined) {
      // Update individual item
      await query(`UPDATE ticket_items SET is_done = $1 WHERE id = $2`, [isDone, itemId])
    }

    if (ticketId && status) {
      await query(`UPDATE kitchen_tickets SET status = $1 WHERE id = $2`, [status, ticketId])

      if (status === 'ready') {
        // Update order status to ready
        const ticket = await query(`SELECT order_id FROM kitchen_tickets WHERE id = $1`, [ticketId])
        if (ticket.rows.length > 0) {
          // Only update to 'ready' if the order hasn't already been paid
          await query(`UPDATE orders SET status = 'ready', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status != 'paid'`, [ticket.rows[0].order_id])
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/kitchen error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
