import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../components/siteState.js'
import useFetch from '../components/useFetch.js'
import usePageMeta from '../components/usePageMeta.js'
import ProductTile from '../components/ProductTile.jsx'
import Arrow from '../components/Arrow.jsx'

const COMPARE = [
  ['Charge cycles', 'More', 'Fewer'],
  ['Weight for the same range', 'Heavier', 'Lighter'],
  ['Heat', 'Tolerates it well', 'Needs more care'],
  ['Best for', 'E-rickshaws, loaders, storage', 'E-bikes, scooters'],
]

function Hero() {
  const { settings, whatsappUrl } = useSite()
  const { hero } = settings
  return (
    <section className="hero hero--product" data-enter aria-labelledby="hero-h">
      <div className="wrap">
        <div className="hero-text hero__in">
          <div className="hero__head">
            <div>
              <h1 id="hero-h">{hero.headline}</h1>
              <p className="hero__lead">{hero.lead}</p>
            </div>
            <div className="btn-row">
              <Link className="btn btn--primary" to="/contact">Get a quote<Arrow /></Link>
              <a className="btn btn--secondary" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            </div>
          </div>
          <div className="hero__stage">
            <img src={hero.image} alt={hero.imageAlt} style={{ '--ly-pos': '50% 55%' }} fetchPriority="high" />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Rows on the left, one photograph on the right that follows the row you point at. */
function Range({ products }) {
  const { categories } = useSite()
  const [active, setActive] = useState(0)
  const shown = categories[active] || categories[0]
  if (!categories.length) return null
  const count = id => products.filter(p => p.categoryId === id).length

  return (
    <section className="section" id="range" aria-labelledby="range-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="range-h">Battery packs by vehicle. <span className="muted">Pick the one you drive.</span></h2>
        </div>
        <div className="grid grid--top fill">
          <ul className="rows span-6">
            {categories.map((c, i) => (
              <li key={c.id} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                <Link className="rows__name" to={`/products?category=${c.slug}`} aria-current={i === active ? 'true' : undefined}>
                  {c.name}{i === active ? <span className="range-dot" aria-hidden="true" /> : null}
                </Link>
                <p>{c.description}</p>
                <span className="rows__value">{count(c.id)} {count(c.id) === 1 ? 'pack' : 'packs'}</span>
              </li>
            ))}
          </ul>
          <div className="frame frame--photo frame--fill span-6 start-7">
            {shown?.image && <img className="frame__img" key={shown.id} src={shown.image} alt={shown.name} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function Popular({ products }) {
  const featured = products.filter(p => p.featured).slice(0, 4)
  const list = featured.length ? featured : products.slice(0, 4)
  if (!list.length) return null
  return (
    <section className="section" id="popular" aria-labelledby="popular-h">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div><h2 id="popular-h">Popular battery packs</h2></div>
          <Link className="btn btn--secondary" to="/products">See all batteries</Link>
        </div>
        <div className="grid">
          {list.map(p => (
            <div key={p.id} className="span-3"><ProductTile product={p} ratio="3 / 4" /></div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Custom() {
  const { settings } = useSite()
  const c = settings.custom
  return (
    <section className="section" id="custom" aria-labelledby="custom-h">
      <div className="wrap">
        <div className="grid grid--top fill">
          <div className="span-5">
            <div className="section-head">
              <h2 id="custom-h">{c.heading}</h2>
              <p>{c.text}</p>
            </div>
            <ul className="rows">
              <li><span className="rows__name">Voltage and capacity</span><span className="rows__value">12 V to 72 V</span></li>
              <li><span className="rows__name">Peak current</span><span className="rows__value">Matched to your controller</span></li>
              <li><span className="rows__name">Size and shape</span><span className="rows__value">Fits your tray</span></li>
              <li><span className="rows__name">BMS and connectors</span><span className="rows__value">Your choice</span></li>
            </ul>
            <div className="btn-row"><Link className="btn btn--primary" to="/custom">Request a custom pack<Arrow /></Link></div>
          </div>
          <div className="frame frame--photo frame--fill span-6 start-7">
            <img className="frame__img" src={c.image} alt={c.imageAlt} loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Storage() {
  const { settings } = useSite()
  const s = settings.storage
  return (
    <section className="section ground-inverse" id="storage" aria-labelledby="storage-h">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div>
            <h2 id="storage-h">{s.heading}</h2>
            <p>{s.text}</p>
          </div>
          <Link className="btn btn--secondary" to="/products?category=solar-inverter-batteries">See storage batteries</Link>
        </div>
        <div className="storage-frame frame frame--photo">
          <img className="frame__img" src={s.image} alt={s.imageAlt} loading="lazy" />
        </div>
      </div>
    </section>
  )
}

function Chemistry() {
  const { categories } = useSite()
  const rick = categories.find(c => c.slug === 'e-rickshaw-batteries')
  return (
    <section className="section" id="chemistry" aria-labelledby="chem-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="chem-h">LiFePO4 or NMC. <span className="muted">Which one fits your vehicle.</span></h2>
        </div>
        <div className="grid grid--top fill">
          <div className="span-7">
            <table className="compare">
              <thead><tr><th scope="col"><span className="sr-only">Property</span></th><th scope="col">LiFePO4</th><th scope="col">NMC</th></tr></thead>
              <tbody>
                {COMPARE.map(([label, a, b]) => (
                  <tr key={label}><th scope="row">{label}</th><td>{a}</td><td>{b}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="btn-row"><Link className="btn btn--secondary" to="/contact">Ask which one fits</Link></div>
          </div>
          {rick?.image && (
            <div className="frame frame--photo frame--fill span-4 start-9 chem-photo">
              <img className="frame__img" src={rick.image} alt="A row of e-rickshaws parked in the shade" loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { faqs } = useSite()
  if (!faqs.length) return null
  return (
    <section className="section" id="faq" aria-labelledby="faq-h">
      <div className="wrap">
        <div className="section-head"><h2 id="faq-h">Questions before you order</h2></div>
        <div className="faq">
          {faqs.slice(0, 5).map(f => (
            <div className="faq__item" key={f.id}><h3>{f.question}</h3><p>{f.answer}</p></div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { settings } = useSite()
  const { data } = useFetch('/api/products')
  const products = data || []
  usePageMeta(settings.seo.title, settings.seo.description)
  return (
    <main id="top">
      <Hero />
      <Range products={products} />
      <Popular products={products} />
      <Custom />
      <Storage />
      <Chemistry />
      <Faq />
    </main>
  )
}
