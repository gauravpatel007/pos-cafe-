import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await query(`
      SELECT pt.id, pt.order_id, pt.method, pt.amount, pt.status, pt.created_at, pt.cashier_name,
             o.order_number
      FROM payment_transactions pt
      LEFT JOIN orders o ON pt.order_id = o.id
      ORDER BY pt.created_at DESC
      LIMIT 100
    `)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('GET /api/transactions error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
