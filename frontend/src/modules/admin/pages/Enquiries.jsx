import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Trash2 } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { Confirm, PageHead, Select, Textarea } from '../components/ui.jsx'
import { useToast } from '../components/toastState.js'

const when = iso => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
const TYPE = { quote: 'Quote request', custom: 'Custom pack', contact: 'Message' }
const tone = s => (s === 'new' ? ' red' : s === 'contacted' ? ' warn' : ' ok')

/** A 10-digit Indian number gets 91 in front; longer numbers are taken as they are. */
const waLink = phone => {
  let d = String(phone || '').replace(/\D/g, '')
  if (d.length === 10) d = `91${d}`
  return d ? `https://wa.me/${d}` : ''
}

export default function Enquiries() {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [filter, setFilter] = useState('')
  const [openId, setOpenId] = useState('')

  useEffect(() => { adminApi.get('/enquiries').then(setList).catch(e => toast(e.message, 'error')) }, [toast])

  const shown = useMemo(() => (list || []).filter(e => !filter || e.status === filter), [list, filter])
  const update = async (e, change) => {
    try {
      const saved = await adminApi.patch(`/enquiries/${e.id}`, change)
      setList(l => l.map(x => (x.id === e.id ? saved : x)))
      return true
    } catch (err) { toast(err.message, 'error'); return false }
  }
  const toggle = e => {
    setOpenId(id => (id === e.id ? '' : e.id))
    if (e.status === 'new' && openId !== e.id) update(e, { status: 'contacted' })
  }
  const remove = async e => {
    try { await adminApi.del(`/enquiries/${e.id}`); setList(l => l.filter(x => x.id !== e.id)); toast('Enquiry deleted.') }
    catch (err) { toast(err.message, 'error') }
  }

  return (
    <>
      <PageHead title="Enquiries">Everything sent through the quote, custom pack and contact forms. Opening a new one marks it as contacted.</PageHead>
      <div className="a-toolbar">
        <Select aria-label="Filter by status" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      {!list && <p className="muted">Loading</p>}
      {list && shown.length === 0 && <div className="a-card a-empty">No enquiries here yet.</div>}

      {shown.map(e => {
        const open = openId === e.id
        const wa = waLink(e.phone)
        return (
          <div className={`a-enq-item${e.status === 'new' ? ' new' : ''}`} key={e.id}>
            <button type="button" className="row" aria-expanded={open} onClick={() => toggle(e)}>
              <span><b>{e.name}</b><br /><span className="muted small">{TYPE[e.type]}</span></span>
              <span className="trunc">{e.product || e.message || e.vehicle || 'No details'}</span>
              <span className="muted small">{when(e.createdAt)}</span>
              <span className={`a-pill${tone(e.status)}`}>{e.status}</span>
            </button>
            {open && (
              <div className="detail a-enq">
                <dl>
                  {e.product && <><dt>Product</dt><dd>{e.product}</dd></>}
                  {e.phone && <><dt>Phone</dt><dd><a href={`tel:${e.phone}`}>{e.phone}</a></dd></>}
                  {e.email && <><dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd></>}
                  {e.vehicle && <><dt>Vehicle</dt><dd>{e.vehicle}</dd></>}
                  {e.voltage && <><dt>Voltage</dt><dd>{e.voltage}</dd></>}
                  {e.capacity && <><dt>Capacity</dt><dd>{e.capacity}</dd></>}
                  {e.message && <><dt>Message</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{e.message}</dd></>}
                </dl>
                <div className="a-field" style={{ maxWidth: 560 }}>
                  <label htmlFor={`notes-${e.id}`}>Your notes</label>
                  <Textarea id={`notes-${e.id}`} rows={3} defaultValue={e.notes} onBlur={ev => ev.target.value !== e.notes && update(e, { notes: ev.target.value }).then(ok => ok && toast('Notes saved.'))} />
                </div>
                <div className="a-actions" style={{ marginTop: 12 }}>
                  <Select aria-label="Status" value={e.status} onChange={ev => update(e, { status: ev.target.value })} style={{ width: 'auto' }}>
                    <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
                  </Select>
                  {wa && <a className="a-btn" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle /> Reply on WhatsApp</a>}
                  <Confirm label="Delete enquiry" onConfirm={() => remove(e)}><Trash2 /> Delete</Confirm>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
