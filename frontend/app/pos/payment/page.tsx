'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, Banknote, CreditCard, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import { QRCodeCanvas } from 'qrcode.react'

export default function POSPaymentPage() {
  const router = useRouter()
  const [cart, setCart] = useLocalStorageState<any[]>('pos_active_cart', [])
  const [orderState, setOrderState] = useLocalStorageState('pos_active_order_state', 'Draft')
  const [currentOrderId, setCurrentOrderId] = useLocalStorageState<number | null>('pos_active_order_id', null)
  const [orderNumber, setOrderNumber] = useLocalStorageState<string | null>('pos_active_order_number', null)

  const subtotal = cart.reduce((acc, c) => acc + (c.price * c.qty), 0)
  const taxTotal = cart.reduce((acc, c) => acc + ((c.price * c.qty) * (c.taxRate / 100)), 0)
  const totalAmount = subtotal + taxTotal

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [payments, setPayments] = useState<{ method: string, amount: number }[]>([])
  const [activeMethod, setActiveMethod] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/payment-methods').then(res => res.json()).then(data => {
      setPaymentMethods(data.filter((m: any) => m.is_active))
    }).catch(e => console.error("Failed to load payment methods", e))
  }, [])

  // Redirect if empty
  if (cart.length === 0 && orderState !== 'Paid') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Cart is empty</h2>
        <button className="btn btn-primary" onClick={() => router.push('/pos/order')}>Return to Order</button>
      </div>
    )
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = Math.max(0, totalAmount - totalPaid)
  const change = Math.max(0, totalPaid - totalAmount)
  const paymentState = remaining === totalAmount ? 'unpaid' : remaining > 0 ? 'partial' : 'paid'

  const selectMethod = (method: any) => {
    setActiveMethod(method)
  }

  const handleApplyPayment = async () => {
    const amt = remaining
    if (amt <= 0) return

    setIsProcessing(true)
    try {
      if (currentOrderId) {
        await fetch(`/api/orders/${currentOrderId}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payments: [{ method: activeMethod.name, amount: amt }]
          })
        })
      }
      setPayments([...payments, { method: activeMethod.name, amount: amt }])
      setActiveMethod(null)
    } catch (e) {
      console.error('Payment failed', e)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFinish = () => {
    setOrderState('Paid')
    setTimeout(() => {
      setCart([])
      setOrderState('Draft')
      setCurrentOrderId(null)
      setOrderNumber(null)
      router.push('/pos/order')
    }, 2000)
  }

  if (orderState === 'Paid') {
    return (
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={40} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Payment Successful!</div>
          <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>Redirecting to new order...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', height: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-canvas)' }}>
      {/* LEFT COLUMN: Payment Selection */}
      <div style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 24, fontSize: 15, width: 'fit-content' }}>
          <ArrowLeft size={18} /> Back to Order
        </button>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Select Payment Method</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 40 }}>Choose how the customer prefers to pay for the order.</p>

        {!activeMethod ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
            {paymentMethods.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading configured methods...</div>
            ) : (
              paymentMethods.map(pm => {
                const pType = pm.type.toLowerCase()
                const Icon = pType === 'cash' ? Banknote : pType === 'upi' ? QrCode : CreditCard;
                const fgColor = pType === 'cash' ? 'var(--accent-green)' : pType === 'upi' ? 'var(--accent-blue)' : 'var(--text-secondary)';
                const bgColor = pType === 'cash' ? 'var(--accent-green-light)' : pType === 'upi' ? 'var(--accent-blue-light)' : 'white';
                const typeLabel = pType === 'cash' ? 'Physical Currency' : pType === 'upi' ? 'Scan QR Code' : 'Terminal / Card Reader';

                return (
                  <button key={pm.id} className="btn btn-secondary" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, border: '1.5px solid var(--border-default)', borderRadius: 16 }} onClick={() => selectMethod(pm)}>
                    <div style={{ background: bgColor, color: fgColor, padding: 16, borderRadius: 12, border: pType === 'card' ? '1px solid var(--border-light)' : 'none' }}>
                      <Icon size={28} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{pm.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{typeLabel}</div>
                    </div>
                    <ChevronRight size={24} color="var(--text-muted)" />
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <div style={{ maxWidth: 600, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
              {activeMethod.type.toLowerCase() === 'upi' ? (
                /* ── UPI FLOW: Show QR prominently, cashier confirms after scan ── */
                <>
                  <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Scan &amp; Pay via UPI
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>
                    ₹{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ padding: 20, background: 'white', borderRadius: 20, border: '3px solid var(--accent-blue)', display: 'inline-block', marginBottom: 16 }}>
                    <QRCodeCanvas
                      value={`upi://pay?pa=${activeMethod.upi_id || 'merchant@upi'}&pn=${encodeURIComponent(activeMethod.merchant_name || 'CafeOdoo')}&am=${remaining.toFixed(2)}&cu=INR&tn=Order${orderNumber ? '-' + orderNumber : ''}`}
                      size={220}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-blue)', marginBottom: 6 }}>
                    {activeMethod.merchant_name || 'Merchant'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
                    UPI ID: {activeMethod.upi_id || 'N/A'}
                  </div>
                  <div style={{ width: '100%', padding: '12px 16px', background: 'var(--accent-blue-light)', borderRadius: 10, textAlign: 'center', marginBottom: 24, fontSize: 13, fontWeight: 600, color: 'var(--accent-blue)' }}>
                    💡 Ask the customer to scan this QR code with any UPI app (GPay, PhonePe, Paytm etc.)
                  </div>
                  <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, padding: '18px', fontSize: 16 }} onClick={() => setActiveMethod(null)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 2, padding: '18px', fontSize: 16, background: 'var(--accent-green)' }} onClick={handleApplyPayment} disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : '✓ Payment Received — Confirm'}
                    </button>
                  </div>
                </>
              ) : (
                /* ── CASH / CARD FLOW ── */
                <>
                  <div style={{ width: '100%', marginBottom: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount Due</div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>
                      ₹{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, padding: '18px', fontSize: 16 }} onClick={() => setActiveMethod(null)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 2, padding: '18px', fontSize: 16 }} onClick={handleApplyPayment} disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : `Process ${activeMethod.name} Payment`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Ledger */}
      <div style={{ width: 440, background: 'var(--bg-card)', borderLeft: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Order Summary</h2>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {cart.length} items {orderNumber ? `· ${orderNumber}` : ''}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {cart.map((item, i) => (
              <div key={item.id || i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>x{item.qty}</span>
                </div>
                <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px dashed var(--border-default)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
              <span style={{ fontWeight: 800 }}>₹{totalAmount.toLocaleString()}</span>
            </div>

            {payments.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, background: 'var(--bg-canvas)', padding: '12px 16px', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Paid ({p.method})</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>- ₹{p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Status Logic */}
        <div style={{ padding: '24px 40px', background: 'var(--bg-canvas)', borderTop: '1px solid var(--border-light)' }}>
          {remaining > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{paymentState === 'partial' ? 'Partial Balance' : 'Balance Due'}</span>
                <span style={{ fontSize: 32, fontWeight: 800, color: paymentState === 'partial' ? 'var(--accent-orange)' : 'var(--text-primary)' }}>₹{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {change > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent-orange-light)', color: 'var(--accent-orange)', padding: '16px 20px', borderRadius: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Change Due to Customer</span>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>₹{change.toLocaleString()}</span>
                </div>
              )}
              <button className="btn btn-primary" style={{ width: '100%', padding: '20px', fontSize: 18, background: 'var(--accent-green)' }} onClick={handleFinish}>
                <CheckCircle2 size={22} style={{ marginRight: 8 }} /> Complete Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
