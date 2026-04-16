import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCatalog } from '../api'
import { useCart } from '../context/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPkr } from '../utils/money'

function findProductInCatalog(catalog, id) {
  if (!catalog?.categories || !id) return null
  for (const cat of catalog.categories) {
    const found = cat.items.find((i) => i.id === id)
    if (found) return { ...found, categoryTitle: cat.title, categoryId: cat.id }
  }
  return null
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [catalog, setCatalog] = useState(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')

  const product = findProductInCatalog(catalog, id)

  usePageTitle(product?.name || 'Product')

  useEffect(() => {
    let cancelled = false
    fetchCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load product.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (catalog && id && !product) {
      navigate('/products', { replace: true })
    }
  }, [catalog, id, product, navigate])

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-red-700">{error}</p>
        <Link to="/products" className="text-brand-orange font-semibold mt-4 inline-block">
          ← Back to products
        </Link>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-slate-600">
        {catalog ? 'Product not found.' : 'Loading…'}
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-[60vh]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <nav className="text-sm text-slate-500 mb-6">
          <Link to="/products" className="hover:text-brand-orange">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-card">
            <img src={product.image} alt="" className="w-full object-cover aspect-[4/3]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-amber uppercase tracking-wide">
              {product.categoryTitle}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-brand-navy">{product.name}</h1>
            <p className="mt-4 text-slate-600 leading-relaxed">{product.note}</p>
            <p className="mt-6 text-2xl font-bold text-brand-navy">{formatPkr(product.pricePkr)}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <span className="font-medium">Qty</span>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 px-3 py-2 bg-white"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  addItem(
                    {
                      id: product.id,
                      name: product.name,
                      pricePkr: product.pricePkr,
                      image: product.image,
                      categoryTitle: product.categoryTitle,
                    },
                    qty
                  )
                  navigate('/cart')
                }}
                className="rounded-xl bg-brand-orange text-white px-8 py-3 font-semibold hover:bg-orange-600 transition shadow-md"
              >
                Add to cart
              </button>
            </div>

            <p className="mt-8 text-xs text-slate-500 leading-relaxed max-w-md">
              Prices include catalogue list pricing. Delivery charges may apply based on your
              address — our team will confirm after you place an order.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
