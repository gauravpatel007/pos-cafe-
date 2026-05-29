import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/payment-methods — list all payment methods
export async function GET() {
  try {
    let result = await query(`
      SELECT id, name, type, is_active, upi_id, merchant_name
      FROM payment_methods
      ORDER BY id
    `)

    if (result.rows.length === 0) {
      await query(`INSERT INTO payment_methods (name, type, is_active) VALUES ('Cash', 'cash', true)`);
      await query(`INSERT INTO payment_methods (name, type, is_active, upi_id, merchant_name) VALUES ('UPI', 'upi', true, 'gaurav.patel.1008.2006@okicici', 'Gaurav Patel')`);
      await query(`INSERT INTO payment_methods (name, type, is_active) VALUES ('Card Terminal', 'card', true)`);
      
      result = await query(`
        SELECT id, name, type, is_active, upi_id, merchant_name
        FROM payment_methods
        ORDER BY id
      `)
    }

    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('GET /api/payment-methods error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
