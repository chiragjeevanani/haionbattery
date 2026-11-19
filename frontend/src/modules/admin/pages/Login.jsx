import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/authState.js'
import { Field, Input } from '../components/ui.jsx'
import useKitOff from '../components/useKitOff.js'
import useBrand from '../components/useBrand.js'
import '../admin.css'

export default function Login() {
  useKitOff()
  const brand = useBrand()
  const { email: signedIn, checking, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (checking) return <div className="admin" aria-busy="true" />
  if (signedIn) return <Navigate to={location.state?.from || '/admin'} replace />

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Write your email and password.'); return }
    setBusy(true)
    try {
      await signIn(email.trim(), password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin">
      <div className="a-login">
        <form className="a-login__card" onSubmit={submit} noValidate>
          <img src={brand.logoOnLight} alt="Aexto" />
          <div>
            <h1>Admin sign-in</h1>
            <p className="muted">Manage products, enquiries and the site&apos;s contact details.</p>
          </div>
          <Field label="Email"><Input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></Field>
          <Field label="Password" error={error}><Input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></Field>
          <button className="a-btn a-btn--primary" type="submit" disabled={busy}>{busy ? 'Signing in' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  )
}
