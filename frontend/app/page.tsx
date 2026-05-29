'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp, DollarSign, ShoppingBag, Users,
  ArrowUpRight, ArrowDownRight, Clock, ChefHat
} from 'lucide-react'

type DashboardData = {
  revenue: number
  orderCount: number
  avgOrderValue: number
  activeTables: string
  paymentBreakdown: { method: string; amount: number; pct: number; color: string }[]
  recentOrders: { id: string; table: string; items: number; amount: number; status: string; time: string; staff: string }[]
  salesChartData: { time: string; today: number; yesterday: number }[]
  topProducts: { product_name: string; units_sold: number; revenue: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>☕</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' }}>Loading dashboard...</div>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Today's Revenue", value: `₹${(data?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'var(--accent-green)', bg: 'var(--accent-green-light)', trend: '+12%' },
    { label: 'Total Orders', value: String(data?.orderCount || 0), icon: ShoppingBag, color: 'var(--accent-blue)', bg: 'var(--accent-blue-light)', trend: '+8%' },
    { label: 'Avg Order Value', value: `₹${data?.avgOrderValue || 0}`, icon: TrendingUp, color: 'var(--accent-orange)', bg: 'var(--accent-orange-light)', trend: '+5%' },
    { label: 'Active Tables', value: data?.activeTables || '0 / 0', icon: Users, color: 'var(--text-primary)', bg: '#f0f0f0', trend: '' },
  ]

  return (
    <div className="animate-fade-in" style={{ padding: 32, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Welcome back! Here's your store overview.</p>
        </div>
        <Link href="/pos/order" className="btn btn-primary" style={{ padding: '12px 24px' }}>
          <ShoppingBag size={16} /> New Order
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                </div>
                {stat.trend && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>
                    <ArrowUpRight size={14} /> {stat.trend}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Recent Orders */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Recent Orders</div>
            <span className="badge badge-blue">{data?.recentOrders?.length || 0} orders</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {(data?.recentOrders || []).map((order, i) => (
              <div key={order.id} style={{
                padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: i < (data?.recentOrders?.length || 0) - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: order.status === 'paid' ? 'var(--accent-green-light)' : 'var(--accent-orange-light)',
                    color: order.status === 'paid' ? 'var(--accent-green)' : 'var(--accent-orange)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                  }}>
                    {order.table.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{order.id}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.table} · {order.items} items</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>₹{order.amount}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.time}</div>
                </div>
              </div>
            ))}
            {(!data?.recentOrders || data.recentOrders.length === 0) && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Payment Breakdown + Top Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Payment Breakdown */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Payment Breakdown</div>
            {(data?.paymentBreakdown || []).map(p => (
              <div key={p.method} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.method}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>₹{p.amount.toLocaleString()} ({p.pct}%)</span>
                </div>
                <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
            {(!data?.paymentBreakdown || data.paymentBreakdown.length === 0) && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No payments today</div>
            )}
          </div>

          {/* Top Products */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top Products</div>
            {(data?.topProducts || []).slice(0, 5).map((p, i) => (
              <div key={p.product_name} style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: 'var(--bg-canvas)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.product_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.units_sold} sold</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>₹{Number(p.revenue).toLocaleString()}</div>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No product data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
