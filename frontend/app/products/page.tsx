'use client'
import { useState, useEffect } from 'react'
import { PackagePlus, Search, Tags, Filter, MoreHorizontal, AlertCircle, Edit2, X, Trash2, Image as ImageIcon, Upload } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('All')
  
  // Add product states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'Beverages', price: 0, stock: 'In stock', qty: 0, image: '' })
  
  // Edit product states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>({ id: null, name: '', category: '', price: 0, stock: 'In stock', qty: 0, image: '' })
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(['All', ...data.map((c: any) => c.name)])
        }
      })
      .catch(err => console.error('Error fetching categories:', err))
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (isEditMode) {
          setEditingItem((prev: any) => ({ ...prev, image: data.url }))
        } else {
          setNewItem((prev: any) => ({ ...prev, image: data.url }))
        }
      } else {
        alert('Failed to upload image.')
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Error uploading image.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Default the stock based on initial qty input
    const computedStock = newItem.qty > 0 ? 'In stock' : 'Out of stock'
    const finalImage = newItem.image.trim() || '📦'

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, stock: computedStock, image: finalImage })
      })

      if (response.ok) {
        const savedProduct = await response.json()
        setProducts([savedProduct, ...products])
        setIsAddModalOpen(false)
        setNewItem({ name: '', category: 'Beverages', price: 0, stock: 'In stock', qty: 0, image: '' })
      } else {
        alert('Failed to save to database.')
      }
    } catch(err) {
      alert('Error saving product.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClick = (product: any) => {
    setEditingItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      qty: product.qty,
      image: product.image && product.image !== '📦' ? product.image : ''
    })
    setIsEditModalOpen(true)
  }

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const computedStock = editingItem.qty > 0 ? 'In stock' : 'Out of stock'
    const finalImage = editingItem.image.trim() || '📦'

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingItem, stock: computedStock, image: finalImage })
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(products.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
        setIsEditModalOpen(false)
      } else {
        alert('Failed to update product in database.')
      }
    } catch(err) {
      alert('Error updating product.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to remove this product? This will soft-delete the item so historic orders are preserved.')) return
    setIsSaving(true)

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id))
        setIsEditModalOpen(false)
      } else {
        alert('Failed to delete product from database.')
      }
    } catch(err) {
      alert('Error deleting product.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = activeCat === 'All' || p.category === activeCat
    return matchesSearch && matchesCat
  })

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontSize: 16 }}>Loading products from database...</div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Products & Menu</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage menu items, categories, pricing, and stock.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '10px 20px', border: '1px solid var(--border-default)' }}>
            <Tags size={16} /> Manage Categories
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ padding: '10px 20px' }}>
            <PackagePlus size={16} /> Add Item
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: activeCat === cat ? 'var(--text-primary)' : 'var(--bg-card)',
                color: activeCat === cat ? '#fff' : 'var(--text-primary)',
                border: activeCat === cat ? 'none' : '1px solid var(--border-default)',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products..."
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
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Product</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Category</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Pricing</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Inventory Status</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Metrics</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, background: 'var(--bg-canvas)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden' }}>
                      {p.image && (p.image.startsWith('http') || p.image.startsWith('/products/')) ? (
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        p.image || '📦'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>PRD-{p.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ fontSize: 13, background: 'var(--bg-canvas)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-light)' }}>
                    {p.category}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>₹{p.price}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>+{p.tax}% tax</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: p.stock === 'In stock' ? 'var(--accent-green)' : p.stock === 'Low' ? 'var(--accent-orange)' : 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.stock}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.qty} units left</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', width: 90 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sales:</span> <span style={{ fontWeight: 600 }}>{p.sales}</span>
                    </div>
                    <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', width: 90 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Rating:</span> <span style={{ fontWeight: 600 }}>★ {p.rating}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <button className="btn btn-ghost" onClick={() => handleEditClick(p)} style={{ padding: 8, marginRight: 4 }} title="Edit Product">
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleDeleteItem(p.id)} style={{ padding: 8, color: 'var(--accent-red)' }} title="Remove Product">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-card)', padding: 32, borderRadius: 16, width: 440, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Product Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Category</label>
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Price (₹)</label>
                  <input required type="number" min="0" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Initial Qty</label>
                  <input required type="number" min="0" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: Number(e.target.value)})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Product Image</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {/* Preview box */}
                  <div style={{
                    width: 64, height: 64, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 28
                  }}>
                    {newItem.image && (newItem.image.startsWith('http') || newItem.image.startsWith('/products/')) ? (
                      <img src={newItem.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      newItem.image || '📦'
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{
                      padding: '8px 12px', border: '1px dashed var(--border-default)', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', textAlign: 'center', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s', color: 'var(--text-primary)'
                    }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-default)'}>
                      <Upload size={14} />
                      {isUploading ? 'Uploading...' : 'Choose File from PC'}
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, false)} style={{ display: 'none' }} disabled={isUploading} />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter path / URL / emoji"
                      value={newItem.image}
                      onChange={e => setNewItem({...newItem, image: e.target.value})}
                      style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-default)', borderRadius: 6, background: 'var(--bg-canvas)', fontSize: 11, color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={isSaving || isUploading} style={{ width: '100%', padding: 12 }}>
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-card)', padding: 32, borderRadius: 16, width: 440, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Edit Product Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditItem} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Product Name</label>
                <input required type="text" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Category</label>
                <select value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Price (₹)</label>
                  <input required type="number" min="0" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Current Qty</label>
                  <input required type="number" min="0" value={editingItem.qty} onChange={e => setEditingItem({...editingItem, qty: Number(e.target.value)})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Product Image</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {/* Preview box */}
                  <div style={{
                    width: 64, height: 64, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 28
                  }}>
                    {editingItem.image && (editingItem.image.startsWith('http') || editingItem.image.startsWith('/products/')) ? (
                      <img src={editingItem.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      editingItem.image || '📦'
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{
                      padding: '8px 12px', border: '1px dashed var(--border-default)', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', textAlign: 'center', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s', color: 'var(--text-primary)'
                    }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-default)'}>
                      <Upload size={14} />
                      {isUploading ? 'Uploading...' : 'Choose File from PC'}
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, true)} style={{ display: 'none' }} disabled={isUploading} />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter path / URL / emoji"
                      value={editingItem.image}
                      onChange={e => setEditingItem({...editingItem, image: e.target.value})}
                      style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-default)', borderRadius: 6, background: 'var(--bg-canvas)', fontSize: 11, color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => handleDeleteItem(editingItem.id)} className="btn btn-ghost" disabled={isSaving || isUploading} style={{ flex: 1, padding: 12, color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>
                  Delete Item
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving || isUploading} style={{ flex: 2, padding: 12 }}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
