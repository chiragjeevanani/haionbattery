import { useSite } from '../components/siteState.js'
import usePageMeta from '../components/usePageMeta.js'
import EnquiryForm from '../components/EnquiryForm.jsx'

export default function Contact() {
  const { settings, whatsappUrl, telUrl, mailUrl } = useSite()
  usePageMeta(`Contact: ${settings.siteName}`, `Ask ${settings.siteName} for a battery quote by form, phone or WhatsApp.`)
  return (
    <main id="top">
      <section className="section flow" aria-labelledby="contact-h">
        <div className="wrap grid grid--top">
          <div className="span-5 stack-5">
            <div className="section-head">
              <h1 id="contact-h" className="page-title">{settings.text.quoteLabel}</h1>
              <p>{settings.text.contactText}</p>
            </div>
            <ul className="rows">
              {settings.phone && (
                <li><span className="rows__name">Call</span><span className="rows__value">{telUrl ? <a className="link" href={telUrl}>{settings.phone}</a> : settings.phone}</span></li>
              )}
              <li><span className="rows__name">WhatsApp</span><span className="rows__value"><a className="link" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Open chat</a></span></li>
              {settings.email && <li><span className="rows__name">Email</span><span className="rows__value"><a className="link" href={mailUrl}>{settings.email}</a></span></li>}
              {settings.address && <li><span className="rows__name">Visit</span><span className="rows__value">{settings.address}</span></li>}
              {settings.hours && <li><span className="rows__name">Hours</span><span className="rows__value">{settings.hours}</span></li>}
            </ul>
          </div>
          <div className="span-6 start-7">
            <EnquiryForm
              type="quote"
              messageLabel="What do you need?"
              submitLabel={settings.text.quoteLabel}
              sentLine="Your quote request is in. We will contact you with a price."
            />
          </div>
        </div>
      </section>
    </main>
  )
}
