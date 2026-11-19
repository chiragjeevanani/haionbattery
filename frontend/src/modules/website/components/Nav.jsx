import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSite } from './siteState.js'

const bars = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
)
const cross = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
)
const chev = (
  <svg className="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export default function Nav() {
  const { settings, categories, whatsappUrl } = useSite()
  const { pathname } = useLocation()
  // The sheet is open "at" a path, so it closes by itself as soon as the page changes.
  const [openAt, setOpenAt] = useState(null)
  const [expandedAt, setExpandedAt] = useState(null)
  const open = openAt === pathname
  const expanded = expandedAt === pathname
  const setOpen = v => setOpenAt(typeof v === 'function' ? (v(open) ? pathname : null) : (v ? pathname : null))
  const setExpanded = v => setExpandedAt(typeof v === 'function' ? (v(expanded) ? pathname : null) : (v ? pathname : null))

  useEffect(() => {
    document.body.classList.toggle('nav-locked', open)
    const onKey = e => { if (e.key === 'Escape') setOpenAt(null) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('nav-locked') }
  }, [open])

  const menuCategories = categories.slice(0, 4)
  const current = path => (pathname === path || pathname.startsWith(`${path}/`) ? 'page' : undefined)

  return (
    <header className={`nav nav--split nav--tone${open ? ' is-open' : ''}`}>
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">Skip to content</a>
        <Link className="nav__logo" to="/" aria-label={`${settings.siteName}, home`}>
          <img className="nav__logo-img" src={settings.branding.logoOnDark} alt={settings.siteName} width="150" height="44" />
        </Link>
        <nav className="nav__links" aria-label="Main">
          <div className={`nav__item${expanded ? ' is-expanded' : ''}`}>
            <Link className="nav__link" to="/products" aria-current={current('/products')}>Batteries {chev}</Link>
            <button
              className="nav__expand" type="button" aria-label="Show battery categories"
              aria-expanded={expanded} onClick={() => setExpanded(v => !v)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="nav__menu">
              <div className="wrap grid">
                {menuCategories.map(c => (
                  <Link key={c.id} className="menu-card span-3" to={`/products?category=${c.slug}`}>
                    <div className="panel">{c.image && <img className="frame__img" src={c.image} alt={c.name} width="480" height="360" />}</div>
                    <span className="t-card">{c.name}</span>
                    <span className="t-small muted">{c.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="nav__item"><Link className="nav__link" to="/custom" aria-current={current('/custom')}>Custom</Link></div>
          <div className="nav__item"><Link className="nav__link" to="/about" aria-current={current('/about')}>About</Link></div>
          <div className="nav__item"><Link className="nav__link" to="/contact" aria-current={current('/contact')}>Contact</Link></div>
        </nav>
        <div className="nav__actions">
          <a className="nav__link" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <Link className="btn btn--primary" to="/contact">{settings.text.quoteLabel}</Link>
        </div>
        <button className="nav__toggle" type="button" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(v => !v)}>
          {open ? cross : bars}
        </button>
      </div>
    </header>
  )
}
