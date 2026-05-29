import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/categories — list all categories
export async function GET() {
  try {
    const result = await query(`SELECT id, name FROM categories ORDER BY name`)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('GET /api/categories error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
