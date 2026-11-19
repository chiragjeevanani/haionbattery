import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSite } from '../components/siteState.js'
import useFetch from '../components/useFetch.js'
import usePageMeta from '../components/usePageMeta.js'
import ProductTile from '../components/ProductTile.jsx'

export default function Products() {
  const { categories, settings } = useSite()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const q = params.get('q') || ''
  const [draft, setDraft] = useState(q)

  const query = new URLSearchParams()
  if (category) query.set('category', category)
  if (q) query.set('q', q)
  const { data, loading, error } = useFetch(`/api/products?${query.toString()}`)
  const products = data || []

  const active = categories.find(c => c.slug === category)
  const title = active ? active.name : 'Batteries'
  usePageMeta(`${title}: ${settings.siteName}`, active?.description || `Lithium battery packs for electric vehicles and solar storage from ${settings.siteName}.`)

  const setCategory = slug => {
    const next = new URLSearchParams(params)
    slug ? next.set('category', slug) : next.delete('category')
    setParams(next)
  }
  const search = e => {
    e.preventDefault()
    const next = new URLSearchParams(params)
    draft.trim() ? next.set('q', draft.trim()) : next.delete('q')
    setParams(next)
  }

  return (
    <main id="top">
      <section className="section flow" aria-labelledby="products-h">
        <div className="wrap">
          <div className="section-head">
            <h1 id="products-h" className="page-title">{title}</h1>
            <p>{active?.description || 'Battery packs for e-bikes, e-rickshaws, scooters and solar storage. Open one to ask for a price.'}</p>
          </div>

          <div className="filters">
            <div className="chips" role="group" aria-label="Filter by category">
              <button type="button" className="chip" aria-pressed={!category} onClick={() => setCategory('')}>All</button>
              {categories.map(c => (
                <button type="button" key={c.id} className="chip" aria-pressed={category === c.slug} onClick={() => setCategory(c.slug)}>{c.name}</button>
              ))}
            </div>
            <form className="search" onSubmit={search} role="search">
              <label className="sr-only" htmlFor="search-q">Search batteries</label>
              <input id="search-q" type="search" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Search by name or voltage" autoComplete="off" />
              <button className="btn btn--secondary" type="submit">Search</button>
            </form>
          </div>

          {error && <p className="empty">{error}</p>}
          {!error && !loading && products.length === 0 && (
            <div className="empty">
              <p>No batteries match that search.</p>
              <div className="btn-row">
                <button className="btn btn--secondary" type="button" onClick={() => { setDraft(''); setParams({}) }}>Show all batteries</button>
                <Link className="btn btn--primary" to="/custom">Request a custom pack</Link>
              </div>
            </div>
          )}
          <div className="grid product-grid" aria-live="polite">
            {products.map(p => <div key={p.id} className="span-4"><ProductTile product={p} /></div>)}
          </div>
        </div>
      </section>
    </main>
  )
}
