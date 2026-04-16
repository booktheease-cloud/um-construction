/**
 * Built-in password for the Staff admin dashboard (`GET /api/admin/inquiries`).
 * Override for production: set `ADMIN_PASSWORD` in `server/.env`.
 */
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'umadmin2026'
}

export function isAuthorizedAdmin(req) {
  const sent = req.headers['x-admin-password']
  return typeof sent === 'string' && sent === getAdminPassword()
}
