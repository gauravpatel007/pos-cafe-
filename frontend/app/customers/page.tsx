'use client'
import { useState, useEffect } from 'react'
import { Search, UserPlus, Phone, Calendar, DollarSign, Award, Star, History } from 'lucide-react'

const initialCustomers = [
  { id: 'CUST-001', name: 'Alisha Singh', phone: '+91 98765 43210', visits: 42, totalSpend: 15400, lastVisit: 'Today', tier: 'Platinum' },
  { id: 'CUST-002', name: 'Raj Kumar', phone: '+91 87654 32109', visits: 18, totalSpend: 5200, lastVisit: 'Yesterday', tier: 'Gold' },
  { id: 'CUST-003', name: 'Neha Sharma', phone: '+91 76543 21098', visits: 5, totalSpend: 1200, lastVisit: '4 days ago', tier: 'Bronze' },
  { id: 'CUST-004', name: 'Arjun Das', phone: '+91 65432 10987', visits: 27, totalSpend: 9800, lastVisit: '2 hours ago', tier: 'Gold' },
  { id: 'CUST-005', name: 'Priya Verma', phone: '+91 54321 09876', visits: 64, totalSpend: 23100, lastVisit: 'Today', tier: 'Platinum' },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCust, setNewCust] = useState({ name: '', phone: '' })

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) setCustomers(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      })
      if (res.ok) {
        setNewCust({ name: '', phone: '' })
        setShowAddModal(false)
        loadCustomers()
      }
    } catch(err) {
      console.error('Error adding customer', err)
    }
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const getTierColor = (tier: string) => {
    if (tier === 'Platinum') return { bg: '#e5e7eb', text: '#374151', icon: '#6b7280' }
    if (tier === 'Gold') return { bg: '#fef08a', text: '#854d0e', icon: '#eab308' }
    return { bg: '#ffedd5', text: '#9a3412', icon: '#f97316' } // Bronze
  }

  return (
    <div className="animate-fade-in" style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Customers</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage relationships, loyalty tiers, and visit history.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '10px 16px 10px 36px',
                borderRadius: 8,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-card)',
                width: 280,
                fontSize: 14
              }}
            />
          </div>
          <button className="btn btn-primary" style={{ padding: '10px 20px' }} onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Customer Details</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Contact Info</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Loyalty Tier</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Engagement</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const tier = getTierColor(c.tier)
              return (
                <tr key={c.id} style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.2s',
                }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 20,
                        background: 'var(--accent-blue-light)', color: 'var(--accent-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 15
                      }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                      <Phone size={14} color="var(--text-muted)" />
                      {c.phone}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: tier.bg, color: tier.text,
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                    }}>
                      <Award size={14} color={tier.icon} />
                      {c.tier}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)', width: 70 }}>Visits:</span>
                        <span style={{ fontWeight: 600 }}>{c.visits}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)', width: 70 }}>Spend:</span>
                        <span style={{ fontWeight: 600 }}>₹{c.totalSpend.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)', width: 70 }}>Last seen:</span>
                        <span>{c.lastVisit}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ padding: 8 }}>
                      <History size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: 8 }}>
                      <Star size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form className="animate-slide-in" onSubmit={handleAddSubmit} style={{ width: 400, background: 'var(--bg-card)', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>New Customer</h2>
            
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input required className="form-input" placeholder="e.g. John Doe" value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input required className="form-input" placeholder="e.g. +91 9876543210" value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Customer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
