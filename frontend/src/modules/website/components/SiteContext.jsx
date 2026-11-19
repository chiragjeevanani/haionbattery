import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api.js'
import { SiteContext } from './siteState.js'

const digits = v => String(v || '').replace(/\D/g, '')

export function SiteProvider({ children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    api.get('/api/site')
      .then(d => live && setData(d))
      .catch(e => live && setError(e.message))
    return () => { live = false }
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
      telUrl: phoneDigits ? `tel:+${phoneDigits}` : '',
      mailUrl: settings.email ? `mailto:${settings.email}` : '',
    }
  }, [data])

  if (error) {
    return (
      <main className="section flow" id="top">
        <div className="wrap">
          <div className="section-head">
            <h1>The site cannot load right now</h1>
            <p>{error} Reload the page in a minute.</p>
          </div>
        </div>
      </main>
    )
  }
  if (!value) return <div className="site-loading" aria-busy="true" />
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}
