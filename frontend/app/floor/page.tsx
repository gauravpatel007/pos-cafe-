'use client'
import { useState, useEffect } from 'react'
import { Users, Clock, DollarSign } from 'lucide-react'
import TableActionModal, {
  FloorTable, TableOrder, CartItem, ReservationInfo
} from '@/components/TableActionModal'

type Floor = {
  id: number
  name: string
  tables: FloorTable[]
}

export default function FloorPage() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [activeFloor, setActiveFloor] = useState<number>(0)
  const [selectedTable, setSelectedTable] = useState<FloorTable | null>(null)
  const [tableOrders, setTableOrders] = useState<Record<number, TableOrder>>({})
  const [reservations, setReservations] = useState<Record<number, ReservationInfo>>({})
  const [dbMenuItems, setDbMenuItems] = useState<any[]>([])
  const [dbCategories, setDbCategories] = useState<string[]>(['All'])

  useEffect(() => {
    // Fetch floor plan data
    fetch('/api/floors', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFloors(data)
          // Reconstruct tableOrders from server state
          const ordersMap: Record<number, TableOrder> = {}
          data.forEach(f => {
            f.tables.forEach((t: any) => {
              if (t.status === 'occupied' && t.order && t.items && t.items.length > 0) {
                ordersMap[t.id] = { orderId: t.order, items: t.items, status: 'active', startedAt: t.duration || '' }
              }
            })
          })
          setTableOrders(ordersMap)
        } else {
          setFloors([{ id: 1, name: 'Ground Floor', tables: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `T${i + 1}`, capacity: 4, status: 'available' })) }])
        }
      })
      .catch(() => setFloors([{ id: 1, name: 'Ground Floor', tables: [] }]))

    // Fetch dynamic menu for tables
    Promise.all([
      fetch('/api/products', { cache: 'no-store' }), 
      fetch('/api/categories', { cache: 'no-store' })
    ])
      .then(async ([pRes, cRes]) => {
        if (pRes.ok) setDbMenuItems(await pRes.json())
        if (cRes.ok) {
          const cats = await cRes.json()
          setDbCategories(['All', ...cats.map((c: any) => c.name)])
        }
      })
      .catch(err => console.error('Error fetching menus', err))
  }, [])

  const currentFloor = floors[activeFloor]

  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    available: { bg: '#e6f7ee', border: '#00b259', text: '#00b259' },
    occupied: { bg: '#fff8ec', border: '#f5a623', text: '#f5a623' },
    reserved: { bg: '#e8f0ff', border: '#006aff', text: '#006aff' },
    maintenance: { bg: '#fde8ea', border: '#e22134', text: '#e22134' },
  }

  const handleBook = (tableId: number, info: ReservationInfo) => {
    setReservations(prev => ({ ...prev, [tableId]: info }))
    setFloors(prev => prev.map(f => ({
      ...f,
      tables: f.tables.map(t => t.id === tableId ? { ...t, status: 'reserved', reservation: info.guestName } : t),
    })))
  }

  const handleStartOrder = async (tableId: number, items: CartItem[]) => {
    try {
      const source = `Table ${tableId}`
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, items, tableId })
      })
      if (res.ok) {
        const data = await res.json()
        const orderIdStr = data.order_number
        
        // Auto-send to kitchen for Floor Plan orders
        await fetch(`/api/orders/${data.id}/send-to-kitchen`, { method: 'POST' })

        setTableOrders(prev => ({
          ...prev,
          [tableId]: { orderId: orderIdStr, items, status: 'active', startedAt: new Date().toISOString() },
        }))
        setFloors(prev => prev.map(f => ({
          ...f,
          tables: f.tables.map(t => t.id === tableId ? {
            ...t, status: 'occupied', order: orderIdStr,
            amount: items.reduce((s, c) => s + c.price * c.qty, 0),
          } : t),
        })))
      }
    } catch (e) {
      console.error('Failed to start order:', e)
    }
  }

  const handleAddItems = (tableId: number, items: CartItem[]) => {
    setTableOrders(prev => {
      const existing = prev[tableId]
      if (!existing) return prev
      return {
        ...prev,
        [tableId]: { ...existing, items: [...existing.items, ...items] },
      }
    })
  }

  const handleCheckout = (tableId: number) => {
    setTableOrders(prev => {
      const { [tableId]: _, ...rest } = prev
      return rest
    })
    setFloors(prev => prev.map(f => ({
      ...f,
      tables: f.tables.map(t => t.id === tableId ? {
        ...t, status: 'available', order: null, amount: 0, duration: undefined,
      } : t),
    })))
  }

  const handleCancelReservation = (tableId: number) => {
    setReservations(prev => {
      const { [tableId]: _, ...rest } = prev
      return rest
    })
    setFloors(prev => prev.map(f => ({
      ...f,
      tables: f.tables.map(t => t.id === tableId ? { ...t, status: 'available', reservation: undefined } : t),
    })))
  }

  const handleSeatGuests = (tableId: number) => {
    handleCancelReservation(tableId)
    setFloors(prev => prev.map(f => ({
      ...f,
      tables: f.tables.map(t => t.id === tableId ? { ...t, status: 'occupied' } : t),
    })))
  }

  // Counts
  const totalTables = currentFloor?.tables.length || 0
  const occupiedCount = currentFloor?.tables.filter(t => t.status === 'occupied').length || 0
  const availableCount = currentFloor?.tables.filter(t => t.status === 'available').length || 0
  const reservedCount = currentFloor?.tables.filter(t => t.status === 'reserved').length || 0

  return (
    <div className="animate-fade-in" style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Floor Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage tables, reservations, and orders</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="badge badge-green" style={{ padding: '8px 14px', fontSize: 13 }}>
            {availableCount} Available
          </div>
          <div className="badge badge-orange" style={{ padding: '8px 14px', fontSize: 13 }}>
            {occupiedCount} Occupied
          </div>
          <div className="badge badge-blue" style={{ padding: '8px 14px', fontSize: 13 }}>
            {reservedCount} Reserved
          </div>
        </div>
      </div>

      {/* Floor tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {floors.map((floor, i) => (
          <button
            key={floor.id}
            onClick={() => setActiveFloor(i)}
            style={{
              padding: '10px 24px', borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-default)',
              background: activeFloor === i ? 'var(--text-primary)' : 'white',
              color: activeFloor === i ? 'white' : 'var(--text-primary)',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {floor.name}
          </button>
        ))}
      </div>

      {/* Tables grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {currentFloor?.tables.map(table => {
          const sc = statusColors[table.status] || statusColors.available
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              style={{
                background: sc.bg, border: `2px solid ${sc.border}`,
                borderRadius: 16, padding: 20, cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.15s ease',
                display: 'flex', flexDirection: 'column', gap: 8, minHeight: 140,
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: sc.border,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800,
                }}>
                  {table.name}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: sc.text,
                  padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.8)',
                }}>
                  {table.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <Users size={12} /> {table.capacity} seats
              </div>

              {table.status === 'occupied' && (
                <>
                  {table.order && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: sc.text }}>{table.order}</div>
                  )}
                  {table.amount && table.amount > 0 && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{table.amount.toLocaleString()}
                    </div>
                  )}
                  {table.duration && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {table.duration}
                    </div>
                  )}
                </>
              )}

              {table.status === 'reserved' && table.reservation && (
                <div style={{ fontSize: 12, fontWeight: 600, color: sc.text }}>
                  🗓 {table.reservation}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Table Action Modal */}
      {selectedTable && (
        <TableActionModal
          table={selectedTable}
          tableOrder={tableOrders[selectedTable.id]}
          reservation={reservations[selectedTable.id]}
          menuItems={dbMenuItems}
          menuCategories={dbCategories}
          onClose={() => setSelectedTable(null)}
          onBook={handleBook}
          onStartOrder={handleStartOrder}
          onAddItems={handleAddItems}
          onCheckout={handleCheckout}
          onCancelReservation={handleCancelReservation}
          onSeatGuests={handleSeatGuests}
        />
      )}
    </div>
  )
}
