import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import ContactInquiry from './models/ContactInquiry.js'
import QuoteRequest from './models/QuoteRequest.js'
import ServiceBooking from './models/ServiceBooking.js'
import Order from './models/Order.js'
import { productCategories } from './data/catalog.js'
import { registerStoreRoutes } from './storeRoutes.js'
import { isAuthorizedAdmin } from './adminAuth.js'

const app = express()
const PORT = process.env.PORT || 5000

const dbReady = () => mongoose.connection.readyState === 1

const requireDb = (_req, res, next) => {
  if (!dbReady()) {
    return res.status(503).json({
      success: false,
      message:
        'Database is not configured. Set MONGODB_URI in server/.env (see .env.example).',
    })
  }
  next()
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(morgan('dev'))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '48kb' }))

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
})

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    db: dbReady() ? 'connected' : 'disconnected',
  })
})

app.post('/api/contact', writeLimiter, requireDb, async (req, res) => {
  try {
    const { name, phone, service, message } = req.body || {}
    if (!name || !phone) {
      return res
        .status(400)
        .json({ success: false, message: 'Name and phone are required.' })
    }
    const doc = await ContactInquiry.create({ name, phone, service, message })
    res.status(201).json({ success: true, id: doc._id })
  } catch {
    res.status(500).json({ success: false, message: 'Could not save inquiry.' })
  }
})

app.post('/api/quotes', writeLimiter, requireDb, async (req, res) => {
  try {
    const { name, phone, service, problemDescription, location } = req.body || {}
    if (!phone || !service || !problemDescription || !location) {
      return res.status(400).json({
        success: false,
        message: 'Phone, service, problem description, and location are required.',
      })
    }
    const doc = await QuoteRequest.create({
      name,
      phone,
      service,
      problemDescription,
      location,
    })
    res.status(201).json({ success: true, id: doc._id })
  } catch {
    res.status(500).json({ success: false, message: 'Could not save quote request.' })
  }
})

app.post('/api/bookings', writeLimiter, requireDb, async (req, res) => {
  try {
    const { name, phone, service, preferredDate, preferredTime, address, notes } =
      req.body || {}
    if (!name || !phone || !service || !preferredDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, service, and preferred date are required.',
      })
    }
    const doc = await ServiceBooking.create({
      name,
      phone,
      service,
      preferredDate,
      preferredTime,
      address,
      notes,
    })
    res.status(201).json({ success: true, id: doc._id })
  } catch {
    res.status(500).json({ success: false, message: 'Could not save booking.' })
  }
})

app.get('/api/admin/inquiries', async (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' })
  }
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: 'Database unavailable.' })
  }
  const [
    contacts,
    quotes,
    bookings,
    orders,
    contactCount,
    quoteCount,
    bookingCount,
    orderCount,
  ] = await Promise.all([
    ContactInquiry.find().sort({ createdAt: -1 }).limit(50).lean(),
    QuoteRequest.find().sort({ createdAt: -1 }).limit(50).lean(),
    ServiceBooking.find().sort({ createdAt: -1 }).limit(50).lean(),
    Order.find().sort({ createdAt: -1 }).limit(100).lean(),
    ContactInquiry.countDocuments(),
    QuoteRequest.countDocuments(),
    ServiceBooking.countDocuments(),
    Order.countDocuments(),
  ])

  const catalogProductCount = productCategories.reduce((n, cat) => n + cat.items.length, 0)

  res.json({
    success: true,
    contacts,
    quotes,
    bookings,
    orders,
    catalog: {
      categories: productCategories,
      totalProductCount: catalogProductCount,
    },
    counts: {
      contacts: contactCount,
      quotes: quoteCount,
      bookings: bookingCount,
      orders: orderCount,
    },
  })
})

registerStoreRoutes(app, { requireDb, writeLimiter })

const start = async () => {
  const uri = process.env.MONGODB_URI
  if (uri) {
    try {
      await mongoose.connect(uri)
      console.log('MongoDB connected')
    } catch (err) {
      console.error('MongoDB connection error:', err.message)
    }
  } else {
    console.warn(
      'MONGODB_URI not set — POST /api/contact, /api/quotes, /api/bookings, /api/orders will return 503.'
    )
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
  })
}

start()
