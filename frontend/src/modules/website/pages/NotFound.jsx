import { Link } from 'react-router-dom'
import usePageMeta from '../components/usePageMeta.js'

export default function NotFound() {
  usePageMeta('Page not found')
  return (
    <main id="top">
      <section className="section flow" aria-labelledby="nf-h">
        <div className="wrap">
          <div className="section-head">
            <h1 id="nf-h" className="page-title">This page does not exist</h1>
            <p>The link may be old. Start from the full range.</p>
          </div>
          <div className="btn-row">
            <Link className="btn btn--primary" to="/products">See all batteries</Link>
            <Link className="btn btn--secondary" to="/">Go to the home page</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
