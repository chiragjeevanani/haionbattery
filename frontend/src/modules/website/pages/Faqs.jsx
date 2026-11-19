import { Link } from 'react-router-dom'
import { useSite } from '../components/siteState.js'
import usePageMeta from '../components/usePageMeta.js'

export default function Faqs() {
  const { faqs, settings } = useSite()
  usePageMeta(`Questions: ${settings.siteName}`, 'Answers about battery chemistry, custom packs, protection and how to get a price.')
  return (
    <main id="top">
      <section className="section flow" aria-labelledby="faqs-h">
        <div className="wrap grid">
          <div className="span-5">
            <div className="section-head">
              <h1 id="faqs-h" className="page-title">{settings.text.faqHeading}</h1>
              <p>Not here? <Link className="link" to="/contact">Ask us directly</Link>.</p>
            </div>
          </div>
          <div className="faq span-6 start-7">
            {faqs.map(f => <div className="faq__item" key={f.id}><h2 className="faq-q">{f.question}</h2><p>{f.answer}</p></div>)}
          </div>
        </div>
      </section>
    </main>
  )
}
