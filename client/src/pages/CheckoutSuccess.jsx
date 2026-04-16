import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { verifyCheckoutSession } from '../api'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatPkr } from '../utils/money'

export default function CheckoutSuccess() {
  usePageTitle('Order complete')
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const codState = location.state?.cod
  const codOrderId = location.state?.orderId
  const codMessage = location.state?.message

  const [loading, setLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    verifyCheckoutSession(sessionId)
      .then((res) => {
        if (cancelled) return
        if (res.success && res.order) {
          setOrder(res.order)
          setPaid(Boolean(res.paid))
        } else {
          setError(res.message || 'Could not verify payment.')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Verification failed.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (codState && codOrderId) {
    return (
      <div className="bg-slate-50 min-h-[50vh] py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="text-5xl mb-4" aria-hidden>
            ✓
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Order placed</h1>
          <p className="text-slate-600 mt-3 text-sm leading-relaxed">{codMessage}</p>
          <p className="mt-4 text-sm text-slate-500">
            Reference: <span className="font-mono text-slate-800">{codOrderId}</span>
          </p>
          <Link
            to="/products"
            className="inline-block mt-10 rounded-xl bg-brand-orange text-white px-6 py-3 font-semibold"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  if (sessionId && loading) {
    return (
      <div className="bg-slate-50 min-h-[40vh] flex items-center justify-center text-slate-600">
        Confirming payment…
      </div>
    )
  }

  if (sessionId && error) {
    return (
      <div className="bg-slate-50 min-h-[50vh] py-16 px-4 text-center">
        <h1 className="text-xl font-bold text-brand-navy">Could not confirm</h1>
        <p className="text-red-700 text-sm mt-3">{error}</p>
        <Link to="/contact" className="inline-block mt-8 text-brand-orange font-semibold">
          Contact us
        </Link>
      </div>
    )
  }

  if (sessionId && order) {
    return (
      <div className="bg-slate-50 min-h-[50vh] py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h1 className="text-2xl font-bold text-brand-navy">
            {paid ? 'Thank you — payment received' : 'Order update'}
          </h1>
          <p className="text-slate-600 mt-3 text-sm">
            {paid
              ? 'We will prepare your shipment and contact you with delivery details.'
              : `Status: ${order.status}. If something looks wrong, reach out with your order ID.`}
          </p>
          <div className="mt-8 rounded-2xl bg-white border border-slate-100 p-6 text-left text-sm shadow-card">
            <p className="text-slate-500">Order ID</p>
            <p className="font-mono text-brand-navy">{order.id}</p>
            <p className="text-slate-500 mt-4">Total</p>
            <p className="font-semibold text-brand-navy">{formatPkr(order.totalPkr)}</p>
            <p className="text-slate-500 mt-4">Ship to</p>
            <p className="text-slate-800">{order.customerName}</p>
          </div>
          <Link
            to="/products"
            className="inline-block mt-10 rounded-xl bg-brand-orange text-white px-6 py-3 font-semibold"
          >
            Back to products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-[40vh] py-16 px-4 text-center">
      <p className="text-slate-600">No order information here.</p>
      <Link to="/products" className="inline-block mt-6 text-brand-orange font-semibold">
        Browse products
      </Link>
    </div>
  )
}
