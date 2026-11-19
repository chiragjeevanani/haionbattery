import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { Confirm, Field, Input, PageHead, SingleImage, Textarea } from '../components/ui.jsx'
import { useToast } from '../components/toastState.js'

const blank = { name: '', description: '', image: '', sortOrder: '' }

export default function Categories() {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [editing, setEditing] = useState(null)   // null = closed, {} = new, {id,...} = edit
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => adminApi.get('/categories').then(setList).catch(e => toast(e.message, 'error'))
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const open = c => { setErrors({}); setEditing(c ? { ...blank, ...c } : { ...blank }) }
  const set = (k, v) => setEditing(e => ({ ...e, [k]: v }))

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      editing.id ? await adminApi.put(`/categories/${editing.id}`, editing) : await adminApi.post('/categories', editing)
      toast(editing.id ? 'Category saved.' : 'Category added.')
      setEditing(null)
      load()
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally { setSaving(false) }
  }
  const remove = async c => {
    try { await adminApi.del(`/categories/${c.id}`); toast('Category deleted.'); load() }
    catch (err) { toast(err.message, 'error') }
  }

  return (
    <>
      <PageHead title="Categories" actions={<button type="button" className="a-btn a-btn--primary" onClick={() => open()}><Plus /> Add category</button>}>
        The vehicle groups on the home page, in the menu and in the product filters.
      </PageHead>

      <div className="a-split">
        <div className="a-tablewrap">
          <table className="a-table">
            <thead><tr><th>Category</th><th>Order</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {!list && <tr><td colSpan="3" className="a-empty">Loading</td></tr>}
              {list?.length === 0 && <tr><td colSpan="3" className="a-empty">No categories yet.</td></tr>}
              {list?.map(c => (
                <tr key={c.id}>
                  <td><div className="a-prodcell">{c.image ? <img className="a-thumb" src={c.image} alt="" /> : <span className="a-thumb" />}<div><b>{c.name}</b><span className="muted small">{c.description}</span></div></div></td>
                  <td>{c.sortOrder}</td>
                  <td><div className="actions">
                    <button type="button" className="a-btn a-btn--sm a-btn--icon" aria-label={`Edit ${c.name}`} onClick={() => open(c)}><Pencil /></button>
                    <Confirm className="a-btn a-btn--sm a-btn--icon a-btn--danger" label={`Delete ${c.name}`} onConfirm={() => remove(c)}><Trash2 /></Confirm>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <form className="a-card a-form" onSubmit={save} noValidate>
            <h2>{editing.id ? 'Edit category' : 'New category'}</h2>
            <Field label="Name" error={errors.name}><Input value={editing.name} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Description" hint="One line, shown in the menu and on the home page."><Textarea rows={3} value={editing.description} onChange={e => set('description', e.target.value)} /></Field>
            <SingleImage label="Picture" value={editing.image} onChange={v => set('image', v)} />
            <Field label="Order" hint="Lower numbers come first."><Input type="number" value={editing.sortOrder} onChange={e => set('sortOrder', e.target.value)} /></Field>
            <div className="a-actions">
              <button className="a-btn a-btn--primary" type="submit" disabled={saving}>{saving ? 'Saving' : 'Save category'}</button>
              <button className="a-btn" type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
