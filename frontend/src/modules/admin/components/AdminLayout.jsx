import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { ExternalLink, HelpCircle, Inbox, LayoutDashboard, LogOut, Menu, Package, Settings, Tags, UserCog } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { useAuth } from './authState.js'
import useKitOff from './useKitOff.js'
import useBrand from './useBrand.js'
import '../admin.css'

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: true },
  { to: '/admin/settings', label: 'Site settings', icon: Settings },
  { to: '/admin/faqs', label: 'Questions', icon: HelpCircle },
  { to: '/admin/account', label: 'Account', icon: UserCog },
]

export default function AdminLayout() {
  useKitOff()
  const brand = useBrand()
  const { email, checking, signOut } = useAuth()
  const { pathname } = useLocation()
  // The menu is open "at" a path, so it closes by itself when the page changes.
  const [openAt, setOpenAt] = useState(null)
  const open = openAt === pathname
  const setOpen = v => setOpenAt(v ? pathname : null)
  const [fresh, setFresh] = useState(0)

  useEffect(() => {
    if (!email) return
    adminApi.get('/stats').then(s => setFresh(s.newEnquiries)).catch(() => {})
  }, [email, pathname])

  if (checking) return <div className="admin" aria-busy="true" />
  if (!email) return <Navigate to="/admin/login" replace state={{ from: pathname }} />

  return (
    <div className="admin">
      <div className="admin-top">
        <button className="a-btn a-btn--icon" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button>
        <img src={brand.logoOnLight} alt="Aexto admin" />
      </div>
      {open && <div className="admin-scrim" onClick={() => setOpen(false)} />}
      <div className="admin-shell">
        <aside className={`admin-side${open ? ' open' : ''}`} aria-label="Admin menu">
          <Link className="admin-brand" to="/admin">
            <img src={brand.logoOnDark} alt="Aexto" />
            <span>Admin</span>
          </Link>
          <nav className="admin-nav">
            {items.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon aria-hidden="true" />
                {label}
                {badge && fresh > 0 && <span className="badge" aria-label={`${fresh} new`}>{fresh}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="admin-side__foot">
            <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> View website</a>
            <button type="button" onClick={signOut}><LogOut aria-hidden="true" /> Sign out</button>
            <p className="admin-side__user">{email}</p>
          </div>
        </aside>
        <main className="admin-main" id="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
