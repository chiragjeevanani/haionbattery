import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { Field, Input, PageHead, SingleImage, Textarea } from '../components/ui.jsx'
import { useToast } from '../components/toastState.js'

const TABS = [
  ['contact', 'Contact and WhatsApp'],
  ['home', 'Home page'],
  ['pages', 'Other pages'],
  ['seo', 'Search and footer'],
]

export default function Settings() {
  const toast = useToast()
  const [s, setS] = useState(null)
  const [tab, setTab] = useState('contact')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { adminApi.get('/settings').then(setS).catch(e => toast(e.message, 'error')) }, [toast])
  if (!s) return <p className="muted">Loading</p>

  /** set('hero.headline', value) */
  const set = (path, value) => setS(cur => {
    const next = structuredClone(cur)
    const keys = path.split('.')
    let node = next
    keys.slice(0, -1).forEach(k => { node = node[k] })
    node[keys.at(-1)] = value
    return next
  })
  const text = path => ({ value: path.split('.').reduce((n, k) => n?.[k], s) ?? '', onChange: e => set(path, e.target.value) })

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      setS(await adminApi.put('/settings', s))
      toast('Settings saved. The website now shows them.')
    } catch (err) {
      setErrors(err.fields || {})
      if (err.fields?.whatsappNumber || err.fields?.email) setTab('contact')
      toast(err.message, 'error')
    } finally { setSaving(false) }
  }

  const waDigits = String(s.whatsappNumber || '').replace(/\D/g, '')
  const sample = (s.whatsappProductMessage || '').replace('{product}', 'LiFePO4 e-rickshaw pack')
  const waTest = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(s.whatsappGeneralMessage || '')}` : ''

  return (
    <form onSubmit={save} noValidate>
      <PageHead title="Site settings">Everything visitors see that is not a product: contact numbers, WhatsApp, headlines and pictures.</PageHead>

      <div className="a-tabs" role="tablist" aria-label="Settings sections">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'contact' && (
        <>
          <div className="a-card a-form">
            <h2>Phone and WhatsApp</h2>
            <p className="lede muted">These feed every call, WhatsApp and quote button on the website.</p>
            <div className="a-grid two">
              <Field label="Phone number shown on the site" hint="Written the way you want it shown, like +91 98765 43210." error={errors.phone}><Input type="tel" {...text('phone')} /></Field>
              <Field label="WhatsApp number" hint="Country code and number, digits only, like 919876543210." error={errors.whatsappNumber}><Input inputMode="numeric" {...text('whatsappNumber')} /></Field>
            </div>
            <Field label="WhatsApp message from a product page" hint="{product} is replaced by the product name."><Textarea rows={2} {...text('whatsappProductMessage')} /></Field>
            <div className="a-preview">Preview: {sample}</div>
            <Field label="WhatsApp message from everywhere else"><Textarea rows={2} {...text('whatsappGeneralMessage')} /></Field>
            {waTest && <div><a className="a-btn a-btn--sm" href={waTest} target="_blank" rel="noopener noreferrer"><ExternalLink /> Test the WhatsApp link</a> <span className="muted small">Save first if you changed the number.</span></div>}
          </div>
          <div className="a-card a-form">
            <h2>Business details</h2>
            <div className="a-grid two">
              <Field label="Business name" error={errors.siteName}><Input {...text('siteName')} /></Field>
              <Field label="Email shown on the site" error={errors.email}><Input type="email" {...text('email')} /></Field>
            </div>
            <Field label="Address" hint="Street and area. Leave empty to hide it."><Input {...text('address')} /></Field>
            <Field label="Opening hours" hint="For example Mon to Sat, 9:30 to 18:30. Leave empty to hide it."><Input {...text('hours')} /></Field>
          </div>
          <div className="a-card a-form">
            <h2>Social links</h2>
            <p className="lede muted">Full web addresses. Only the ones you fill appear in the footer.</p>
            <div className="a-grid two">
              {['instagram', 'facebook', 'youtube', 'linkedin'].map(k => (
                <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><Input type="url" placeholder="https://" {...text(`social.${k}`)} /></Field>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'home' && (
        <>
          <div className="a-card a-form">
            <h2>Top of the home page</h2>
            <Field label="Headline" hint="Say what you sell, in about 30 characters. It is set very large."><Input maxLength={40} {...text('hero.headline')} /></Field>
            <Field label="Line under the headline" hint="Include one hard fact, like a voltage range."><Textarea rows={3} maxLength={300} {...text('hero.lead')} /></Field>
            <SingleImage label="Hero picture" hint="Wide and sharp, at least 1600 px across. The headline sits on the left, so keep the subject to the right." value={s.hero.image} onChange={v => set('hero.image', v)} />
            <Field label="Describe the hero picture" hint="Read aloud by screen readers."><Input {...text('hero.imageAlt')} /></Field>
          </div>
          <div className="a-card a-form">
            <h2>Large statement</h2>
            <p className="lede muted">The big line whose letters fly into place as visitors scroll.</p>
            <Field label="Statement" hint="Two to five words. Keep it under 28 letters."><Input maxLength={40} {...text('statement.heading')} /></Field>
            <Field label="Line under it"><Textarea rows={2} maxLength={240} {...text('statement.text')} /></Field>
          </div>
          <div className="a-card a-form">
            <h2>How a pack is made</h2>
            <p className="lede muted">Three steps on the dark section, each with a picture.</p>
            <Field label="Section heading"><Input {...text('process.heading')} /></Field>
            {(s.process.steps || []).map((st, i) => (
              <div className="a-card a-form" key={i} style={{ background: 'var(--a-bg)' }}>
                <h3>Step {i + 1}</h3>
                <Field label="Title"><Input maxLength={60} {...text(`process.steps.${i}.title`)} /></Field>
                <Field label="Text"><Textarea rows={2} maxLength={240} {...text(`process.steps.${i}.text`)} /></Field>
                <SingleImage label="Picture" value={st.image} onChange={v => set(`process.steps.${i}.image`, v)} />
                <Field label="Describe the picture"><Input {...text(`process.steps.${i}.imageAlt`)} /></Field>
              </div>
            ))}
          </div>
          <div className="a-card a-form">
            <h2>Closing picture</h2>
            <p className="lede muted">The wide picture above the footer, under the Get a quote line.</p>
            <SingleImage label="Picture" hint="Wide. It is cropped to a strip." value={s.closing.image} onChange={v => set('closing.image', v)} />
            <Field label="Describe the picture"><Input {...text('closing.imageAlt')} /></Field>
          </div>
        </>
      )}

      {tab === 'pages' && (
        <>
          <div className="a-card a-form">
            <h2>Custom packs page</h2>
            <Field label="Heading"><Input {...text('custom.heading')} /></Field>
            <Field label="Text"><Textarea rows={3} {...text('custom.text')} /></Field>
            <SingleImage label="Picture" value={s.custom.image} onChange={v => set('custom.image', v)} />
            <Field label="Describe the picture"><Input {...text('custom.imageAlt')} /></Field>
          </div>
          <div className="a-card a-form">
            <h2>About page</h2>
            <Field label="Heading"><Input {...text('about.heading')} /></Field>
            <Field label="Text" hint="Leave a blank line between paragraphs."><Textarea rows={8} {...text('about.body')} /></Field>
            <SingleImage label="Picture" value={s.about.image} onChange={v => set('about.image', v)} />
            <Field label="Describe the picture"><Input {...text('about.imageAlt')} /></Field>
          </div>
        </>
      )}

      {tab === 'seo' && (
        <>
          <div className="a-card a-form">
            <h2>Search results and link previews</h2>
            <Field label="Home page title" hint="About 60 characters."><Input maxLength={90} {...text('seo.title')} /></Field>
            <Field label="Home page description" hint="One sentence, about 150 characters."><Textarea rows={2} maxLength={200} {...text('seo.description')} /></Field>
          </div>
          <div className="a-card a-form">
            <h2>Footer</h2>
            <Field label="Line under the logo"><Input {...text('footerLede')} /></Field>
          </div>
        </>
      )}

      <div className="a-sticky a-actions">
        <button className="a-btn a-btn--primary" type="submit" disabled={saving}>{saving ? 'Saving' : 'Save settings'}</button>
        <a className="a-btn" href="/" target="_blank" rel="noopener noreferrer"><ExternalLink /> View website</a>
      </div>
    </form>
  )
}
