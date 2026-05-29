'use client'
import { useState, useEffect } from 'react'
import { CreditCard, Smartphone, Banknote, ShieldCheck, Download, ExternalLink } from 'lucide-react'

const initialTransactions = [
  { id: 'TXN-08992', orderId: '#ORD-7032', method: 'UPI Quick Pay', amount: 850, status: 'Completed', time: '10:42 AM', gateway: 'Razorpay' },
  { id: 'TXN-08991', orderId: '#ORD-7031', method: 'Card Terminal', amount: 1420, status: 'Completed', time: '10:35 AM', gateway: 'Stripe' },
  { id: 'TXN-08990', orderId: '#ORD-7030', method: 'Cash', amount: 200, status: 'Completed', time: '10:30 AM', gateway: 'Manual' },
  { id: 'TXN-08989', orderId: '#ORD-7029', method: 'UPI Quick Pay', amount: 1100, status: 'Completed', time: '10:15 AM', gateway: 'Razorpay' },
  { id: 'TXN-08988', orderId: '#ORD-7028', method: 'Card Terminal', amount: 450, status: 'Refunded', time: '09:55 AM', gateway: 'Stripe' },
]

export default function PaymentsPage() {
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(t => ({
            id: `TXN-${String(t.id).padStart(5, '0')}`,
            orderId: t.order_number || `#ORD-${t.order_id}`,
            method: t.method,
            amount: Number(t.amount),
            status: t.status === 'success' ? 'Completed' : 'Refunded',
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            gateway: t.method.includes('UPI') ? 'Razorpay' : t.method.includes('Card') ? 'Stripe' : 'Manual'
          }))
          setTxns(formatted)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch transactions:", err)
        setLoading(false)
      })
  }, [])

  const getMethodIcon = (method: string) => {
    if (method.includes('UPI')) return <Smartphone size={16} color="var(--accent-blue)" />
    if (method.includes('Card')) return <CreditCard size={16} color="var(--accent-orange)" />
    return <Banknote size={16} color="var(--accent-green)" />
  }

  return (
    <div className="animate-fade-in" style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Payments & Integrations</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage gateways, transactions, and payment methods.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '10px 20px', border: '1px solid var(--border-default)' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Stripe Integration</div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Active - Connected</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Used for Credit/Debit Cards & Apple/Google Pay. Supports QR generation.</div>
          <button className="btn btn-ghost" style={{ width: '100%', border: '1px solid var(--border-default)', fontSize: 13 }}>Configure Stripe <ExternalLink size={14} /></button>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'var(--accent-orange-light)', color: 'var(--accent-orange)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>UPI Quick Pay</div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Active - Razorpay</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Dynamic UPI QR codes with real-time payment confirmation.</div>
          <button className="btn btn-ghost" style={{ width: '100%', border: '1px solid var(--border-default)', fontSize: 13 }}>Configure UPI <ExternalLink size={14} /></button>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'var(--accent-green-light)', color: 'var(--accent-green)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Feedback Loop</div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Active - Rating enabled</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Post-payment 1-5 stars rating system and optional feedback collection.</div>
          <button className="btn btn-ghost" style={{ width: '100%', border: '1px solid var(--border-default)', fontSize: 13 }}>View Feedback <ExternalLink size={14} /></button>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h2>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Transaction ID / Time</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Order ID</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Method</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Amount</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < txns.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t.time}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent-blue)', cursor: 'pointer' }}>{t.orderId}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getMethodIcon(t.method)}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{t.method}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.gateway}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>₹{t.amount.toLocaleString()}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                   <span style={{ 
                     background: t.status === 'Completed' ? 'var(--accent-green-light)' : '#fee2e2', 
                     color: t.status === 'Completed' ? 'var(--accent-green)' : '#b91c1c', 
                     padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 
                    }}>
                     {t.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
