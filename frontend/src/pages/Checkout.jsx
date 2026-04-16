import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchCatalog, submitOrder } from '../api'
import { useCart } from '../context/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPkr } from '../utils/money'

export default function Checkout() {
  usePageTitle('Checkout')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { items, subtotalPkr, clearCart } = useCart()

  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const cancelledCheckout = searchParams.get('cancelled') === '1'

  useEffect(() => {
    fetchCatalog()
      .then((d) => setStripeEnabled(Boolean(d.stripeEnabled)))
      .catch(() => setStripeEnabled(false))
  }, [])

  useEffect(() => {
    if (!stripeEnabled && paymentMethod === 'stripe') setPaymentMethod('cod')
  }, [stripeEnabled, paymentMethod])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        customer: { name, email, phone, address },
        paymentMethod,
      }
      const res = await submitOrder(payload)
      if (!res.success) {
        setError(res.message || 'Order failed.')
        setSubmitting(false)
        return
      }
      if (paymentMethod === 'stripe' && res.stripeUrl) {
        clearCart()
        window.location.href = res.stripeUrl
        return
      }
      clearCart()
      navigate('/checkout/success', {
        replace: true,
        state: { cod: true, orderId: res.orderId, message: res.message },
      })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not place order. Is MongoDB configured on the server?'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-50 min-h-[50vh]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-navy">Nothing to check out</h1>
          <p className="text-slate-600 mt-3">Add products to your cart first.</p>
          <Link
            to="/products"
            className="inline-block mt-8 rounded-xl bg-brand-orange text-white px-6 py-3 font-semibold"
          >
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-[50vh] py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-brand-navy">Checkout</h1>
        <p className="text-slate-600 mt-2 text-sm">
          Total <span className="font-semibold text-brand-navy">{formatPkr(subtotalPkr)}</span> ·{' '}
          {items.reduce((s, i) => s + i.qty, 0)} items
        </p>

        {cancelledCheckout && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
            Card checkout was cancelled. You can try again or choose pay on delivery.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="co-name" className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="co-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="co-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="co-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="co-phone" className="block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="co-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="co-address" className="block text-sm font-medium text-slate-700">
              Delivery address
            </label>
            <textarea
              id="co-address"
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Area, street, building, city"
            />
          </div>

          <fieldset className="border border-slate-100 rounded-xl p-4">
            <legend className="text-sm font-semibold text-brand-navy px-1">Payment</legend>
            <div className="space-y-3 mt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-slate-800">Pay on delivery</span>
                  <span className="block text-xs text-slate-500">
                    Pay cash or transfer when you receive the order. We will confirm by phone.
                  </span>
                </span>
              </label>
              {stripeEnabled && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium text-slate-800">Pay with card</span>
                    <span className="block text-xs text-slate-500">
                      Secure checkout powered by Stripe (PKR).
                    </span>
                  </span>
                </label>
              )}
            </div>
          </fieldset>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-brand-orange text-white py-3 font-semibold hover:bg-orange-600 transition disabled:opacity-60"
            >
              {submitting ? 'Processing…' : paymentMethod === 'stripe' ? 'Continue to payment' : 'Place order'}
            </button>
            <Link
              to="/cart"
              className="flex-1 text-center rounded-xl border border-slate-200 py-3 font-semibold text-brand-navy hover:bg-slate-50"
            >
              Back to cart
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
