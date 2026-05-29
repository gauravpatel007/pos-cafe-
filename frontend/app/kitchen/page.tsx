'use client'
import { useState, useEffect, useRef } from 'react'
import { ChefHat, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

type TicketItem = {
  id: number
  name: string
  quantity: number
  is_done: boolean
}

type KitchenTicket = {
  id: number
  order_id: number
  order_number: string
  table_name: string
  priority: string
  status: string
  elapsed_seconds: number
  items: TicketItem[]
}

export default function KitchenPage() {
  const [tickets, setTickets] = useState<KitchenTicket[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/kitchen', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data)) setTickets(data)
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
    intervalRef.current = setInterval(fetchTickets, 5000) // Auto-refresh every 5s
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const toggleItemDone = async (ticketId: number, itemId: number, isDone: boolean) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, items: t.items.map(i => i.id === itemId ? { ...i, is_done: isDone } : i) }
        : t
    ))
    await fetch('/api/kitchen', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, isDone }),
    })
  }

  const markReady = async (ticketId: number) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId))
    await fetch('/api/kitchen', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status: 'ready' }),
    })
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const getTimeColor = (seconds: number) => {
    if (seconds > 900) return 'var(--accent-red)'    // > 15 min
    if (seconds > 600) return 'var(--accent-orange)'  // > 10 min
    return 'var(--accent-green)'
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <ChefHat size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)' }}>Loading kitchen display...</div>
        </div>
      </div>
    )
  }

  const toCook = tickets.filter(t => t.status === 'to_cook')
  const cooking = tickets.filter(t => t.status === 'cooking')

  return (
    <div className="animate-fade-in" style={{ padding: 32, flex: 1, overflowY: 'auto', background: '#0f0f0f', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>
            <ChefHat size={28} style={{ display: 'inline', marginRight: 12 }} />
            Kitchen Display
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            {tickets.length} active tickets · Auto-refreshes every 5s
          </p>
        </div>
      </div>

      {tickets.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)',
        }}>
          <ChefHat size={60} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All caught up! 🎉</div>
          <div style={{ fontSize: 14 }}>No pending kitchen tickets</div>
        </div>
      )}

      {/* Tickets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {tickets.map(ticket => {
          const allDone = ticket.items.every(i => i.is_done)
          const timeColor = getTimeColor(ticket.elapsed_seconds)
          return (
            <div
              key={ticket.id}
              style={{
                background: '#1a1a1a', border: `2px solid ${ticket.priority === 'urgent' ? 'var(--accent-red)' : '#333'}`,
                borderRadius: 16, overflow: 'hidden',
                transition: 'transform 0.15s ease',
              }}
            >
              {/* Ticket header */}
              <div style={{
                padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #333',
                background: ticket.priority === 'urgent' ? 'rgba(226,33,52,0.1)' : 'transparent',
              }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{ticket.order_number}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{ticket.table_name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    color: timeColor, fontWeight: 700, fontSize: 14,
                  }}>
                    <Clock size={14} />
                    {formatTime(ticket.elapsed_seconds)}
                  </div>
                  {ticket.priority === 'urgent' && (
                    <AlertTriangle size={16} color="var(--accent-red)" />
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '12px 20px' }}>
                {ticket.items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemDone(ticket.id, item.id, !item.is_done)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0',
                      borderBottom: '1px solid #2a2a2a',
                      cursor: 'pointer',
                      opacity: item.is_done ? 0.4 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: `2px solid ${item.is_done ? 'var(--accent-green)' : '#555'}`,
                      background: item.is_done ? 'var(--accent-green)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {item.is_done && <CheckCircle2 size={14} color="white" />}
                    </div>
                    <span style={{
                      color: 'white', fontWeight: 600, fontSize: 14, flex: 1,
                      textDecoration: item.is_done ? 'line-through' : 'none',
                    }}>
                      {item.name}
                    </span>
                    <span style={{
                      color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 16,
                      background: '#333', padding: '2px 10px', borderRadius: 8,
                    }}>
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mark Ready button */}
              <div style={{ padding: '12px 20px 16px' }}>
                <button
                  onClick={() => markReady(ticket.id)}
                  disabled={!allDone}
                  style={{
                    width: '100%', padding: 14, border: 'none', borderRadius: 10,
                    background: allDone ? 'var(--accent-green)' : '#333',
                    color: allDone ? 'white' : '#666',
                    fontWeight: 700, fontSize: 14,
                    cursor: allDone ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.15s',
                  }}
                >
                  <CheckCircle2 size={16} />
                  {allDone ? 'Mark as Ready' : 'Complete all items first'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
