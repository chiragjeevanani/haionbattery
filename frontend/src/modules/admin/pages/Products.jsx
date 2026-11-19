import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { adminApi, formatPrice } from '../../../lib/api.js'
import { Confirm, Input, PageHead, Select } from '../components/ui.jsx'
import { useToast } from '../components/toastState.js'

/** What the price column shows for a product, matching how the website reads it. */
function priceLabel(p) {
  const mode = p.priceMode || (p.price != null ? 'exact' : 'request')
  if (mode === 'request' || p.price == null) return <span className="muted">On request</span>
  return (mode === 'from' ? 'From ' : '') + formatPrice(p.price)
}

export default function Products() {
  const toast = useToast()
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')

  useEffect(() => {
    Promise.all([adminApi.get('/products'), adminApi.get('/categories')])
      .then(([p, c]) => { setProducts(p); setCategories(c) })
      .catch(e => toast(e.message, 'error'))
  }, [toast])

  const catName = id => categories.find(c => c.id === id)?.name || 'No category'
  const shown = useMemo(() => (products || []).filter(p =>
    (!cat || p.categoryId === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase()))), [products, q, cat])

  const patch = async (p, change, message) => {
    try {
      const saved = await adminApi.put(`/products/${p.id}`, { ...p, ...change })
      setProducts(list => list.map(x => (x.id === p.id ? saved : x)))
      toast(message)
    } catch (e) { toast(e.message, 'error') }
  }
  const remove = async p => {
    try {
      await adminApi.del(`/products/${p.id}`)
      setProducts(list => list.filter(x => x.id !== p.id))
      toast('Product deleted.')
    } catch (e) { toast(e.message, 'error') }
  }

  return (
    <>
      <PageHead title="Products" actions={<Link className="a-btn a-btn--primary" to="/admin/products/new"><Plus /> Add product</Link>}>
        Everything listed here appears on the website, unless you hide it.
      </PageHead>

      <div className="a-toolbar">
        <Input type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={e => setQ(e.target.value)} />
        <Select aria-label="Filter by category" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>

      <div className="a-tablewrap">
        <table className="a-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {!products && <tr><td colSpan="5" className="a-empty">Loading</td></tr>}
            {products && shown.length === 0 && <tr><td colSpan="5" className="a-empty">No products match. <Link to="/admin/products/new">Add one</Link>.</td></tr>}
            {shown.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="a-prodcell">
                    {p.images[0] ? <img className="a-thumb" src={p.images[0]} alt="" /> : <span className="a-thumb" />}
                    <div><b><Link to={`/admin/products/${p.id}`}>{p.name}</Link></b><span className="muted small">{p.specs.find(s => /voltage/i.test(s.label))?.value || ''} {p.specs.find(s => /capacity/i.test(s.label))?.value || ''}</span></div>
                  </div>
                </td>
                <td>{catName(p.categoryId)}</td>
                <td>{priceLabel(p)}</td>
                <td>
                  {p.active ? <span className="a-pill ok">Visible</span> : <span className="a-pill">Hidden</span>}{' '}
                  {p.featured && <span className="a-pill warn">Featured</span>}
                </td>
                <td>
                  <div className="actions">
                    <button type="button" className="a-btn a-btn--sm a-btn--icon" aria-label={p.featured ? 'Remove from featured' : 'Feature on home page'} title={p.featured ? 'Remove from featured' : 'Feature on home page'} onClick={() => patch(p, { featured: !p.featured }, p.featured ? 'Removed from featured.' : 'Featured on the home page.')}><Star fill={p.featured ? 'currentColor' : 'none'} /></button>
                    <button type="button" className="a-btn a-btn--sm a-btn--icon" aria-label={p.active ? 'Hide from website' : 'Show on website'} title={p.active ? 'Hide from website' : 'Show on website'} onClick={() => patch(p, { active: !p.active }, p.active ? 'Hidden from the website.' : 'Visible on the website.')}>{p.active ? <EyeOff /> : <Eye />}</button>
                    <Link className="a-btn a-btn--sm a-btn--icon" to={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`}><Pencil /></Link>
                    <Confirm className="a-btn a-btn--sm a-btn--icon a-btn--danger" label={`Delete ${p.name}`} onConfirm={() => remove(p)}><Trash2 /></Confirm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
