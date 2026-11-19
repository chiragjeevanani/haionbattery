import { useEffect } from 'react'

/** The website's kit stylesheets would restyle every element in the admin, so switch them off while it is open. */
export default function useKitOff() {
  useEffect(() => {
    const links = [...document.querySelectorAll('link[rel="stylesheet"][href^="/assets/"]')]
    links.forEach(l => { l.disabled = true })
    return () => links.forEach(l => { l.disabled = false })
  }, [])
}
