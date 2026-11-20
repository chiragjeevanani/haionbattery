import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api.js'
import { SiteContext } from './siteState.js'

const digits = v => String(v || '').replace(/\D/g, '')

export function SiteProvider({ children }) {
  const [data, setData] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)

  // The server sleeps when idle and takes up to a minute to wake. Keep trying quietly instead of showing an error.
  useEffect(() => {
    let live = true
    let timer
    const started = Date.now()
    const attempt = () => {
      api.get('/api/site')
        .then(d => { if (live) setData(d) })
        .catch(() => {
          if (!live) return
          setWaiting(true)
          if (Date.now() - started > 120000) setGaveUp(true)
          else timer = setTimeout(attempt, 3000)
        })
    }
    attempt()
    return () => { live = false; clearTimeout(timer) }
  }, [])

  const value = useMemo(() => {
    if (!data) return null
    const { settings } = data
    const wa = digits(settings.whatsappNumber)
    const phoneDigits = digits(settings.phone)
    return {
      ...data,
      /** wa.me link with a message. Pass a product name to use the product template. */
      whatsappUrl: productName => {
        const template = productName ? settings.whatsappProductMessage : settings.whatsappGeneralMessage
        const text = (template || '').replace('{product}', productName || '')
        return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
      },
      /** wa.me link with a message written by the page (the pack designer). */
      whatsappTextUrl: text => `https://wa.me/${wa}?text=${encodeURIComponent(text)}`,
      telUrl: phoneDigits ? `tel:+${phoneDigits}` : '',
      mailUrl: settings.email ? `mailto:${settings.email}` : '',
    }
  }, [data])

  if (!value) {
    return (
      <main className="site-loading" id="top" aria-busy={!gaveUp}>
        {waiting && (
          <div className="site-loading__note" role="status">
            <h1>{gaveUp ? 'The site is not responding' : 'Waking the site up'}</h1>
            <p>{gaveUp ? 'Please reload the page in a minute.' : 'This takes a few seconds the first time. The page will open by itself.'}</p>
          </div>
        )}
      </main>
    )
  }
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}
