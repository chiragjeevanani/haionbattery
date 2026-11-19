import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../components/AuthContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import AdminLayout from '../components/AdminLayout.jsx'
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Products from '../pages/Products.jsx'
import ProductForm from '../pages/ProductForm.jsx'
import Categories from '../pages/Categories.jsx'
import Enquiries from '../pages/Enquiries.jsx'
import Settings from '../pages/Settings.jsx'
import Faqs from '../pages/Faqs.jsx'
import Account from '../pages/Account.jsx'

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="settings" element={<Settings />} />
            <Route path="faqs" element={<Faqs />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
