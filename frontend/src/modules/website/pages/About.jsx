import { Link } from 'react-router-dom'
import { useSite } from '../components/siteState.js'
import usePageMeta from '../components/usePageMeta.js'
import Arrow from '../components/Arrow.jsx'

export default function About() {
  const { settings } = useSite()
  const a = settings.about
  usePageMeta(`About: ${settings.siteName}`, a.body.split('\n\n')[0])
  return (
    <main id="top">
      <section className="section flow" aria-labelledby="about-h">
        <div className="wrap grid grid--top">
          <div className="span-5 stack-5">
            <div className="section-head"><h1 id="about-h" className="page-title">{a.heading}</h1></div>
            {a.body.split('\n\n').map((para, i) => <p key={i} className="t-lead">{para}</p>)}
            <div className="btn-row"><Link className="btn btn--primary" to="/contact">{settings.text.quoteLabel}<Arrow /></Link></div>
          </div>
          <div className="frame frame--photo span-6 start-7 about-photo">
            <img className="frame__img" src={a.image} alt={a.imageAlt} />
          </div>
        </div>
      </section>
    </main>
  )
}
