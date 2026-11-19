import { useEffect, useState } from 'react'
import { api } from '../../../lib/api.js'

/** GET a public endpoint. Returns { data, error, loading }; refetches when the path changes. */
export default function useFetch(path) {
  const [state, setState] = useState({ path: null, data: null, error: '' })

  useEffect(() => {
    let live = true
    api.get(path)
      .then(data => live && setState({ path, data, error: '' }))
      .catch(e => live && setState({ path, data: null, error: e.message }))
    return () => { live = false }
  }, [path])

  // A result only counts for the path it was fetched for, so a new path reads as loading at once.
  const ready = state.path === path
  return { data: ready ? state.data : null, error: ready ? state.error : '', loading: !ready }
}
