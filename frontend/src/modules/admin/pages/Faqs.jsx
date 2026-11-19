import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { Confirm, Field, Input, PageHead, Textarea } from '../components/ui.jsx'
import { useToast } from '../components/toastState.js'

const blank = { question: '', answer: '', sortOrder: '' }

export default function Faqs() {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [editing, setEditing] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => adminApi.get('/faqs').then(setList).catch(e => toast(e.message, 'error'))
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k, v) => setEditing(e => ({ ...e, [k]: v }))

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      editing.id ? await adminApi.put(`/faqs/${editing.id}`, editing) : await adminApi.post('/faqs', editing)
      toast('Question saved.')
      setEditing(null)
      load()
    } catch (err) { setErrors(err.fields || {}); toast(err.message, 'error') }
    finally { setSaving(false) }
  }
  const remove = async f => {
    try { await adminApi.del(`/faqs/${f.id}`); toast('Question deleted.'); load() }
    catch (err) { toast(err.message, 'error') }
  }

  return (
    <>
      <PageHead title="Questions" actions={<button type="button" className="a-btn a-btn--primary" onClick={() => { setErrors({}); setEditing({ ...blank }) }}><Plus /> Add question</button>}>
        The questions and answers on the home page and the Questions page. The home page shows the first five.
      </PageHead>
      <div className="a-split">
        <div className="a-tablewrap">
          <table className="a-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Question</th><th>Order</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {!list && <tr><td colSpan="3" className="a-empty">Loading</td></tr>}
              {list?.length === 0 && <tr><td colSpan="3" className="a-empty">No questions yet.</td></tr>}
              {list?.map(f => (
                <tr key={f.id}>
                  <td><b style={{ fontWeight: 500 }}>{f.question}</b><div className="muted small">{f.answer}</div></td>
                  <td>{f.sortOrder}</td>
                  <td><div className="actions">
                    <button type="button" className="a-btn a-btn--sm a-btn--icon" aria-label={`Edit: ${f.question}`} onClick={() => { setErrors({}); setEditing({ ...blank, ...f }) }}><Pencil /></button>
                    <Confirm className="a-btn a-btn--sm a-btn--icon a-btn--danger" label={`Delete: ${f.question}`} onConfirm={() => remove(f)}><Trash2 /></Confirm>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editing && (
          <form className="a-card a-form" onSubmit={save} noValidate>
            <h2>{editing.id ? 'Edit question' : 'New question'}</h2>
            <Field label="Question" error={errors.question}><Input value={editing.question} onChange={e => set('question', e.target.value)} /></Field>
            <Field label="Answer" error={errors.answer}><Textarea rows={5} value={editing.answer} onChange={e => set('answer', e.target.value)} /></Field>
            <Field label="Order" hint="Lower numbers come first."><Input type="number" value={editing.sortOrder} onChange={e => set('sortOrder', e.target.value)} /></Field>
            <div className="a-actions">
              <button className="a-btn a-btn--primary" type="submit" disabled={saving}>{saving ? 'Saving' : 'Save question'}</button>
              <button className="a-btn" type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
