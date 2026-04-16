import { useEffect, useMemo, useState } from 'react'
import { fetchAdminInquiries, loginAdmin } from '../api'
import { portfolioProjects } from '../data/portfolio'
import { serviceCategories } from '../data/serviceDetails'
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
  // Intentionally do NOT persist credentials across refresh.
  // Admin access should require re-entry each time the page is loaded.
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    // Clear any previously saved value from older versions of this page.
    try {
      sessionStorage.removeItem('adminPassword')
      sessionStorage.removeItem('adminToken')
    } catch {
      // Ignore if storage isn't available.
    }
    // Also reset in-memory token (no persistence across refresh).
  }, [])

  const serviceItemCount = useMemo(
    () => serviceCategories.reduce((n, c) => n + (c.items?.length || 0), 0),
    []
  )

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const loginRes = await loginAdmin({ username, password })
      if (!loginRes?.success || !loginRes?.token) {
        throw new Error(loginRes?.message || 'Login failed.')
      }
      const res = await fetchAdminInquiries(loginRes.token)
      setData(res)
      // Clear the input after loading so refresh/login behavior is consistent.
      setUsername('')
      setPassword('')
    } catch (e) {
      setData(null)
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
          Enter the admin credentials from your server config (see{' '}
          <code className="text-xs bg-slate-200 px-1 rounded">server/adminAuth.js</code> or{' '}
          <code className="text-xs bg-slate-200 px-1 rounded">ADMIN_PASSWORD</code> in{' '}
          <code className="text-xs bg-slate-200 px-1 rounded">server/.env</code>).
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
            disabled={loading || !username || !password}
            className="rounded-xl bg-brand-navy text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load dashboard'}
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
                  portfolioCount={portfolioProjects.length}
                  serviceCategoriesCount={serviceCategories.length}
                  serviceItemCount={serviceItemCount}
                />
              )}

              {tab === 'leads' && (
                <LeadsTab contacts={data.contacts} quotes={data.quotes} bookings={data.bookings} />
              )}

              {tab === 'orders' && <OrdersTab orders={data.orders || []} />}

              {tab === 'catalog' && <CatalogTab catalog={data.catalog} />}

              {tab === 'portfolio' && <PortfolioTab />}

              {tab === 'services' && <ServicesTab />}
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

function CatalogTab({ catalog }) {
  if (!catalog?.categories?.length) {
    return <p className="text-sm text-slate-600">Catalogue data was not returned.</p>
  }
  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        Live prices and SKUs match the server catalogue (
        <code className="text-xs bg-slate-100 px-1 rounded">server/data/catalog.js</code>).
      </p>
      {catalog.categories.map((cat) => (
        <section key={cat.id}>
          <h3 className="font-semibold text-brand-navy mb-3">{cat.title}</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Note</th>
                  <th className="px-3 py-2 font-medium text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {cat.items.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                    <td className="px-3 py-2 font-medium text-brand-navy">{p.name}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-xs">{p.note}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatPkr(p.pricePkr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

function PortfolioTab() {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-6">
        Portfolio case studies are defined in{' '}
        <code className="text-xs bg-slate-100 px-1 rounded">client/src/data/portfolio.js</code>.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {portfolioProjects.map((proj) => (
          <article
            key={proj.id}
            className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50"
          >
            <div className="grid grid-cols-2 gap-px bg-slate-200">
              <img src={proj.before} alt="" className="h-28 w-full object-cover" loading="lazy" />
              <img src={proj.after} alt="" className="h-28 w-full object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-brand-navy text-sm">{proj.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{proj.location}</p>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3">{proj.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ServicesTab() {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-6">
        Service copy lives in{' '}
        <code className="text-xs bg-slate-100 px-1 rounded">client/src/data/serviceDetails.js</code>.
      </p>
      <div className="space-y-6">
        {serviceCategories.map((cat) => (
          <section key={cat.id} className="rounded-xl border border-slate-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4">
              <img
                src={cat.image}
                alt=""
                className="w-full sm:w-40 h-28 object-cover rounded-lg shrink-0"
                loading="lazy"
              />
              <div>
                <h4 className="font-semibold text-brand-navy">{cat.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{cat.summary}</p>
              </div>
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {cat.items.map((item) => (
                <li key={item.name} className="px-4 py-3">
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-slate-600 mt-1">{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
