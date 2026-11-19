import { useEffect } from 'react'

/** Loads the kit's moment loader once, through a script tag (a bundler must not import files from /public). */
function loadMoments() {
  if (window.__moments) return Promise.resolve(window.__moments)
  if (!window.__momentsLoading) {
    window.__momentsManual = true            // we hand the loader each section ourselves
    window.__momentsLoading = new Promise((resolve, reject) => {
      const tag = document.createElement('script')
      tag.type = 'module'
      tag.src = '/assets/moments/boot.js'
      tag.onload = () => resolve(window.__moments)
      tag.onerror = reject
      document.head.appendChild(tag)
    })
  }
  return window.__momentsLoading
}

/** Starts one of the kit's moments on the element in `ref` and stops it again when the page changes. */
export default function useMoment(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let cancelled = false
    loadMoments()
      .then(m => { if (!cancelled) return m.mount(el) })
      .catch(() => el.classList.add('mo-safe', 'is-done'))
    return () => {
      cancelled = true
      try { el.__moment?.destroy?.() } catch { /* already gone */ }
      delete el.__moment
      delete el.__momentP
      el.removeAttribute('data-moment-mounted')
    }
  }, [ref])
}
