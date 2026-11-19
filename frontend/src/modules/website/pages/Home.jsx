import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../components/siteState.js'
import useFetch from '../components/useFetch.js'
import usePageMeta from '../components/usePageMeta.js'
import ProductTile from '../components/ProductTile.jsx'
import PackBuilder from '../components/PackBuilder.jsx'
import MomentSection from '../components/MomentSection.jsx'
import Arrow from '../components/Arrow.jsx'

/** Full-bleed photograph, the words in a solid box on its calm side. */
function Hero() {
  const { settings, whatsappUrl } = useSite()
  const { hero, text } = settings
  return (
    <section className="hero hero--photo" data-enter data-calm="left" aria-labelledby="hero-h">
      <img className="hero__bg" src={hero.image} alt={hero.imageAlt} style={{ '--ly-pos': '50% 45%' }} fetchPriority="high" />
      <div className="wrap">
        <div className="hero-text">
          <div className="hero__text">
            <h1 id="hero-h">{hero.headline}</h1>
            <p className="hero__lead">{hero.lead}</p>
            <div className="btn-row">
              <Link className="btn btn--primary" to="/contact">{text.quoteLabel}<Arrow /></Link>
              <a className="btn btn--secondary" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">{text.whatsappLabel}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Designer() {
  const { text } = useSite().settings
  return (
    <section className="section ground-surface" id="designer" aria-labelledby="designer-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="designer-h">{text.designerHeading} <span className="muted">{text.designerSub}</span></h2>
        </div>
        <PackBuilder />
      </div>
    </section>
  )
}

/** Vehicle panels: the one you point at opens, the others narrow. */
function Range({ products }) {
  const { categories, settings } = useSite()
  const { text } = settings
  const [active, setActive] = useState(0)
  if (!categories.length) return null
  const count = id => products.filter(p => p.categoryId === id).length

  return (
    <section className="section" id="range" aria-labelledby="range-h">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div><h2 id="range-h">{text.rangeHeading}</h2></div>
          <Link className="btn btn--secondary" to="/products">{text.seeAllLabel}</Link>
        </div>
        <div className="vpanels">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className={`vpanel${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <span className="vpanel__media">{c.image && <img src={c.image} alt="" loading="lazy" />}</span>
              <span className="vpanel__body">
                <span className="vpanel__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="vpanel__name">{c.name}</span>
                <span className="vpanel__more">
                  <span>{c.description}</span>
                  <span className="vpanel__count">{count(c.id)} {count(c.id) === 1 ? 'pack' : 'packs'}</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** One statement, set very large; its letters fly into the line as it rises (the kit's letters-assemble). */
function Statement() {
  const { settings } = useSite()
  const s = settings.statement
  return (
    <MomentSection moment="letters-assemble" className="section" id="statement" aria-label="What we do">
      <div className="wrap">
        <h2 className="mo-la__type">{s.heading}</h2>
        <p className="mo-la__sub">{s.text}</p>
      </div>
    </MomentSection>
  )
}

/** The dark section: a red line climbs through the light ground above it (the kit's line-carries-colour). */
function Process() {
  const { settings } = useSite()
  const { heading, steps } = settings.process
  if (!steps?.length) return null
  return (
    <MomentSection moment="line-carries-colour" opts={{ from: 'base' }} className="section ground-inverse" id="process" aria-labelledby="process-h">
      <div className="wrap">
        <div className="section-head"><h2 id="process-h">{heading}</h2></div>
        <ol className="steps grid">
          {steps.map((s, i) => (
            <li className="step span-4" key={i}>
              <div className="step__media">{s.image && <img src={s.image} alt={s.imageAlt} loading="lazy" />}</div>
              <p className="step__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </MomentSection>
  )
}

function Popular({ products }) {
  const { text } = useSite().settings
  const featured = products.filter(p => p.featured).slice(0, 4)
  const list = featured.length ? featured : products.slice(0, 4)
  if (!list.length) return null
  return (
    <section className="section" id="popular" aria-labelledby="popular-h">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div><h2 id="popular-h">{text.popularHeading}</h2></div>
          <Link className="btn btn--secondary" to="/products">{text.seeAllLabel}</Link>
        </div>
        <div className="grid">
          {list.map(p => <div key={p.id} className="span-3"><ProductTile product={p} /></div>)}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { faqs, settings } = useSite()
  if (!faqs.length) return null
  return (
    <section className="section ground-surface" id="faq" aria-labelledby="faq-h">
      <div className="wrap grid">
        <div className="span-5">
          <div className="section-head"><h2 id="faq-h">{settings.text.faqHeading}</h2></div>
          <div className="btn-row"><Link className="btn btn--secondary" to="/faqs">Read all questions</Link></div>
        </div>
        <div className="faq span-6 start-7">
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
      <Designer />
      <Range products={products} />
      <Statement />
      <Process />
      <Popular products={products} />
      <Faq />
    </main>
  )
}
