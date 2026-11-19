import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSite } from '../components/siteState.js'
import useFetch from '../components/useFetch.js'
import usePageMeta from '../components/usePageMeta.js'
import ProductTile from '../components/ProductTile.jsx'
import EnquiryForm from '../components/EnquiryForm.jsx'
import Arrow from '../components/Arrow.jsx'
import { formatPrice } from '../../../lib/api.js'

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings, whatsappUrl } = useSite()
  const { data, loading, error } = useFetch(`/api/products/${slug}`)
  // The picked picture belongs to one product, so another product starts at its first picture.
  const [pick, setPick] = useState({ slug, index: 0 })
  const index = pick.slug === slug ? pick.index : 0
  const setIndex = i => setPick({ slug, index: i })

  const product = data?.product
  usePageMeta(product ? `${product.name}: ${settings.siteName}` : `Battery: ${settings.siteName}`, product?.shortDescription)

  if (loading) return <main id="top"><section className="section flow"><div className="wrap" aria-busy="true" /></section></main>
  if (error || !product) {
    return (
      <main id="top">
        <section className="section flow">
          <div className="wrap">
            <div className="section-head">
              <h1 className="page-title">We cannot find that battery</h1>
              <p>It may have been removed. See the full range instead.</p>
            </div>
            <div className="btn-row"><Link className="btn btn--primary" to="/products">See all batteries</Link></div>
          </div>
        </section>
      </main>
    )
  }

  const images = product.images?.length ? product.images : []
  const related = data.related || []

  return (
    <main id="top">
      <section className="section flow" aria-labelledby="product-h">
        <div className="wrap">
          <p className="crumbs"><Link className="link" to="/products">All batteries</Link>{product.category && <> <span aria-hidden="true">/</span> <Link className="link" to={`/products?category=${product.category.slug}`}>{product.category.name}</Link></>}</p>
          <div className="grid grid--top product-detail">
            <div className="span-7 gallery">
              <div className="frame frame--photo gallery__main">
                {images[index]
                  ? <img className="frame__img" src={images[index]} alt={`${product.name}, picture ${index + 1} of ${images.length}`} fetchPriority="high" />
                  : <img className="tile__fallback" src="/favicon.png" alt="" width="64" height="64" />}
              </div>
              {images.length > 1 && (
                <div className="gallery__thumbs" role="group" aria-label="Pictures of this battery">
                  {images.map((src, i) => (
                    <button key={src + i} type="button" className="gallery__thumb" aria-label={`Show picture ${i + 1}`} aria-pressed={i === index} onClick={() => setIndex(i)}>
                      <img src={src} alt="" width="120" height="90" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="span-5 start-8 stack-5 product-info">
              <h1 id="product-h" className="page-title page-title--product">{product.name}</h1>
              {product.shortDescription && <p className="t-lead">{product.shortDescription}</p>}
              <div className="price">
                {product.price != null
                  ? <><span className="t-stat">{formatPrice(product.price)}</span>{product.mrp != null && product.mrp > product.price && <s className="muted">{formatPrice(product.mrp)}</s>}</>
                  : <span className="t-lead">Price on request</span>}
              </div>
              {!product.inStock && <p className="t-small muted">Made to order. Ask for the lead time.</p>}
              <div className="btn-row">
                <a className="btn btn--primary" href="#quote">Get a quote<Arrow /></a>
                <a className="btn btn--secondary" href={whatsappUrl(product.name)} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
              </div>
              {product.specs?.length > 0 && (
                <ul className="rows rows--spec">
                  {product.specs.map(s => (
                    <li key={s.label}><span className="rows__name">{s.label}</span><span className="rows__value">{s.value}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section flow" id="quote" aria-labelledby="quote-h">
        <div className="wrap grid grid--top">
          <div className="span-6 stack-5">
            <div className="section-head">
              <h2 id="quote-h">Quote for this battery</h2>
              <p>Tell us how you will use it and we reply with a price.</p>
            </div>
            {product.description && product.description.split('\n\n').map((para, i) => <p key={i} className="measure">{para}</p>)}
          </div>
          <div className="span-5 start-8">
            <EnquiryForm
              type="quote"
              product={product.name}
              messageLabel="Vehicle and how you use it"
              submitLabel="Get a quote"
              sentLine="Your quote request is in. We will contact you with a price."
            />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section flow" aria-labelledby="related-h">
          <div className="wrap">
            <div className="section-head"><h2 id="related-h">More in this category</h2></div>
            <div className="grid">{related.map(p => <div key={p.id} className="span-4"><ProductTile product={p} /></div>)}</div>
          </div>
        </section>
      )}
    </main>
  )
}
