import { Link } from 'react-router-dom'
import { useSite } from './siteState.js'
import { headlineSpecs, priceInfo } from './productUtils.js'

/** One product card for the whole site: the picture, the two figures that decide the purchase set large, the price. */
export default function ProductTile({ product }) {
  const { settings } = useSite()
  const image = product.images?.[0]
  const [a, b] = headlineSpecs(product)
  const price = priceInfo(product, settings.showPrices)
  return (
    <Link className="tile tile--spec" to={`/products/${product.slug}`}>
      <div className="tile__media">
        {image
          ? <img src={image} alt={product.name} width="640" height="480" loading="lazy" decoding="async" />
          : <img className="tile__fallback" src="/favicon.png" alt="" width="64" height="64" />}
      </div>
      <p className="spec-line"><span className="spec-a">{a}</span>{b && <span className="spec-b">{b}</span>}</p>
      <div className="tile__head"><h3>{product.name}</h3></div>
      <p className="tile__price-line">
        {price
          ? <><b>{price.prefix}{price.amount}</b>{price.mrp && <s>{price.mrp}</s>}{price.note && <span>{price.note}</span>}</>
          : <span>Price on request</span>}
      </p>
    </Link>
  )
}
