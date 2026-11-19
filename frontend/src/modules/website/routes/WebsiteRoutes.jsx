import { Route, Routes } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout.jsx'
import Home from '../pages/Home.jsx'
import Products from '../pages/Products.jsx'
import ProductDetail from '../pages/ProductDetail.jsx'
import Custom from '../pages/Custom.jsx'
import About from '../pages/About.jsx'
import Contact from '../pages/Contact.jsx'
import Faqs from '../pages/Faqs.jsx'
import Credits from '../pages/Credits.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function WebsiteRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="custom" element={<Custom />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="credits" element={<Credits />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
