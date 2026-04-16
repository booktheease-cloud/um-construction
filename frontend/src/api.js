import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

export async function submitContact(payload) {
  const { data } = await api.post('/api/contact', payload)
  return data
}

export async function submitQuote(payload) {
  const { data } = await api.post('/api/quotes', payload)
  return data
}

export async function submitBooking(payload) {
  const { data } = await api.post('/api/bookings', payload)
  return data
}

export async function adminLogin(username, password) {
  const { data } = await api.post('/api/admin/login', { username, password })
  return data
}

export async function fetchAdminInquiries(token) {
  const { data } = await api.get('/api/admin/inquiries', {
    headers: { 'x-admin-token': token },
  })
  return data
}

export async function fetchCatalog() {
  const { data } = await api.get('/api/products')
  return data
}

export async function fetchPortfolio() {
  const { data } = await api.get('/api/portfolio')
  return data
}

export async function fetchServices() {
  const { data } = await api.get('/api/services')
  return data
}

function adminHeaders(token) {
  return { 'x-admin-token': token }
}

export async function adminListProducts(token) {
  const { data } = await api.get('/api/admin/products', { headers: adminHeaders(token) })
  return data
}

export async function adminCreateProduct(token, payload) {
  const { data } = await api.post('/api/admin/products', payload, { headers: adminHeaders(token) })
  return data
}

export async function adminUpdateProduct(token, id, patch) {
  const { data } = await api.put(`/api/admin/products/${id}`, patch, { headers: adminHeaders(token) })
  return data
}

export async function adminDeleteProduct(token, id) {
  const { data } = await api.delete(`/api/admin/products/${id}`, { headers: adminHeaders(token) })
  return data
}

export async function adminListPortfolioProjects(token) {
  const { data } = await api.get('/api/admin/portfolio', { headers: adminHeaders(token) })
  return data
}

export async function adminCreatePortfolioProject(token, payload) {
  const { data } = await api.post('/api/admin/portfolio', payload, { headers: adminHeaders(token) })
  return data
}

export async function adminUpdatePortfolioProject(token, id, patch) {
  const { data } = await api.put(`/api/admin/portfolio/${id}`, patch, { headers: adminHeaders(token) })
  return data
}

export async function adminDeletePortfolioProject(token, id) {
  const { data } = await api.delete(`/api/admin/portfolio/${id}`, { headers: adminHeaders(token) })
  return data
}

export async function adminListServices(token) {
  const { data } = await api.get('/api/admin/services', { headers: adminHeaders(token) })
  return data
}

export async function adminCreateService(token, payload) {
  const { data } = await api.post('/api/admin/services', payload, { headers: adminHeaders(token) })
  return data
}

export async function adminUpdateService(token, id, patch) {
  const { data } = await api.put(`/api/admin/services/${id}`, patch, { headers: adminHeaders(token) })
  return data
}

export async function adminDeleteService(token, id) {
  const { data } = await api.delete(`/api/admin/services/${id}`, { headers: adminHeaders(token) })
  return data
}

export async function adminUploadImage(token, file) {
  const form = new FormData()
  form.append('image', file)
  const { data } = await api.post('/api/admin/upload-image', form, {
    headers: { ...adminHeaders(token), 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function submitOrder(payload) {
  const { data } = await api.post('/api/orders', payload)
  return data
}

export async function verifyCheckoutSession(sessionId) {
  const { data } = await api.get('/api/orders/session', {
    params: { session_id: sessionId },
  })
  return data
}
