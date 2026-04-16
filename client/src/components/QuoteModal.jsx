import { useState } from 'react'
import { useQuote } from '../context/QuoteContext'
import { SERVICE_OPTIONS, SITE } from '../siteConfig'
import { submitQuote } from '../api'

export default function QuoteModal() {
  const { quoteOpen, closeQuote } = useQuote()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: SERVICE_OPTIONS[0],
    problemDescription: '',
    location: '',
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  if (!quoteOpen) return null

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Sending…' })
    try {
      await submitQuote(form)
      setStatus({ type: 'success', message: 'Thanks — we will contact you shortly.' })
      setForm({
        name: '',
        phone: '',
        service: SERVICE_OPTIONS[0],
        problemDescription: '',
        location: '',
      })
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please call or WhatsApp us.'
      setStatus({ type: 'error', message: msg })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 bg-brand-navy/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lift border border-slate-100 overflow-hidden animate-fade-up">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 id="quote-title" className="text-lg font-semibold text-brand-navy">
              Get a free quote
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Tell us what you need — {SITE.company} serves {SITE.city}.
            </p>
          </div>
          <button
            type="button"
            onClick={closeQuote}
            className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-800 transition"
            aria-label="Close quote form"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Name (optional)</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange outline-none"
                autoComplete="name"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Phone *</span>
              <input
                name="phone"
                required
                value={form.phone}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange outline-none"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Service *</span>
            <select
              name="service"
              required
              value={form.service}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange outline-none"
            >
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Problem / scope *</span>
            <textarea
              name="problemDescription"
              required
              rows={3}
              value={form.problemDescription}
              onChange={onChange}
              placeholder="Example: Roof seepage after rain, bathroom damp wall, new wiring for AC…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange outline-none resize-y min-h-[88px]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Location / area *</span>
            <input
              name="location"
              required
              value={form.location}
              onChange={onChange}
              placeholder="Area in Karachi (e.g. DHA, Gulistan-e-Jauhar)"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange outline-none"
            />
          </label>
          {status.message && (
            <p
              className={`text-sm rounded-xl px-3 py-2 ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800'
                  : status.type === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-slate-100 text-slate-700'
              }`}
            >
              {status.message}
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-1">
            <button
              type="button"
              onClick={closeQuote}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-brand-orange hover:bg-orange-600 disabled:opacity-60 shadow-md"
            >
              {status.type === 'loading' ? 'Sending…' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
