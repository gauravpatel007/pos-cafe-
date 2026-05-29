import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.PAYMENT_APIKEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

// POST /api/stripe/check-status — check a Stripe session status
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId } = body

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      status: session.payment_status,
      orderId: session.metadata?.orderId,
      orderNumber: session.metadata?.orderNumber,
      amountTotal: (session.amount_total || 0) / 100,
    })
  } catch (err) {
    console.error('Stripe check-status error:', err)
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 })
  }
}
