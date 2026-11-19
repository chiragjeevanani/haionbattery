import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi, getToken, setToken } from '../../../lib/api.js'
import { AuthContext } from './authState.js'

export function AuthProvider({ children }) {
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(Boolean(getToken()))

  // A stored token is only trusted after the server accepts it.
  useEffect(() => {
    if (!getToken()) return
    let live = true
    authApi.me()
      .then(r => live && setEmail(r.email))
      .catch(() => { setToken(''); live && setEmail('') })
      .finally(() => live && setChecking(false))
    return () => { live = false }
  }, [])

  useEffect(() => {
    const out = () => setEmail('')
    window.addEventListener('aexto:signed-out', out)
    return () => window.removeEventListener('aexto:signed-out', out)
  }, [])

  const signIn = useCallback(async (mail, password) => {
    const r = await authApi.login(mail, password)
    setToken(r.token)
    setEmail(r.email)
  }, [])
  const signOut = useCallback(() => { setToken(''); setEmail('') }, [])
  const updateSession = useCallback(r => { setToken(r.token); setEmail(r.email) }, [])

  const value = useMemo(() => ({ email, checking, signIn, signOut, updateSession }), [email, checking, signIn, signOut, updateSession])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
