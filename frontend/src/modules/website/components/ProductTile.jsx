import { Link } from 'react-router-dom'
import { formatPrice } from '../../../lib/api.js'
import { specSummary } from './productUtils.js'

export default function ProductTile({ product, ratio }) {
  const image = product.images?.[0]
  return (
    <Link className="tile" to={`/products/${product.slug}`} style={ratio ? { '--tile-ratio': ratio } : undefined}>
      <div className="tile__media">
        {image
          ? <img src={image} alt={product.name} width="640" height="480" loading="lazy" decoding="async" />
          : <img className="tile__fallback" src="/favicon.png" alt="" width="64" height="64" />}
      </div>
      <div className="tile__head">
        <h3>{product.name}</h3>
        {product.price != null && <span className="tile__price">{formatPrice(product.price)}</span>}
      </div>
      <p className="tile__facts">{specSummary(product) || product.category?.name}</p>
    </Link>
  )
}
