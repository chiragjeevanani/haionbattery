import { useEffect, useState } from 'react'
import { api } from '../../../lib/api.js'

/** The logos set in Site settings, for the admin's own sign-in page and sidebar. */
export default function useBrand() {
  const [brand, setBrand] = useState({ logoOnDark: '/logo-light.png', logoOnLight: '/logo.png' })
  useEffect(() => {
    let live = true
    api.get('/api/site').then(d => { if (live && d.settings?.branding) setBrand(d.settings.branding) }).catch(() => {})
    return () => { live = false }
  }, [])
  return brand
}
