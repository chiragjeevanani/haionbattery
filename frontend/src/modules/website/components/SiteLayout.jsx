import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { SiteProvider } from './SiteContext.jsx'
import { useSite } from './siteState.js'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'
import '../website.css'

/** Scroll to the top on a new page, or to the #id when the link has one. */
function ScrollManager() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { el.scrollIntoView(); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, search, hash])
  return null
}

function ActionBar() {
  const { whatsappUrl } = useSite()
  return (
    <nav className="actionbar" aria-label="Quick actions" data-bar="always">
      <a className="btn btn--secondary" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <Link className="btn btn--primary" to="/contact">Get a quote</Link>
    </nav>
  )
}

function Shell() {
  return (
    <>
      <ScrollManager />
      <Nav />
      <Outlet />
      <Footer />
      <ActionBar />
    </>
  )
}

export default function SiteLayout() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  )
}
