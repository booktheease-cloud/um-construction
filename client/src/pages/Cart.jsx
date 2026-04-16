import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPkr } from '../utils/money'

export default function Cart() {
  usePageTitle('Cart')
  const { items, setQty, removeItem, subtotalPkr } = useCart()

  if (items.length === 0) {
    return (
      <div className="bg-slate-50 min-h-[50vh]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-navy">Your cart is empty</h1>
          <p className="text-slate-600 mt-3">Browse products and add what you need.</p>
          <Link
            to="/products"
            className="inline-block mt-8 rounded-xl bg-brand-orange text-white px-6 py-3 font-semibold"
          >
            View products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-[50vh]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-brand-navy">Shopping cart</h1>
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((line) => (
              <div
                key={line.productId}
                className="flex gap-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-card"
              >
                <Link to={`/products/${line.productId}`} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  {line.image ? (
                    <img src={line.image} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${line.productId}`}
                    className="font-semibold text-brand-navy hover:text-brand-orange"
                  >
                    {line.name}
                  </Link>
                  {line.categoryTitle ? (
                    <p className="text-xs text-slate-500 mt-0.5">{line.categoryTitle}</p>
                  ) : null}
                  <p className="text-sm font-semibold text-brand-navy mt-2">
                    {formatPkr(line.pricePkr)} each
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="text-sm text-slate-600 flex items-center gap-2">
                      Qty
                      <select
                        value={line.qty}
                        onChange={(e) => setQty(line.productId, Number(e.target.value))}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      >
                        {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(line.productId)}
                      className="text-sm text-red-600 font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold text-brand-navy shrink-0">
                  {formatPkr(line.pricePkr * line.qty)}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-card h-fit sticky top-24">
            <h2 className="font-bold text-brand-navy text-lg">Order summary</h2>
            <div className="mt-4 flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-navy">{formatPkr(subtotalPkr)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Taxes and delivery confirmed at checkout.</p>
            <Link
              to="/checkout"
              className="mt-6 block w-full text-center rounded-xl bg-brand-orange text-white py-3 font-semibold hover:bg-orange-600 transition"
            >
              Proceed to checkout
            </Link>
            <Link
              to="/products"
              className="mt-3 block w-full text-center text-sm font-semibold text-brand-blue hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
