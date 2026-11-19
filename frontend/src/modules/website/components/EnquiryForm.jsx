import { useId, useRef, useState } from 'react'
import { api, ApiError } from '../../../lib/api.js'

/**
 * One enquiry form for quotes, custom packs and general contact.
 * Errors are checked on submit and shown under their own field; the success
 * line appears only after the server has stored the enquiry.
 */
export default function EnquiryForm({
  type = 'contact',
  product = '',
  fields = [],            // extra fields: [{ name, label, inputMode, autoComplete }]
  messageLabel = 'Message',
  submitLabel = 'Send enquiry',
  sentLine = 'Your enquiry is in. We will contact you soon.',
  defaults = {},          // starting values by field name, like the pack designer's choice
}) {
  const uid = useId()
  const formRef = useRef(null)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const id = name => `${uid}-${name}`

  const submit = async e => {
    e.preventDefault()
    const form = new FormData(formRef.current)
    const body = Object.fromEntries(form.entries())
    body.type = type
    if (product) body.product = product

    const next = {}
    if (!body.name?.trim()) next.name = 'Write your name.'
    if (!body.phone?.trim() && !body.email?.trim()) next.phone = 'Write a phone number or an email address so we can reply.'
    if (body.email?.trim() && !/^\S+@\S+\.\S+$/.test(body.email.trim())) next.email = 'Write an email address with an @, like name@example.com.'
    if (Object.keys(next).length) {
      setErrors(next)
      setSent(false)
      setStatus(`${Object.keys(next).length} ${Object.keys(next).length === 1 ? 'field needs' : 'fields need'} a change.`)
      const first = Object.keys(next)[0]
      formRef.current.elements[first]?.focus()
      return
    }

    setErrors({})
    setBusy(true)
    const timer = setTimeout(() => setStatus('Sending'), 300)
    try {
      await api.post('/api/enquiries', body)
      clearTimeout(timer)
      setSent(true)
      setStatus(sentLine)
      formRef.current.reset()
    } catch (err) {
      clearTimeout(timer)
      setSent(false)
      if (err instanceof ApiError && err.fields && Object.keys(err.fields).length) setErrors(err.fields)
      setStatus(err.message || 'The enquiry did not send. Your details are still here, try again.')
    } finally {
      setBusy(false)
    }
  }

  const field = (name, label, props = {}) => (
    <div className="field" key={name}>
      <label htmlFor={id(name)}>{label}</label>
      <input
        id={id(name)}
        name={name}
        aria-invalid={errors[name] ? 'true' : undefined}
        aria-describedby={errors[name] ? `${id(name)}-err` : undefined}
        defaultValue={defaults[name]}
        {...props}
      />
      {errors[name] && <p className="field__error" id={`${id(name)}-err`}>{errors[name]}</p>}
    </div>
  )

  return (
    <form className="form" ref={formRef} onSubmit={submit} noValidate>
      {field('name', 'Name', { type: 'text', autoComplete: 'name', required: true })}
      {field('phone', 'Phone', { type: 'tel', autoComplete: 'tel', inputMode: 'tel' })}
      {field('email', 'Email', { type: 'email', autoComplete: 'email', inputMode: 'email' })}
      {fields.map(f => field(f.name, f.label, { type: 'text', inputMode: f.inputMode, autoComplete: 'off' }))}
      <div className="field">
        <label htmlFor={id('message')}>{messageLabel}</label>
        <textarea id={id('message')} name="message" rows={4} defaultValue={defaults.message} />
      </div>
      <div className="btn-row">
        <button className="btn btn--primary" type="submit" disabled={busy}>{submitLabel}</button>
      </div>
      <p className="form__status" role="status" data-sent={sent ? '' : undefined}>{status}</p>
    </form>
  )
}
