import { Link } from 'react-router-dom'
import { useSite } from './siteState.js'
import Arrow from './Arrow.jsx'

export default function Footer() {
  const { settings, categories, whatsappUrl, telUrl, mailUrl } = useSite()
  const year = new Date().getFullYear()
  const social = Object.entries(settings.social || {}).filter(([, url]) => url)
  const { closing } = settings

  return (
    <footer className="footer closing footer--dark ground-inverse" id="contact" aria-labelledby="close-h">
      <div className="wrap">
        <div className="closing__cta close--photo">
          <div className="section-head--split">
            <div>
              <h2 id="close-h">Get a quote</h2>
              <p className="t-lead">Tell us the vehicle, voltage and capacity you need and we reply with a price.</p>
            </div>
            <Link className="btn btn--primary" to="/contact">Get a quote<Arrow /></Link>
          </div>
          <div className="close__media">
            <img src={closing.image} alt={closing.imageAlt} loading="lazy" style={{ '--pos': '50% 60%' }} />
          </div>
        </div>

        <div className="closing__links">
          <div className="grid">
            <div className="span-4 stack-4">
              <Link className="nav__logo" to="/" aria-label={`${settings.siteName}, home`}>
                <img className="nav__logo-img" src="/logo-light.png" alt={settings.siteName} width="150" height="44" />
              </Link>
              <p className="footer__lede">{settings.footerLede}</p>
            </div>
            <div className="span-2 start-6 footer__col">
              <h3>Batteries</h3>
              <ul>
                {categories.slice(0, 5).map(c => (
                  <li key={c.id}><Link to={`/products?category=${c.slug}`}>{c.name}</Link></li>
                ))}
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h3>Company</h3>
              <ul>
                <li><Link to="/custom">Custom packs</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/faqs">Questions</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="span-3 footer__col">
              <h3>Talk to us</h3>
              <ul>
                {settings.phone && <li>{telUrl ? <a href={telUrl}>{settings.phone}</a> : settings.phone}</li>}
                <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
                {settings.email && <li><a href={mailUrl}>{settings.email}</a></li>}
                {settings.address && <li>{settings.address}</li>}
                {settings.hours && <li>{settings.hours}</li>}
              </ul>
            </div>
          </div>
          <div className="footer__legal">
            <span>&copy; {year} {settings.siteName}</span>
            <div className="socials">
              {social.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="link">{name[0].toUpperCase() + name.slice(1)}</a>
              ))}
            </div>
            <Link className="credits" to="/credits">Photographs via Wikimedia Commons</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
