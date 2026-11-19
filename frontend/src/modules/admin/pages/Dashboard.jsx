import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Plus } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { PageHead } from '../components/ui.jsx'

const when = iso => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { adminApi.get('/stats').then(setStats).catch(e => setError(e.message)) }, [])

  if (error) return <div className="a-alert a-alert--error">{error}</div>
  if (!stats) return <p className="muted">Loading</p>

  return (
    <>
      <PageHead
        title="Dashboard"
        actions={<Link className="a-btn a-btn--primary" to="/admin/products/new"><Plus /> Add product</Link>}
      >
        What is on the website and who has written to you.
      </PageHead>

      {!stats.contactReady && (
        <div className="a-alert" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div>
            The WhatsApp number is still the placeholder, so every WhatsApp button on the site opens an empty chat.{' '}
            <Link to="/admin/settings">Set the phone and WhatsApp numbers</Link>.
          </div>
        </div>
      )}

      <div className="stat-row">
        <Link className="stat" to="/admin/enquiries"><b>{stats.newEnquiries}</b><span>New enquiries</span></Link>
        <Link className="stat" to="/admin/products"><b>{stats.activeProducts}</b><span>Products on the site ({stats.products} in total)</span></Link>
        <Link className="stat" to="/admin/categories"><b>{stats.categories}</b><span>Categories</span></Link>
        <Link className="stat" to="/admin/enquiries"><b>{stats.enquiries}</b><span>Enquiries received</span></Link>
      </div>

      <div className="a-card">
        <h2>Latest enquiries</h2>
        {stats.recent.length === 0 ? (
          <p className="a-empty">No enquiries yet. They appear here when someone fills in a quote form.</p>
        ) : (
          <div className="a-tablewrap" style={{ marginTop: 12 }}>
            <table className="a-table">
              <thead><tr><th>Name</th><th>About</th><th>Contact</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recent.map(e => (
                  <tr key={e.id}>
                    <td><Link to="/admin/enquiries">{e.name}</Link></td>
                    <td>{e.product || (e.type === 'custom' ? 'Custom pack' : 'General')}</td>
                    <td>{e.phone || e.email}</td>
                    <td>{when(e.createdAt)}</td>
                    <td><span className={`a-pill${e.status === 'new' ? ' red' : e.status === 'contacted' ? ' warn' : ' ok'}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
