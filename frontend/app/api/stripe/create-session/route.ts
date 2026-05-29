import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.PAYMENT_APIKEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

// POST /api/stripe/create-session — create a Stripe checkout session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, orderNumber, orderId } = body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Order ${orderNumber || orderId}`,
              description: 'CaféPOS Order Payment',
            },
            unit_amount: Math.round(amount * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/pos/order?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/pos/payment?payment=cancelled`,
      metadata: {
        orderId: String(orderId),
        orderNumber: orderNumber || '',
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('Stripe create-session error:', err)
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 })
  }
}
