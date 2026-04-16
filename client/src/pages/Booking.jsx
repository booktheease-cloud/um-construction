import { useState } from 'react'
import { SERVICE_OPTIONS, SITE } from '../siteConfig'
import { submitBooking } from '../api'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Booking() {
  usePageTitle('Book a visit')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: SERVICE_OPTIONS[0],
    preferredDate: '',
    preferredTime: '',
    address: '',
    notes: '',
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Saving…' })
    try {
      await submitBooking(form)
      setStatus({
        type: 'success',
        message:
          'Booking request saved. Our team will confirm time by phone or WhatsApp shortly.',
      })
      setForm({
        name: '',
        phone: '',
        service: SERVICE_OPTIONS[0],
        preferredDate: '',
        preferredTime: '',
        address: '',
        notes: '',
      })
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not save booking. Please contact us directly.'
      setStatus({ type: 'error', message: msg })
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <p className="text-brand-amber text-sm font-semibold uppercase tracking-wide">Booking</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Schedule a site visit</h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Pick a preferred date for inspection or work start. For emergencies, please call or
            WhatsApp {SITE.company} directly.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl bg-white border border-slate-100 p-6 sm:p-8 shadow-card space-y-4"
        >
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Full name *</span>
            <input
              name="name"
              required
              value={form.name}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Phone *</span>
            <input
              name="phone"
              required
              value={form.phone}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 outline-none"
              inputMode="tel"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Service *</span>
            <select
              name="service"
              required
              value={form.service}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-orange/40 outline-none"
            >
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium text-slate-800">Preferred date *</span>
              <input
                name="preferredDate"
                type="date"
                required
                value={form.preferredDate}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-800">Preferred time</span>
              <input
                name="preferredTime"
                value={form.preferredTime}
                onChange={onChange}
                placeholder="e.g. 11:00 AM"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 outline-none"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Site address / area</span>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Notes</span>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 outline-none resize-y"
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
          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full rounded-xl bg-brand-orange text-white py-3 text-sm font-bold hover:bg-orange-600 disabled:opacity-60"
          >
            {status.type === 'loading' ? 'Submitting…' : 'Request booking'}
          </button>
        </form>
      </div>
    </div>
  )
}
