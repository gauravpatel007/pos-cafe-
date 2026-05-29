'use client'
import { useState, useEffect } from 'react'
import { UserPlus, Shield, Clock, Search, Coffee, Trash2 } from 'lucide-react'

const initialStaff = [
  { id: 'STF-01', name: 'John Doe', role: 'Admin', status: 'On Shift', shiftStart: '08:00 AM', ordersServed: 42, salesTotal: 12500, avatar: 'JD' },
  { id: 'STF-02', name: 'Jane Smith', role: 'Manager', status: 'On Shift', shiftStart: '09:00 AM', ordersServed: 18, salesTotal: 6200, avatar: 'JS' },
  { id: 'STF-03', name: 'Mike Johnson', role: 'Cashier', status: 'On Break', shiftStart: '07:30 AM', ordersServed: 54, salesTotal: 18900, avatar: 'MJ' },
  { id: 'STF-04', name: 'Sarah Wilson', role: 'Kitchen Staff', status: 'On Shift', shiftStart: '06:00 AM', ordersServed: '-', salesTotal: '-', avatar: 'SW' },
  { id: 'STF-05', name: 'Dave Brown', role: 'Waiter', status: 'Off Today', shiftStart: '-', ordersServed: '-', salesTotal: '-', avatar: 'DB' },
]

export default function UsersRolesPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Cashier' })

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) setStaff(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      })
      if (res.ok) {
        setNewStaff({ name: '', role: 'Cashier' })
        setShowAddModal(false)
        loadStaff()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return
    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      loadStaff()
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'On Shift') return 'var(--accent-green)'
    if (status === 'On Break') return 'var(--accent-orange)'
    return 'var(--text-muted)'
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return { bg: '#fee2e2', color: '#b91c1c' }
      case 'Manager': return { bg: '#e0e7ff', color: '#4338ca' }
      case 'Cashier': return { bg: '#dcfce7', color: '#15803d' }
      case 'Kitchen Staff': return { bg: '#ffedd5', color: '#c2410c' }
      default: return { bg: '#f3f4f6', color: '#374151' }
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Users & Roles</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage staff accounts, assign roles, and track shifts.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search staff..."
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
            <UserPlus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Staff', value: staff.length, color: 'var(--accent-blue)' },
          { label: 'On Shift', value: staff.filter(s => s.status === 'On Shift').length, color: 'var(--accent-green)' },
          { label: 'On Break', value: staff.filter(s => s.status === 'On Break').length, color: 'var(--accent-orange)' },
          { label: 'Off Today', value: staff.filter(s => s.status === 'Off Today').length, color: 'var(--text-muted)' },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-card)', padding: 24, borderRadius: 16,
            border: `1px solid var(--border-default)`, borderLeft: `4px solid ${kpi.color}`
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>{kpi.label}</div>
          </div>
        ))}
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
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Staff Member</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Performance</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((s, i) => {
              const roleBadge = getRoleBadge(s.role)
              return (
                <tr key={s.id} style={{
                  borderBottom: i < staff.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 20,
                        background: 'var(--bg-canvas)', border: '1px solid var(--border-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, color: 'var(--text-primary)'
                      }}>
                        {s.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: roleBadge.bg, color: roleBadge.color,
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                    }}>
                      <Shield size={14} />
                      {s.role}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: 4, background: getStatusColor(s.status)
                      }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.status}</div>
                        {s.shiftStart !== '-' && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> Shift started {s.shiftStart}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {s.ordersServed !== '-' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 13 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Orders: </span>
                          <span style={{ fontWeight: 600 }}>{s.ordersServed}</span>
                        </div>
                        <div style={{ fontSize: 13 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Sales: </span>
                          <span style={{ fontWeight: 600 }}>₹{s.salesTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ padding: 8, color: 'var(--accent-red)' }} onClick={() => handleDelete(s.id)}>
                      <Trash2 size={16} />
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
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>New Staff Member</h2>
            
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input required className="form-input" placeholder="e.g. Alice Cooper" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-input form-select" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Kitchen Staff">Kitchen Staff</option>
                <option value="Waiter">Waiter</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Staff</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
