import Stripe from 'stripe'
import Order from './models/Order.js'
import {
  productCategories,
  resolveCartLines,
  sumLinesPkr,
  pkrToStripeUnitAmount,
} from './data/catalog.js'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key)
}

function normalizeCustomer(body) {
  const c = body?.customer || {}
  const name = typeof c.name === 'string' ? c.name.trim() : ''
  const email = typeof c.email === 'string' ? c.email.trim().toLowerCase() : ''
  const phone = typeof c.phone === 'string' ? c.phone.trim() : ''
  const address = typeof c.address === 'string' ? c.address.trim() : ''
  return { name, email, phone, address }
}

/**
 * @param {import('express').Express} app
 * @param {{ requireDb: import('express').RequestHandler, writeLimiter: import('express').RequestHandler }} opts
 */
export function registerStoreRoutes(app, { requireDb, writeLimiter }) {
  app.get('/api/products', (_req, res) => {
    res.json({
      categories: productCategories,
      stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
      currency: 'PKR',
    })
  })

  app.post('/api/orders', writeLimiter, requireDb, async (req, res) => {
    try {
      const { items, paymentMethod } = req.body || {}
      const pm = paymentMethod === 'stripe' ? 'stripe' : 'cod'
      const customer = normalizeCustomer(req.body)

      if (!customer.name || !customer.email || !customer.phone || !customer.address) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, phone, and delivery address are required.',
        })
      }
      if (customer.address.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a complete delivery address.',
        })
      }

      const resolved = resolveCartLines(items)
      if (!resolved.ok) {
        return res.status(400).json({ success: false, message: resolved.message })
      }
      const { lines } = resolved
      const totalPkr = sumLinesPkr(lines)

      if (pm === 'cod') {
        const order = await Order.create({
          customerName: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          items: lines,
          totalPkr,
          paymentMethod: 'cod',
          status: 'cod_confirmed',
        })
        return res.status(201).json({
          success: true,
          orderId: order._id.toString(),
          message: 'Order received. We will contact you to confirm delivery and payment on delivery.',
        })
      }

      const stripe = getStripe()
      if (!stripe) {
        return res.status(400).json({
          success: false,
          message: 'Card payment is not configured. Choose pay on delivery or contact us.',
        })
      }

      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'

      const order = await Order.create({
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        items: lines,
        totalPkr,
        paymentMethod: 'stripe',
        status: 'pending_payment',
      })

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customer.email,
        client_reference_id: order._id.toString(),
        metadata: { orderId: order._id.toString() },
        success_url: `${frontend}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontend}/checkout?cancelled=1`,
        line_items: lines.map((line) => ({
          quantity: line.qty,
          price_data: {
            currency: 'pkr',
            unit_amount: pkrToStripeUnitAmount(line.unitPricePkr),
            product_data: {
              name: line.name,
              images: line.image ? [line.image] : undefined,
              metadata: { productId: line.productId },
            },
          },
        })),
      })

      order.stripeSessionId = session.id
      await order.save()

      return res.status(201).json({
        success: true,
        orderId: order._id.toString(),
        stripeUrl: session.url,
      })
    } catch (err) {
      console.error('Order error:', err.message)
      res.status(500).json({ success: false, message: 'Could not process order.' })
    }
  })

  app.get('/api/orders/session', async (req, res) => {
    const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id.trim() : ''
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Missing session_id.' })
    }
    const stripe = getStripe()
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payments not configured.' })
    }
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      const orderId = session.metadata?.orderId || session.client_reference_id
      if (!orderId) {
        return res.status(404).json({ success: false, message: 'Order not found.' })
      }
      const order = await Order.findById(orderId).lean()
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' })
      }

      if (session.payment_status === 'paid' && order.status === 'pending_payment') {
        await Order.updateOne({ _id: orderId }, { $set: { status: 'paid' } })
      }

      const final = await Order.findById(orderId).lean()

      res.json({
        success: true,
        paid: session.payment_status === 'paid',
        paymentStatus: session.payment_status,
        order: final
          ? {
              id: final._id.toString(),
              status: final.status,
              totalPkr: final.totalPkr,
              customerName: final.customerName,
              currency: final.currency,
            }
          : null,
      })
    } catch (err) {
      console.error('Session verify:', err.message)
      res.status(400).json({ success: false, message: 'Could not verify payment session.' })
    }
  })
}
