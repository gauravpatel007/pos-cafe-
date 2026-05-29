import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// POST /api/orders/[id]/pay — process order payment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { payments } = body // Array of { method, amount }

    let dbId = id;
    if (typeof id === 'string' && id.startsWith('ORD-')) {
      const dbIdRes = await query(`SELECT id FROM orders WHERE order_number = $1`, [id])
      if (dbIdRes.rows.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      dbId = dbIdRes.rows[0].id
    }

    // Insert payment transactions
    for (const payment of payments) {
      await query(`
        INSERT INTO payment_transactions (order_id, method, amount, status, cashier_name)
        VALUES ($1, $2, $3, 'success', 'Cashier')
      `, [dbId, payment.method.toLowerCase(), payment.amount])
    }

    // Update order status
    await query(`
      UPDATE orders SET status = 'paid', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [dbId])

    // Free up table
    const orderRes = await query(`SELECT table_id FROM orders WHERE id = $1`, [dbId])
    if (orderRes.rows[0]?.table_id) {
      await query(`UPDATE tables SET status = 'available', current_order_id = NULL WHERE id = $1`, [orderRes.rows[0].table_id])
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/orders/[id]/pay error:', err)
    return NextResponse.json({ error: 'Payment processing error' }, { status: 500 })
  }
}
