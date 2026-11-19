import { useState } from 'react'
import { authApi } from '../../../lib/api.js'
import { useAuth } from '../components/authState.js'
import { Field, Input, PageHead } from '../components/ui.jsx'
import { useToast } from '../components/toastState.js'

export default function Account() {
  const { email, updateSession } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email, currentPassword: '', newPassword: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async e => {
    e.preventDefault()
    setErrors({})
    if (!form.currentPassword) { setErrors({ currentPassword: 'Write your current password to confirm.' }); return }
    setSaving(true)
    try {
      const r = await authApi.account(form)
      updateSession(r)
      setForm({ email: r.email, currentPassword: '', newPassword: '' })
      toast('Account updated.')
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally { setSaving(false) }
  }

  return (
    <>
      <PageHead title="Account">The email and password you use to sign in to this panel.</PageHead>
      <form className="a-card a-form" style={{ maxWidth: 520 }} onSubmit={save} noValidate>
        <Field label="Sign-in email" error={errors.email}><Input type="email" autoComplete="username" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="New password" hint="At least 8 characters. Leave empty to keep the current one." error={errors.newPassword}><Input type="password" autoComplete="new-password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} /></Field>
        <Field label="Current password" hint="Needed to save any change." error={errors.currentPassword}><Input type="password" autoComplete="current-password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} /></Field>
        <div className="a-actions"><button className="a-btn a-btn--primary" type="submit" disabled={saving}>{saving ? 'Saving' : 'Save account'}</button></div>
      </form>
    </>
  )
}
