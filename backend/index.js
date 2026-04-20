import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import ContactInquiry from './models/ContactInquiry.js'
import QuoteRequest from './models/QuoteRequest.js'
import ServiceBooking from './models/ServiceBooking.js'
import Order from './models/Order.js'
import Product from './models/Product.js'
import PortfolioProject from './models/PortfolioProject.js'
import ServiceCategory from './models/ServiceCategory.js'
import AdminUser from './models/AdminUser.js'
import { productCategories } from './data/catalog.js'
import { registerStoreRoutes } from './storeRoutes.js'
import { bootstrapAdminFromEnv, isAuthorizedAdmin, loginAdmin, logoutAdminToken } from './adminAuth.js'

const app = express()
const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const dbReady = () => mongoose.connection.readyState === 1

const requireDb = (_req, res, next) => {
  if (!dbReady()) {
    return res.status(503).json({
      success: false,
      message:
        'Database is not configured. Set MONGODB_URI in backend/.env (see .env.example).',
    })
  }
  next()
}

const requireAdmin = async (req, res, next) => {
  const ok = await isAuthorizedAdmin(req)
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' })
  }
  next()
}

function groupProductsToCategories(products) {
  const byCat = new Map()
  for (const p of products) {
    const id = p.categoryId
    if (!byCat.has(id)) {
      byCat.set(id, { id, title: p.categoryTitle, items: [] })
    }
    byCat.get(id).items.push({
      id: p.productId,
      name: p.name,
      note: p.note || '',
      image: p.image || '',
      pricePkr: p.pricePkr,
    })
  }
  return Array.from(byCat.values()).sort((a, b) => a.title.localeCompare(b.title))
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
app.use('/uploads', express.static(uploadsDir))

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
})

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const safeOriginal = file.originalname.replace(/[^\w.-]/g, '_')
      cb(null, `${Date.now()}-${safeOriginal}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) return cb(null, true)
    cb(new Error('Only image files are allowed.'))
  },
})

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    db: dbReady() ? 'connected' : 'disconnected',
  })
})

app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UM Construction</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 3rem; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 600px; }
        h1 { color: #333; margin-bottom: 1rem; font-size: 2.5rem; }
        p { color: #666; margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6; }
        .links { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        a { display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; text-decoration: none; border-radius: 5px; transition: background 0.3s; }
        a:hover { background: #764ba2; }
        .api-link { background: #48bb78; }
        .api-link:hover { background: #38a169; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>UM Construction</h1>
        <p>Professional construction and renovation services. Quality workmanship, reliable service.</p>
        <div class="links">
          <a href="/api/health">API Health</a>
          <a href="/api/services" class="api-link">Services</a>
          <a href="/api/portfolio" class="api-link">Portfolio</a>
        </div>
      </div>
    </body>
    </html>
  `)
})

app.post('/api/admin/login', requireDb, async (req, res) => {
  const { username, password } = req.body || {}
  const hasAdmin = (await AdminUser.countDocuments()) > 0
  if (!hasAdmin) {
    return res.status(400).json({
      success: false,
      message:
        'No admin user found in database. Set ADMIN_USERNAME and ADMIN_PASSWORD in backend/.env and restart once.',
    })
  }
  const result = await loginAdmin({ username, password })
  if (!result.ok) return res.status(result.status).json({ success: false, message: result.message })
  res.json({
    success: true,
    token: result.token,
    username: result.username,
    expiresAt: result.expiresAt,
  })
})

app.post('/api/admin/logout', requireAdmin, async (req, res) => {
  const token = req.headers['x-admin-token'] || ''
  await logoutAdminToken(token)
  res.json({ success: true })
})

app.post('/api/admin/upload-image', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded.' })
  }
  const base = process.env.BACKEND_URL || `http://localhost:${PORT}`
  const imageUrl = `${base}/uploads/${req.file.filename}`
  res.status(201).json({ success: true, imageUrl })
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

app.get('/api/admin/inquiries', requireAdmin, async (req, res) => {
  if (!dbReady()) return res.status(503).json({ success: false, message: 'Database unavailable.' })
  const [
    contacts,
    quotes,
    bookings,
    orders,
    contactCount,
    quoteCount,
    bookingCount,
    orderCount,
    products,
    portfolio,
  ] = await Promise.all([
    ContactInquiry.find().sort({ createdAt: -1 }).limit(50).lean(),
    QuoteRequest.find().sort({ createdAt: -1 }).limit(50).lean(),
    ServiceBooking.find().sort({ createdAt: -1 }).limit(50).lean(),
    Order.find().sort({ createdAt: -1 }).limit(100).lean(),
    ContactInquiry.countDocuments(),
    QuoteRequest.countDocuments(),
    ServiceBooking.countDocuments(),
    Order.countDocuments(),
    Product.find({ active: true })
      .select('productId name note image pricePkr categoryId categoryTitle')
      .lean(),
    PortfolioProject.find({ active: true })
      .select('title location description beforeImage afterImage sortOrder createdAt')
      .sort({ sortOrder: -1, createdAt: -1 })
      .lean(),
  ])

  const categories = products?.length ? groupProductsToCategories(products) : productCategories
  const catalogProductCount = categories.reduce((n, cat) => n + cat.items.length, 0)

  res.json({
    success: true,
    db: dbReady() ? 'connected' : 'disconnected',
    contacts,
    quotes,
    bookings,
    orders,
    catalog: {
      categories,
      totalProductCount: catalogProductCount,
    },
    portfolio: {
      projects: portfolio || [],
      totalProjectCount: portfolio?.length || 0,
    },
    counts: {
      contacts: contactCount,
      quotes: quoteCount,
      bookings: bookingCount,
      orders: orderCount,
    },
  })
})

app.get('/api/portfolio', async (_req, res) => {
  try {
    if (!dbReady()) return res.json({ projects: [] })
    const projects = await PortfolioProject.find({ active: true })
      .select('title location description beforeImage afterImage sortOrder createdAt')
      .sort({ sortOrder: -1, createdAt: -1 })
      .lean()
    res.json({ projects })
  } catch {
    res.json({ projects: [] })
  }
})

app.get('/api/services', async (_req, res) => {
  try {
    if (!dbReady()) return res.json({ categories: [] })
    const categories = await ServiceCategory.find({ active: true })
      .sort({ sortOrder: -1, createdAt: -1 })
      .lean()
    res.json({ categories: categories || [] })
  } catch {
    res.json({ categories: [] })
  }
})

app.get('/api/admin/products', requireAdmin, requireDb, async (_req, res) => {
  const products = await Product.find({}).sort({ updatedAt: -1 }).lean()
  res.json({ success: true, products })
})

app.post('/api/admin/products', requireAdmin, requireDb, async (req, res) => {
  const { productId, name, note, image, pricePkr, categoryId, categoryTitle, active } = req.body || {}
  if (!productId || !name || !categoryId || !categoryTitle) {
    return res.status(400).json({ success: false, message: 'productId, name, categoryId, categoryTitle are required.' })
  }
  const price = Number(pricePkr)
  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ success: false, message: 'pricePkr must be a non-negative number.' })
  }
  try {
    const created = await Product.create({
      productId,
      name,
      note: note || '',
      image: image || '',
      pricePkr: price,
      categoryId,
      categoryTitle,
      active: active !== false,
    })
    res.status(201).json({ success: true, product: created })
  } catch (err) {
    const msg = err?.code === 11000 ? 'productId must be unique.' : 'Could not create product.'
    res.status(400).json({ success: false, message: msg })
  }
})

app.put('/api/admin/products/:id', requireAdmin, requireDb, async (req, res) => {
  const id = req.params.id
  const patch = req.body || {}
  if (patch.pricePkr !== undefined) {
    const price = Number(patch.pricePkr)
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ success: false, message: 'pricePkr must be a non-negative number.' })
    }
    patch.pricePkr = price
  }
  try {
    const updated = await Product.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()
    if (!updated) return res.status(404).json({ success: false, message: 'Not found.' })
    res.json({ success: true, product: updated })
  } catch {
    res.status(400).json({ success: false, message: 'Could not update product.' })
  }
})

app.delete('/api/admin/products/:id', requireAdmin, requireDb, async (req, res) => {
  const id = req.params.id
  const deleted = await Product.findByIdAndDelete(id).lean()
  if (!deleted) return res.status(404).json({ success: false, message: 'Not found.' })
  res.json({ success: true })
})

app.get('/api/admin/portfolio', requireAdmin, requireDb, async (_req, res) => {
  const projects = await PortfolioProject.find({}).sort({ updatedAt: -1 }).lean()
  res.json({ success: true, projects })
})

app.post('/api/admin/portfolio', requireAdmin, requireDb, async (req, res) => {
  const { title, location, description, beforeImage, afterImage, sortOrder, active } = req.body || {}
  if (!title || !beforeImage || !afterImage) {
    return res.status(400).json({ success: false, message: 'title, beforeImage, afterImage are required.' })
  }
  const created = await PortfolioProject.create({
    title,
    location: location || '',
    description: description || '',
    beforeImage,
    afterImage,
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    active: active !== false,
  })
  res.status(201).json({ success: true, project: created })
})

app.put('/api/admin/portfolio/:id', requireAdmin, requireDb, async (req, res) => {
  const id = req.params.id
  const patch = req.body || {}
  if (patch.sortOrder !== undefined) {
    patch.sortOrder = Number.isFinite(Number(patch.sortOrder)) ? Number(patch.sortOrder) : 0
  }
  const updated = await PortfolioProject.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()
  if (!updated) return res.status(404).json({ success: false, message: 'Not found.' })
  res.json({ success: true, project: updated })
})

app.delete('/api/admin/portfolio/:id', requireAdmin, requireDb, async (req, res) => {
  const id = req.params.id
  const deleted = await PortfolioProject.findByIdAndDelete(id).lean()
  if (!deleted) return res.status(404).json({ success: false, message: 'Not found.' })
  res.json({ success: true })
})

app.get('/api/admin/services', requireAdmin, requireDb, async (_req, res) => {
  const categories = await ServiceCategory.find({}).sort({ updatedAt: -1 }).lean()
  res.json({ success: true, categories })
})

app.post('/api/admin/services', requireAdmin, requireDb, async (req, res) => {
  const { id, title, summary, image, items, sortOrder, active } = req.body || {}
  if (!id || !title || !summary || !image) {
    return res
      .status(400)
      .json({ success: false, message: 'id, title, summary, and image are required.' })
  }
  const safeItems = Array.isArray(items)
    ? items
        .map((item) => ({
          name: String(item?.name || '').trim(),
          description: String(item?.description || '').trim(),
        }))
        .filter((item) => item.name && item.description)
    : []
  try {
    const created = await ServiceCategory.create({
      id,
      title,
      summary,
      image,
      items: safeItems,
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
      active: active !== false,
    })
    res.status(201).json({ success: true, category: created })
  } catch (err) {
    const msg = err?.code === 11000 ? 'id must be unique.' : 'Could not create service category.'
    res.status(400).json({ success: false, message: msg })
  }
})

app.put('/api/admin/services/:id', requireAdmin, requireDb, async (req, res) => {
  const id = req.params.id
  const patch = req.body || {}
  if (patch.sortOrder !== undefined) {
    patch.sortOrder = Number.isFinite(Number(patch.sortOrder)) ? Number(patch.sortOrder) : 0
  }
  if (patch.items !== undefined) {
    patch.items = Array.isArray(patch.items)
      ? patch.items
          .map((item) => ({
            name: String(item?.name || '').trim(),
            description: String(item?.description || '').trim(),
          }))
          .filter((item) => item.name && item.description)
      : []
  }
  try {
    const updated = await ServiceCategory.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()
    if (!updated) return res.status(404).json({ success: false, message: 'Not found.' })
    res.json({ success: true, category: updated })
  } catch {
    res.status(400).json({ success: false, message: 'Could not update service category.' })
  }
})

app.delete('/api/admin/services/:id', requireAdmin, requireDb, async (req, res) => {
  const id = req.params.id
  const deleted = await ServiceCategory.findByIdAndDelete(id).lean()
  if (!deleted) return res.status(404).json({ success: false, message: 'Not found.' })
  res.json({ success: true })
})

registerStoreRoutes(app, { requireDb, writeLimiter })

const start = async () => {
  const uri = process.env.MONGODB_URI
  if (uri) {
    try {
      await mongoose.connect(uri)
      await bootstrapAdminFromEnv()
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
