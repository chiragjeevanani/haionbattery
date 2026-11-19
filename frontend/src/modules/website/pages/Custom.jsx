import { useSite } from '../components/siteState.js'
import usePageMeta from '../components/usePageMeta.js'
import EnquiryForm from '../components/EnquiryForm.jsx'

export default function Custom() {
  const { settings, whatsappUrl } = useSite()
  const c = settings.custom
  usePageMeta(`Custom battery packs: ${settings.siteName}`, c.text)
  return (
    <main id="top">
      <section className="section flow" aria-labelledby="custom-page-h">
        <div className="wrap grid grid--top">
          <div className="span-6 stack-5">
            <div className="section-head">
              <h1 id="custom-page-h" className="page-title">{c.heading}</h1>
              <p>{c.text}</p>
            </div>
            <div className="frame frame--photo custom-photo">
              <img className="frame__img" src={c.image} alt={c.imageAlt} />
            </div>
            <p className="t-small muted">Prefer to talk? <a className="link" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>.</p>
          </div>
          <div className="span-5 start-8">
            <EnquiryForm
              type="custom"
              fields={[
                { name: 'vehicle', label: 'Vehicle' },
                { name: 'voltage', label: 'Voltage, in volts', inputMode: 'decimal' },
                { name: 'capacity', label: 'Capacity, in amp-hours', inputMode: 'decimal' },
              ]}
              messageLabel="Peak current, size limit and anything else"
              submitLabel="Request a custom pack"
              sentLine="Your custom pack request is in. We will contact you with a quote."
            />
          </div>
        </div>
      </section>
    </main>
  )
}
