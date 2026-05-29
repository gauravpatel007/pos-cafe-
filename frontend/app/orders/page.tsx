'use client'
import { useState, useEffect } from 'react'
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'

const initialOrders = [
  { id: '#ORD-7032', table: 'Table 4', staff: 'Jane Smith', items: 3, amount: 850, status: 'Paid', time: '10:42 AM' },
  { id: '#ORD-7031', table: 'Table 2', staff: 'John Doe', items: 5, amount: 1420, status: 'Kitchen', time: '10:35 AM' },
  { id: '#ORD-7030', table: 'Takeaway', staff: 'Mike J', items: 1, amount: 200, status: 'Open', time: '10:30 AM' },
  { id: '#ORD-7029', table: 'Table 8', staff: 'Jane Smith', items: 4, amount: 1100, status: 'Paid', time: '10:15 AM' },
  { id: '#ORD-7028', table: 'Table 1', staff: 'Sarah W', items: 2, amount: 450, status: 'Void', time: '09:55 AM' },
  { id: '#ORD-7027', table: 'Table 5', staff: 'John Doe', items: 8, amount: 2800, status: 'Paid', time: '09:30 AM' },
]

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(o => {
            let orderStatus = 'Open';
            if (o.status === 'paid') orderStatus = 'Paid';
            else if (o.status === 'kitchen' || o.status === 'ready') orderStatus = 'Kitchen';
            else if (o.status === 'void' || o.status === 'cancelled') orderStatus = 'Void';
            
            return {
              id: `#${o.order_number}`,
              table: o.table_name || o.source || 'Takeaway',
              staff: o.created_by ? `User ${o.created_by}` : 'Cashier',
              items: parseInt(o.item_count) || 0,
              amount: Number(o.grand_total),
              status: orderStatus,
              time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date(o.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
            }
          })
          setOrders(formatted)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err)
        setLoading(false)
      })
  }, [])

  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')

  const tabs = ['All', 'Open', 'Kitchen', 'Paid', 'Void']

  const filteredOrders = orders.filter(o => {
    const matchesTab = activeTab === 'All' || o.status === activeTab
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.table.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <span style={{ background: 'var(--accent-green-light)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Paid</span>
      case 'Open': return <span style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Open</span>
      case 'Kitchen': return <span style={{ background: 'var(--accent-orange-light)', color: 'var(--accent-orange)', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Kitchen</span>
      case 'Void': return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Void</span>
      default: return null
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Order History</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Track, filter, and manage all your store orders.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '10px 20px', border: '1px solid var(--border-default)' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: activeTab === tab ? 'var(--text-primary)' : 'var(--bg-card)',
                color: activeTab === tab ? '#fff' : 'var(--text-primary)',
                border: activeTab === tab ? 'none' : '1px solid var(--border-default)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID or Table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '8px 16px 8px 36px', borderRadius: 8, border: '1px solid var(--border-default)',
                background: 'var(--bg-card)', width: 220, fontSize: 13
              }}
            />
          </div>
          <button className="btn btn-ghost" style={{ padding: 8, background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Order ID & Time</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Table / Source</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Staff</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Items</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Amount</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: i < filteredOrders.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{o.time}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{o.table}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, background: 'var(--bg-canvas)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                      {o.staff.charAt(0)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{o.staff}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ fontSize: 14 }}>{o.items} items</span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>₹{o.amount.toLocaleString()}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  {getStatusBadge(o.status)}
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <button className="btn btn-ghost" style={{ padding: 8 }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No orders found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
