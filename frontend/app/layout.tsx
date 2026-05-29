'use client'
import './globals.css'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed,
  ChefHat, BarChart3, Settings, Coffee, ListOrdered, Package,
  Users, UserCog, CreditCard
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Order History', icon: ListOrdered },
  { href: '/pos/order', label: 'POS Terminal', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/floor', label: 'Floor Plan', icon: UtensilsCrossed },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/kitchen', label: 'Kitchen Display', icon: ChefHat },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/users-roles', label: 'Users & Roles', icon: UserCog },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // POS pages use a minimal top-nav layout (no sidebar)
  const isPOSPage = pathname?.startsWith('/pos')

  if (isPOSPage) {
    return (
      <html lang="en">
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </head>
        <body>
          {/* Top nav bar for POS */}
          <div className="topnav">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-primary)' }}>
                <Coffee size={22} />
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>CaféPOS</span>
              </Link>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
                {pathname === '/pos/order' ? 'POS Terminal' : 'Payment'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/pos/order" className="btn btn-ghost" style={{ fontSize: 13 }}>
                <ShoppingCart size={15} /> Orders
              </Link>
              <Link href="/floor" className="btn btn-ghost" style={{ fontSize: 13 }}>
                <UtensilsCrossed size={15} /> Floor
              </Link>
              <Link href="/kitchen" className="btn btn-ghost" style={{ fontSize: 13 }}>
                <ChefHat size={15} /> Kitchen
              </Link>
              <Link href="/" className="btn btn-ghost" style={{ fontSize: 13 }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            </div>
          </div>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Coffee size={24} />
                <span>CaféPOS</span>
              </div>
            </div>
            <nav className="sidebar-nav">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              POS Cafe v1.0 · Odoo Hackathon
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
