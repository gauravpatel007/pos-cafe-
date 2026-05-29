import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/floors — list all floors with tables
export async function GET() {
  try {
    const floorsRes = await query(`SELECT * FROM floors ORDER BY id`)
    const tablesRes = await query(`
      SELECT t.*, o.order_number, o.grand_total, o.created_at as order_started,
      (
        SELECT json_agg(json_build_object(
          'id', oi.id,
          'itemId', oi.product_id,
          'name', oi.product_name,
          'price', oi.unit_price,
          'qty', oi.quantity,
          'taxRate', oi.tax_rate,
          'variant', oi.variant
        ))
        FROM order_items oi WHERE oi.order_id = t.current_order_id
      ) as items
      FROM tables t
      LEFT JOIN orders o ON t.current_order_id = o.id
      ORDER BY t.id
    `)

    const floors = floorsRes.rows.map(floor => ({
      ...floor,
      tables: tablesRes.rows
        .filter(t => t.floor_id === floor.id)
        .map(t => ({
          id: t.id,
          name: t.name,
          capacity: t.capacity,
          status: t.status,
          order: t.order_number || null,
          amount: t.grand_total ? Number(t.grand_total) : 0,
          duration: t.order_started ? getTimeDiff(t.order_started) : undefined,
          items: t.items || [],
        })),
    }))

    return NextResponse.json(floors)
  } catch (err) {
    console.error('GET /api/floors error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

function getTimeDiff(start: Date): string {
  const diff = Math.floor((Date.now() - new Date(start).getTime()) / 60000)
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff} min`
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}
