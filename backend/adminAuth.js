import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import AdminUser from './models/AdminUser.js'
import AdminSession from './models/AdminSession.js'

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function normalizeUsername(username) {
  return String(username || '')
    .trim()
    .toLowerCase()
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function readAdminToken(req) {
  const headerToken = req.headers['x-admin-token']
  if (typeof headerToken === 'string' && headerToken.trim()) return headerToken.trim()
  const auth = req.headers.authorization
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim()
  }
  return ''
}

export async function bootstrapAdminFromEnv() {
  const username = normalizeUsername(process.env.ADMIN_USERNAME || 'admin')
  const password = String(process.env.ADMIN_PASSWORD || '')
  if (!username || !password) return

  const existingCount = await AdminUser.countDocuments()
  if (existingCount > 0) return

  const passwordHash = await bcrypt.hash(password, 12)
  await AdminUser.create({ username, passwordHash, active: true })
}

export async function loginAdmin({ username, password }) {
  const normalized = normalizeUsername(username)
  if (!normalized || !password) {
    return { ok: false, status: 400, message: 'Username and password are required.' }
  }

  const user = await AdminUser.findOne({ username: normalized, active: true })
  if (!user) return { ok: false, status: 401, message: 'Invalid username or password.' }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { ok: false, status: 401, message: 'Invalid username or password.' }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await AdminSession.create({
    tokenHash: tokenHash(token),
    adminUserId: user._id,
    expiresAt,
  })

  return { ok: true, token, username: user.username, expiresAt }
}

export async function logoutAdminToken(rawToken) {
  const token = String(rawToken || '').trim()
  if (!token) return
  await AdminSession.deleteOne({ tokenHash: tokenHash(token) })
}

export async function isAuthorizedAdmin(req) {
  const token = readAdminToken(req)
  if (!token) return false

  await AdminSession.deleteMany({ expiresAt: { $lte: new Date() } })
  const session = await AdminSession.findOne({ tokenHash: tokenHash(token) }).lean()
  if (!session) return false
  return session.expiresAt > new Date()
}
