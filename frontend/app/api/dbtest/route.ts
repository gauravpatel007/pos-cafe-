import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const ordersRes = await query('SELECT id, order_number, table_id, status FROM orders ORDER BY id DESC LIMIT 5');
    const tablesRes = await query('SELECT id, name, status, current_order_id FROM tables ORDER BY id');
    return NextResponse.json({ orders: ordersRes.rows, tables: tablesRes.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
