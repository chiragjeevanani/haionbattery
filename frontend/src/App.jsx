import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import WebsiteRoutes from './modules/website/routes/WebsiteRoutes.jsx'

// The admin panel is a separate bundle: visitors to the website never download it.
const AdminRoutes = lazy(() => import('./modules/admin/routes/AdminRoutes.jsx'))

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={null}>
            <AdminRoutes />
          </Suspense>
        }
      />
      <Route path="/*" element={<WebsiteRoutes />} />
    </Routes>
  )
}
