import { Link } from 'react-router-dom'
import { formatPrice } from '../../../lib/api.js'
import { headlineSpecs } from './productUtils.js'

/** One product card for the whole site: the picture, then the two figures that decide the purchase, set large. */
export default function ProductTile({ product }) {
  const image = product.images?.[0]
  const [a, b] = headlineSpecs(product)
  return (
    <Link className="tile tile--spec" to={`/products/${product.slug}`}>
      <div className="tile__media">
        {image
          ? <img src={image} alt={product.name} width="640" height="480" loading="lazy" decoding="async" />
          : <img className="tile__fallback" src="/favicon.png" alt="" width="64" height="64" />}
      </div>
      <p className="spec-line"><span className="spec-a">{a}</span>{b && <span className="spec-b">{b}</span>}</p>
      <div className="tile__head">
        <h3>{product.name}</h3>
        {product.price != null && <span className="tile__price">{formatPrice(product.price)}</span>}
      </div>
    </Link>
  )
}
