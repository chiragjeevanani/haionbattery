import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { Check, Confirm, Field, ImageList, Input, PageHead, Select, Textarea } from '../components/ui.jsx'
import { useToast } from '../components/toastState.js'

const blank = {
  name: '', categoryId: '', shortDescription: '', description: '', price: '', mrp: '',
  images: [], specs: [], featured: false, active: true, inStock: true, sortOrder: '',
}
const SUGGESTED = ['Chemistry', 'Nominal voltage', 'Capacity', 'Cell format', 'Protection', 'Vehicle']

export default function ProductForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState(blank)
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const jobs = [adminApi.get('/categories')]
    if (!isNew) jobs.push(adminApi.get(`/products/${id}`))
    Promise.all(jobs).then(([cats, product]) => {
      setCategories(cats)
      if (product) setForm({ ...blank, ...product, price: product.price ?? '', mrp: product.mrp ?? '' })
      else if (cats[0]) setForm(f => ({ ...f, categoryId: cats[0].id }))
    }).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }, [id, isNew, toast])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const setSpec = (i, key, value) => set('specs', form.specs.map((s, k) => (k === i ? { ...s, [key]: value } : s)))
  const addSpec = (label = '') => set('specs', [...form.specs, { label, value: '' }])

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      isNew ? await adminApi.post('/products', form) : await adminApi.put(`/products/${id}`, form)
      toast(isNew ? 'Product added.' : 'Changes saved.')
      navigate('/admin/products')
    } catch (err) {
      setErrors(err.fields || {})
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    try { await adminApi.del(`/products/${id}`); toast('Product deleted.'); navigate('/admin/products') }
    catch (err) { toast(err.message, 'error') }
  }

  if (loading) return <p className="muted">Loading</p>
  const unusedSuggestions = SUGGESTED.filter(l => !form.specs.some(s => s.label.toLowerCase() === l.toLowerCase()))

  return (
    <form onSubmit={save} noValidate>
      <PageHead
        title={isNew ? 'Add product' : 'Edit product'}
        actions={<Link className="a-btn" to="/admin/products"><ArrowLeft /> All products</Link>}
      >
        {isNew ? 'It appears on the website as soon as you save.' : form.name}
      </PageHead>

      <div className="a-split">
        <div>
          <div className="a-card a-form">
            <h2>Details</h2>
            <Field label="Product name" error={errors.name}><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="60 V 30 Ah LiFePO4 e-rickshaw pack" /></Field>
            <Field label="Category" error={errors.categoryId}>
              <Select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                <option value="">Choose a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Short description" hint="One line, shown on the product card and in search results."><Input value={form.shortDescription} maxLength={220} onChange={e => set('shortDescription', e.target.value)} /></Field>
            <Field label="Full description" hint="Leave a blank line between paragraphs."><Textarea rows={7} value={form.description} onChange={e => set('description', e.target.value)} /></Field>
          </div>

          <div className="a-card a-form">
            <h2>Pictures</h2>
            <ImageList label="Product pictures" hint="The first picture is the cover. JPG, PNG, WebP or AVIF, up to 6 MB each." value={form.images} onChange={v => set('images', v)} />
          </div>

          <div className="a-card a-form">
            <h2>Specifications</h2>
            <p className="lede muted">Shown as a table on the product page. Voltage, capacity and chemistry also appear on the product card.</p>
            <div className="a-specs">
              {form.specs.map((s, i) => (
                <div className="a-specrow" key={i}>
                  <Input aria-label={`Specification ${i + 1} name`} placeholder="Name, like Nominal voltage" value={s.label} onChange={e => setSpec(i, 'label', e.target.value)} />
                  <Input aria-label={`Specification ${i + 1} value`} placeholder="Value, like 60 V" value={s.value} onChange={e => setSpec(i, 'value', e.target.value)} />
                  <button type="button" className="a-btn a-btn--icon" aria-label={`Remove specification ${i + 1}`} onClick={() => set('specs', form.specs.filter((_, k) => k !== i))}><X /></button>
                </div>
              ))}
            </div>
            <div className="a-actions">
              <button type="button" className="a-btn a-btn--sm" onClick={() => addSpec()}><Plus /> Add a row</button>
              {unusedSuggestions.slice(0, 4).map(l => <button key={l} type="button" className="a-btn a-btn--sm" onClick={() => addSpec(l)}><Plus /> {l}</button>)}
            </div>
          </div>
        </div>

        <div>
          <div className="a-card a-form">
            <h2>Price</h2>
            <Field label="Price in rupees" hint="Leave empty to show Price on request."><Input type="number" min="0" inputMode="decimal" value={form.price} onChange={e => set('price', e.target.value)} /></Field>
            <Field label="List price (optional)" hint="Shown struck through when higher than the price."><Input type="number" min="0" inputMode="decimal" value={form.mrp} onChange={e => set('mrp', e.target.value)} /></Field>
          </div>
          <div className="a-card a-form">
            <h2>Visibility</h2>
            <Check label="Show on the website" checked={form.active} onChange={v => set('active', v)} />
            <Check label="Feature on the home page" checked={form.featured} onChange={v => set('featured', v)} />
            <Check label="In stock (off means made to order)" checked={form.inStock} onChange={v => set('inStock', v)} />
            <Field label="Order" hint="Lower numbers come first."><Input type="number" inputMode="numeric" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} /></Field>
          </div>
          <div className="a-sticky a-actions">
            <button className="a-btn a-btn--primary" type="submit" disabled={saving}>{saving ? 'Saving' : isNew ? 'Add product' : 'Save changes'}</button>
            {!isNew && <Confirm label="Delete product" onConfirm={remove} className="a-btn a-btn--danger">Delete</Confirm>}
          </div>
        </div>
      </div>
    </form>
  )
}
