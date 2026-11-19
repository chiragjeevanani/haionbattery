import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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

/** Rendered into <body> itself: the kit's CSS looks for body > nav.actionbar to drop the header's own button on a phone. */
function ActionBar() {
  const { whatsappUrl, settings } = useSite()
  return createPortal(
    <nav className="actionbar" aria-label="Quick actions" data-bar="always">
      <a className="btn btn--secondary" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <Link className="btn btn--primary" to="/contact">{settings.text.quoteLabel}</Link>
    </nav>,
    document.body,
  )
}

/** The tab icon follows the favicon set in the admin. */
function Favicon() {
  const { settings } = useSite()
  const href = settings.branding.favicon
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]')
    if (link && href) link.href = href
  }, [href])
  return null
}

function Shell() {
  return (
    <>
      <Favicon />
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
