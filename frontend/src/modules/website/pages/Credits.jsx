import credits from '../data/credits.json'
import usePageMeta from '../components/usePageMeta.js'

export default function Credits() {
  usePageMeta('Photograph credits', 'Sources and licences for the photographs on this site.')
  return (
    <main id="top">
      <section className="section flow" aria-labelledby="credits-h">
        <div className="wrap">
          <div className="section-head"><h1 id="credits-h" className="page-title">Photograph credits</h1></div>
          <ul className="rows">
            {credits.map(c => (
              <li key={c.id}>
                <span className="rows__name"><a className="link" href={c.page} target="_blank" rel="noopener noreferrer">{c.by}</a></span>
                <span className="rows__value"><a className="link" href={c.licenceUrl} target="_blank" rel="noopener noreferrer">{c.licence}</a></span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
