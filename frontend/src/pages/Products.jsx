import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCatalog } from '../api'
import { useCart } from '../context/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPkr } from '../utils/money'

export default function Products() {
  usePageTitle('Products')
  const { addItem } = useCart()
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load products. Is the server running?')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onAdd = (cat, item) => {
    addItem(
      {
        id: item.id,
        name: item.name,
        pricePkr: item.pricePkr,
        image: item.image,
        categoryTitle: cat.title,
      },
      1
    )
    setAddedId(item.id)
    window.setTimeout(() => setAddedId((id) => (id === item.id ? null : id)), 2000)
  }

  return (
    <div className="bg-slate-50">
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <p className="text-brand-amber text-sm font-semibold uppercase tracking-wide">Products</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Construction chemicals & materials</h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Browse our catalogue, add items to your cart, and check out online with card payment
            (when enabled) or pay on delivery across Pakistan.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 space-y-16">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {!catalog && !error && (
          <p className="text-slate-600 text-center py-12">Loading products…</p>
        )}
        {catalog?.categories?.map((cat) => (
          <section key={cat.id} id={cat.id}>
            <h2 className="text-2xl font-bold text-brand-navy mb-6">{cat.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.items.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-card flex flex-col"
                >
                  <Link to={`/products/${p.id}`} className="aspect-[4/3] overflow-hidden bg-slate-100 block">
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                  </Link>
                  <div className="p-5 flex-1 flex flex-col">
                    <Link to={`/products/${p.id}`}>
                      <h3 className="font-semibold text-brand-navy hover:text-brand-orange transition">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 mt-2 flex-1">{p.note}</p>
                    <p className="text-lg font-bold text-brand-navy mt-3">{formatPkr(p.pricePkr)}</p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => onAdd(cat, p)}
                        className="flex-1 rounded-xl bg-brand-orange text-white text-sm font-semibold py-2.5 hover:bg-orange-600 transition shadow-md"
                      >
                        {addedId === p.id ? 'Added ✓' : 'Add to cart'}
                      </button>
                      <Link
                        to={`/products/${p.id}`}
                        className="flex-1 inline-flex justify-center items-center rounded-xl border border-slate-200 text-brand-navy text-sm font-semibold py-2.5 hover:bg-slate-50 transition"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
