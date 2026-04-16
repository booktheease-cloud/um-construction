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

export async function loginAdmin({ username, password }) {
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
