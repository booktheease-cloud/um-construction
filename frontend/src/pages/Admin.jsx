import { useMemo, useState } from 'react'
import {
  adminLogin,
  adminCreateService,
  adminCreatePortfolioProject,
  adminCreateProduct,
  adminDeleteService,
  adminDeletePortfolioProject,
  adminDeleteProduct,
  adminListServices,
  adminListPortfolioProjects,
  adminListProducts,
  adminUploadImage,
  adminUpdateService,
  adminUpdatePortfolioProject,
  adminUpdateProduct,
  fetchAdminInquiries,
} from '../api'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPkr } from '../utils/money'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'leads', label: 'Leads' },
  { id: 'orders', label: 'Orders' },
  { id: 'catalog', label: 'Products' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'services', label: 'Services' },
]

export default function Admin() {
  usePageTitle('Admin')
  const [username, setUsername] = useState(() => sessionStorage.getItem('adminUsername') || '')
  const [password, setPassword] = useState('')
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('adminToken') || '')
  const [data, setData] = useState(null)
  const [products, setProducts] = useState([])
  const [projects, setProjects] = useState([])
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('overview')

  const serviceItemCount = useMemo(
    () => services.reduce((n, c) => n + (c.items?.length || 0), 0),
    [services]
  )

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      let token = adminToken
      if (!token) {
        const loginRes = await adminLogin(username, password)
        token = loginRes?.token || ''
        if (!token) throw new Error('Login failed')
        setAdminToken(token)
        sessionStorage.setItem('adminToken', token)
        sessionStorage.setItem('adminUsername', loginRes?.username || username)
      }
      const [res, prodRes, projRes, svcRes] = await Promise.all([
        fetchAdminInquiries(token),
        adminListProducts(token).catch(() => null),
        adminListPortfolioProjects(token).catch(() => null),
        adminListServices(token).catch(() => null),
      ])
      setData(res)
      setProducts(Array.isArray(prodRes?.products) ? prodRes.products : [])
      setProjects(Array.isArray(projRes?.projects) ? projRes.projects : [])
      setServices(Array.isArray(svcRes?.categories) ? svcRes.categories : [])
    } catch (e) {
      setData(null)
      setProducts([])
      setProjects([])
      setServices([])
      setAdminToken('')
      sessionStorage.removeItem('adminToken')
      setError(e.response?.data?.message || e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-[60vh]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-navy">Admin panel</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Sign in with your admin username and password stored in the database.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Admin username"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={load}
            disabled={loading || (!adminToken && (!username || !password))}
            className="rounded-xl bg-brand-navy text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading…' : adminToken ? 'Refresh dashboard' : 'Sign in'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2 max-w-xl">
            {error}
          </p>
        )}

        {data?.success && (
          <div className="mt-10">
            <div className="flex gap-1 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-thin">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-3 py-2 rounded-t-lg text-sm font-medium transition ${
                    tab === t.id
                      ? 'bg-white text-brand-navy border border-b-0 border-slate-200 -mb-px shadow-sm'
                      : 'text-slate-600 hover:text-brand-navy'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl rounded-tr-xl p-5 sm:p-6 shadow-sm">
              {tab === 'overview' && (
                <Overview
                  counts={data.counts}
                  catalogTotal={data.catalog?.totalProductCount}
                  portfolioCount={data.portfolio?.totalProjectCount ?? projects.length}
                  serviceCategoriesCount={services.length}
                  serviceItemCount={serviceItemCount}
                />
              )}

              {tab === 'leads' && (
                <LeadsTab contacts={data.contacts} quotes={data.quotes} bookings={data.bookings} />
              )}

              {tab === 'orders' && <OrdersTab orders={data.orders || []} />}

              {tab === 'catalog' && (
                <CatalogTab
                  adminToken={adminToken}
                  products={products}
                  setProducts={setProducts}
                  dbConnected={data?.db === 'connected'}
                />
              )}

              {tab === 'portfolio' && (
                <PortfolioTab
                  adminToken={adminToken}
                  projects={projects}
                  setProjects={setProjects}
                  dbConnected={data?.db === 'connected'}
                />
              )}

              {tab === 'services' && (
                <ServicesTab
                  adminToken={adminToken}
                  categories={services}
                  setCategories={setServices}
                  dbConnected={data?.db === 'connected'}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Overview({
  counts,
  catalogTotal,
  portfolioCount,
  serviceCategoriesCount,
  serviceItemCount,
}) {
  const cards = [
    { label: 'Contact inquiries', value: counts?.contacts ?? '—', tone: 'bg-slate-100' },
    { label: 'Quote requests', value: counts?.quotes ?? '—', tone: 'bg-amber-50' },
    { label: 'Visit bookings', value: counts?.bookings ?? '—', tone: 'bg-blue-50' },
    { label: 'Shop orders', value: counts?.orders ?? '—', tone: 'bg-emerald-50' },
    { label: 'Catalogue SKUs', value: catalogTotal ?? '—', tone: 'bg-violet-50' },
    { label: 'Portfolio projects', value: portfolioCount, tone: 'bg-rose-50' },
    { label: 'Service categories', value: serviceCategoriesCount, tone: 'bg-cyan-50' },
    { label: 'Service line items', value: serviceItemCount, tone: 'bg-orange-50' },
  ]
  return (
    <div>
      <p className="text-sm text-slate-600 mb-6">
        Snapshot of database activity and static site content. Leads and orders require MongoDB.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.tone} border border-slate-100`}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-bold text-brand-navy mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadsTab({ contacts, quotes, bookings }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-semibold text-brand-navy mb-3">Recent contacts</h2>
        <ul className="space-y-2 text-sm">
          {contacts?.length ? (
            contacts.map((c) => (
              <li key={c._id} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="font-medium">{c.name}</span> · {c.phone}
                {c.service && <span className="text-slate-500"> · {c.service}</span>}
                <p className="text-slate-600 mt-1 whitespace-pre-wrap">{c.message}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(c.createdAt).toLocaleString()}</p>
              </li>
            ))
          ) : (
            <li className="text-slate-500 text-sm">No contact inquiries yet.</li>
          )}
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-brand-navy mb-3">Recent quote requests</h2>
        <ul className="space-y-2 text-sm">
          {quotes?.length ? (
            quotes.map((q) => (
              <li key={q._id} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="font-medium">{q.phone}</span> · {q.service}
                <p className="text-slate-600 mt-1">{q.problemDescription}</p>
                <p className="text-slate-500 mt-1">Location: {q.location}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(q.createdAt).toLocaleString()}</p>
              </li>
            ))
          ) : (
            <li className="text-slate-500 text-sm">No quote requests yet.</li>
          )}
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-brand-navy mb-3">Recent bookings</h2>
        <ul className="space-y-2 text-sm">
          {bookings?.length ? (
            bookings.map((b) => (
              <li key={b._id} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="font-medium">{b.name}</span> · {b.phone} · {b.service}
                <p className="text-slate-600 mt-1">
                  {b.preferredDate} {b.preferredTime}
                </p>
                <p className="text-slate-500 mt-1">{b.address}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(b.createdAt).toLocaleString()} · {b.status}
                </p>
              </li>
            ))
          ) : (
            <li className="text-slate-500 text-sm">No bookings yet.</li>
          )}
        </ul>
      </section>
    </div>
  )
}

function OrdersTab({ orders }) {
  if (!orders?.length) {
    return (
      <p className="text-sm text-slate-600">
        No orders in the database yet. Orders appear after customers complete checkout (MongoDB
        required).
      </p>
    )
  }
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o._id} className="border border-slate-100 rounded-xl p-4 text-sm bg-slate-50/80">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="font-mono text-xs text-slate-500">{o._id}</span>
            <span className="text-xs font-semibold uppercase text-brand-navy">
              {o.status} · {o.paymentMethod}
            </span>
          </div>
          <p className="mt-2 font-semibold text-brand-navy">{formatPkr(o.totalPkr)}</p>
          <p className="text-slate-700 mt-1">
            {o.customerName} · {o.email} · {o.phone}
          </p>
          <p className="text-slate-600 mt-1 whitespace-pre-wrap">{o.address}</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
            {o.items?.map((line, i) => (
              <li key={i}>
                {line.qty}× {line.name} @ {formatPkr(line.unitPricePkr)} —{' '}
                {formatPkr(line.unitPricePkr * line.qty)}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400 mt-2">{new Date(o.createdAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  )
}

function CatalogTab({ adminToken, products, setProducts, dbConnected }) {
  const [form, setForm] = useState({
    productId: '',
    name: '',
    note: '',
    image: '',
    pricePkr: '',
    categoryId: '',
    categoryTitle: '',
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [uploadingImage, setUploadingImage] = useState(false)

  const onImagePick = async (file) => {
    if (!file) return
    setUploadingImage(true)
    try {
      const res = await adminUploadImage(adminToken, file)
      if (!res?.success || !res?.imageUrl) throw new Error(res?.message || 'Upload failed')
      setForm((f) => ({ ...f, image: res.imageUrl }))
      setStatus({ type: 'success', message: 'Image uploaded.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Could not upload image.',
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const onCreate = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Saving…' })
    try {
      const payload = {
        ...form,
        pricePkr: Number(form.pricePkr),
      }
      const res = await adminCreateProduct(adminToken, payload)
      if (!res?.success) throw new Error(res?.message || 'Could not create product')
      setProducts((p) => [res.product, ...p])
      setForm({
        productId: '',
        name: '',
        note: '',
        image: '',
        pricePkr: '',
        categoryId: '',
        categoryTitle: '',
      })
      setStatus({ type: 'success', message: 'Product created.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Could not create product.',
      })
    }
  }

  const onPatch = async (id, patch) => {
    const prev = products
    setProducts((rows) => rows.map((r) => (r._id === id ? { ...r, ...patch } : r)))
    try {
      const res = await adminUpdateProduct(adminToken, id, patch)
      if (!res?.success) throw new Error(res?.message || 'Update failed')
      setProducts((rows) => rows.map((r) => (r._id === id ? res.product : r)))
    } catch {
      setProducts(prev)
    }
  }

  const onDelete = async (id) => {
    const prev = products
    setProducts((rows) => rows.filter((r) => r._id !== id))
    try {
      await adminDeleteProduct(adminToken, id)
    } catch {
      setProducts(prev)
    }
  }

  if (!dbConnected) {
    return (
      <p className="text-sm text-slate-600">
        Product management requires MongoDB. Set <code className="text-xs bg-slate-100 px-1 rounded">MONGODB_URI</code>{' '}
        in <code className="text-xs bg-slate-100 px-1 rounded">backend/.env</code>.
      </p>
    )
  }
  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        Add and edit products used on the public store pages. Orders will validate against the active
        products in the database.
      </p>

      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="font-semibold text-brand-navy">Add product</h3>
        <form onSubmit={onCreate} className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="productId (e.g. wp-4)"
            value={form.productId}
            onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Category ID (e.g. waterproofing)"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Category title (e.g. Waterproofing chemicals)"
            value={form.categoryTitle}
            onChange={(e) => setForm((f) => ({ ...f, categoryTitle: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Price PKR (e.g. 4200)"
            value={form.pricePkr}
            onChange={(e) => setForm((f) => ({ ...f, pricePkr: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          />
          <label className="rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-600 flex items-center justify-between gap-3">
            <span>{uploadingImage ? 'Uploading image…' : 'Or choose image from device'}</span>
            <input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(e) => onImagePick(e.target.files?.[0])}
              disabled={uploadingImage}
            />
          </label>
          <textarea
            className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            rows={2}
          />
          <div className="sm:col-span-2 flex items-center justify-between gap-3">
            {status.message ? (
              <p
                className={`text-xs rounded-lg px-2 py-1 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : status.type === 'error'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                {status.message}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="rounded-xl bg-brand-navy text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              disabled={status.type === 'loading'}
            >
              {status.type === 'loading' ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h3 className="font-semibold text-brand-navy mb-3">All products</h3>
        {!products.length ? (
          <p className="text-sm text-slate-600">No products yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Active</th>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium text-right">Price</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={p.active !== false}
                        onChange={(e) => onPatch(p._id, { active: e.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{p.productId}</td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                        value={p.name}
                        onChange={(e) => onPatch(p._id, { name: e.target.value })}
                      />
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                        value={p.note || ''}
                        onChange={(e) => onPatch(p._id, { note: e.target.value })}
                        placeholder="Note"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                        value={p.categoryTitle}
                        onChange={(e) => onPatch(p._id, { categoryTitle: e.target.value })}
                      />
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                        value={p.categoryId}
                        onChange={(e) => onPatch(p._id, { categoryId: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        className="w-28 text-right rounded-lg border border-slate-200 px-2 py-1.5"
                        value={String(p.pricePkr ?? '')}
                        onChange={(e) => onPatch(p._id, { pricePkr: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-red-700 hover:underline"
                        onClick={() => onDelete(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function PortfolioTab({ adminToken, projects, setProjects, dbConnected }) {
  const [form, setForm] = useState({
    title: '',
    location: '',
    description: '',
    beforeImage: '',
    afterImage: '',
    sortOrder: '',
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [uploadingBefore, setUploadingBefore] = useState(false)
  const [uploadingAfter, setUploadingAfter] = useState(false)

  const onPickPortfolioImage = async (file, field) => {
    if (!file) return
    const setUploading = field === 'beforeImage' ? setUploadingBefore : setUploadingAfter
    setUploading(true)
    try {
      const res = await adminUploadImage(adminToken, file)
      if (!res?.success || !res?.imageUrl) throw new Error(res?.message || 'Upload failed')
      setForm((f) => ({ ...f, [field]: res.imageUrl }))
      setStatus({ type: 'success', message: 'Image uploaded.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Could not upload image.',
      })
    } finally {
      setUploading(false)
    }
  }

  const onCreate = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Saving…' })
    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0),
      }
      const res = await adminCreatePortfolioProject(adminToken, payload)
      if (!res?.success) throw new Error(res?.message || 'Could not create')
      setProjects((p) => [res.project, ...p])
      setForm({
        title: '',
        location: '',
        description: '',
        beforeImage: '',
        afterImage: '',
        sortOrder: '',
      })
      setStatus({ type: 'success', message: 'Project created.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Could not create project.',
      })
    }
  }

  const onPatch = async (id, patch) => {
    const prev = projects
    setProjects((rows) => rows.map((r) => (r._id === id ? { ...r, ...patch } : r)))
    try {
      const res = await adminUpdatePortfolioProject(adminToken, id, patch)
      if (!res?.success) throw new Error('Update failed')
      setProjects((rows) => rows.map((r) => (r._id === id ? res.project : r)))
    } catch {
      setProjects(prev)
    }
  }

  const onDelete = async (id) => {
    const prev = projects
    setProjects((rows) => rows.filter((r) => r._id !== id))
    try {
      await adminDeletePortfolioProject(adminToken, id)
    } catch {
      setProjects(prev)
    }
  }

  if (!dbConnected) {
    return (
      <p className="text-sm text-slate-600">
        Portfolio management requires MongoDB. Set <code className="text-xs bg-slate-100 px-1 rounded">MONGODB_URI</code>{' '}
        in <code className="text-xs bg-slate-100 px-1 rounded">backend/.env</code>.
      </p>
    )
  }
  return (
    <div>
      <p className="text-sm text-slate-600 mb-6">Manage before/after transformations shown on the public portfolio page.</p>

      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="font-semibold text-brand-navy">Add portfolio project</h3>
        <form onSubmit={onCreate} className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Location (optional)"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Sort order (higher shows first)"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2"
            placeholder="Before image URL"
            value={form.beforeImage}
            onChange={(e) => setForm((f) => ({ ...f, beforeImage: e.target.value }))}
            required
          />
          <label className="rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-600 sm:col-span-2 flex items-center justify-between gap-3">
            <span>{uploadingBefore ? 'Uploading before image…' : 'Choose before image from device'}</span>
            <input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(e) => onPickPortfolioImage(e.target.files?.[0], 'beforeImage')}
              disabled={uploadingBefore}
            />
          </label>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2"
            placeholder="After image URL"
            value={form.afterImage}
            onChange={(e) => setForm((f) => ({ ...f, afterImage: e.target.value }))}
            required
          />
          <label className="rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-600 sm:col-span-2 flex items-center justify-between gap-3">
            <span>{uploadingAfter ? 'Uploading after image…' : 'Choose after image from device'}</span>
            <input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(e) => onPickPortfolioImage(e.target.files?.[0], 'afterImage')}
              disabled={uploadingAfter}
            />
          </label>
          <textarea
            className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2"
            placeholder="Description (optional)"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="sm:col-span-2 flex items-center justify-between gap-3">
            {status.message ? (
              <p
                className={`text-xs rounded-lg px-2 py-1 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : status.type === 'error'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                {status.message}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="rounded-xl bg-brand-navy text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              disabled={status.type === 'loading'}
            >
              {status.type === 'loading' ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </section>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <article
            key={proj._id}
            className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50"
          >
            <div className="grid grid-cols-2 gap-px bg-slate-200">
              <img
                src={proj.beforeImage}
                alt=""
                className="h-28 w-full object-cover"
                loading="lazy"
              />
              <img
                src={proj.afterImage}
                alt=""
                className="h-28 w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3 space-y-2">
              <input
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold text-brand-navy"
                value={proj.title}
                onChange={(e) => onPatch(proj._id, { title: e.target.value })}
              />
              <input
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                value={proj.location || ''}
                placeholder="Location"
                onChange={(e) => onPatch(proj._id, { location: e.target.value })}
              />
              <textarea
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                value={proj.description || ''}
                placeholder="Description"
                rows={3}
                onChange={(e) => onPatch(proj._id, { description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  value={String(proj.sortOrder ?? 0)}
                  onChange={(e) => onPatch(proj._id, { sortOrder: e.target.value })}
                  placeholder="Sort order"
                />
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={proj.active !== false}
                    onChange={(e) => onPatch(proj._id, { active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-red-700 hover:underline"
                  onClick={() => onDelete(proj._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ServicesTab({ adminToken, categories, setCategories, dbConnected }) {
  const [form, setForm] = useState({
    id: '',
    title: '',
    summary: '',
    image: '',
    sortOrder: '',
    itemsText: '',
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [uploadingImage, setUploadingImage] = useState(false)

  const parseItemsText = (text) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, ...rest] = line.split('|')
        return { name: name?.trim() || '', description: rest.join('|').trim() }
      })
      .filter((row) => row.name && row.description)

  const toItemsText = (items) =>
    (items || []).map((row) => `${row.name} | ${row.description}`).join('\n')

  const onCreate = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Saving…' })
    try {
      const payload = {
        id: form.id.trim(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        image: form.image.trim(),
        sortOrder: Number(form.sortOrder || 0),
        items: parseItemsText(form.itemsText),
      }
      const res = await adminCreateService(adminToken, payload)
      if (!res?.success) throw new Error(res?.message || 'Could not create service category')
      setCategories((rows) => [res.category, ...rows])
      setForm({ id: '', title: '', summary: '', image: '', sortOrder: '', itemsText: '' })
      setStatus({ type: 'success', message: 'Service category created.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Could not create service category.',
      })
    }
  }

  const onImagePick = async (file) => {
    if (!file) return
    setUploadingImage(true)
    try {
      const res = await adminUploadImage(adminToken, file)
      if (!res?.success || !res?.imageUrl) throw new Error(res?.message || 'Upload failed')
      setForm((f) => ({ ...f, image: res.imageUrl }))
      setStatus({ type: 'success', message: 'Image uploaded.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Could not upload image.',
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const onPatch = async (id, patch) => {
    const prev = categories
    setCategories((rows) => rows.map((r) => (r._id === id ? { ...r, ...patch } : r)))
    try {
      const res = await adminUpdateService(adminToken, id, patch)
      if (!res?.success) throw new Error(res?.message || 'Update failed')
      setCategories((rows) => rows.map((r) => (r._id === id ? res.category : r)))
    } catch {
      setCategories(prev)
    }
  }

  const onDelete = async (id) => {
    const prev = categories
    setCategories((rows) => rows.filter((r) => r._id !== id))
    try {
      await adminDeleteService(adminToken, id)
    } catch {
      setCategories(prev)
    }
  }

  if (!dbConnected) {
    return (
      <p className="text-sm text-slate-600">
        Service management requires MongoDB. Set <code className="text-xs bg-slate-100 px-1 rounded">MONGODB_URI</code>{' '}
        in <code className="text-xs bg-slate-100 px-1 rounded">backend/.env</code>.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        Add and edit service categories shown on the public services page.
      </p>

      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="font-semibold text-brand-navy">Add service category</h3>
        <form onSubmit={onCreate} className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="id (e.g. waterproofing)"
            value={form.id}
            onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2"
            placeholder="Summary"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            required
          />
          <label className="rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-600 flex items-center justify-between gap-3">
            <span>{uploadingImage ? 'Uploading image…' : 'Or choose image from device'}</span>
            <input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(e) => onImagePick(e.target.files?.[0])}
              disabled={uploadingImage}
            />
          </label>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Sort order (higher shows first)"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
          />
          <textarea
            className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2"
            placeholder="Items, one per line: Name | Description"
            value={form.itemsText}
            onChange={(e) => setForm((f) => ({ ...f, itemsText: e.target.value }))}
            rows={4}
          />
          <div className="sm:col-span-2 flex items-center justify-between gap-3">
            {status.message ? (
              <p
                className={`text-xs rounded-lg px-2 py-1 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : status.type === 'error'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                {status.message}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="rounded-xl bg-brand-navy text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              disabled={status.type === 'loading'}
            >
              {status.type === 'loading' ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-4">
        {categories.map((cat) => (
          <article key={cat._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <input
                className="rounded-lg border border-slate-200 px-2 py-1.5 font-mono"
                value={cat.id || ''}
                onChange={(e) => onPatch(cat._id, { id: e.target.value })}
              />
              <input
                className="rounded-lg border border-slate-200 px-2 py-1.5"
                value={cat.title || ''}
                onChange={(e) => onPatch(cat._id, { title: e.target.value })}
              />
              <input
                className="rounded-lg border border-slate-200 px-2 py-1.5 sm:col-span-2"
                value={cat.summary || ''}
                onChange={(e) => onPatch(cat._id, { summary: e.target.value })}
              />
              <input
                className="rounded-lg border border-slate-200 px-2 py-1.5 sm:col-span-2"
                value={cat.image || ''}
                onChange={(e) => onPatch(cat._id, { image: e.target.value })}
              />
              <textarea
                className="rounded-lg border border-slate-200 px-2 py-1.5 sm:col-span-2"
                value={toItemsText(cat.items)}
                onChange={(e) => onPatch(cat._id, { items: parseItemsText(e.target.value) })}
                rows={4}
              />
              <div className="flex items-center gap-3">
                <input
                  className="w-28 rounded-lg border border-slate-200 px-2 py-1.5"
                  value={String(cat.sortOrder ?? 0)}
                  onChange={(e) => onPatch(cat._id, { sortOrder: e.target.value })}
                />
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={cat.active !== false}
                    onChange={(e) => onPatch(cat._id, { active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-red-700 hover:underline"
                  onClick={() => onDelete(cat._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
        {!categories.length && <p className="text-sm text-slate-600">No service categories yet.</p>}
      </div>
    </div>
  )
}
