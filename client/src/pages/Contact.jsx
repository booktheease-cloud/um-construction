import { useState } from 'react'
import { SITE, whatsappLink, SERVICE_OPTIONS } from '../siteConfig'
import { submitContact } from '../api'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Contact() {
  usePageTitle('Contact')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: '',
    message: '',
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Sending…' })
    try {
      await submitContact(form)
      setStatus({ type: 'success', message: 'Message received — we will get back to you soon.' })
      setForm({ name: '', phone: '', service: '', message: '' })
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not send. Please call or WhatsApp us.'
      setStatus({ type: 'error', message: msg })
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <h1 className="text-3xl sm:text-4xl font-bold">Contact us</h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Visit our shop, call for urgent help, or send a message — whichever is fastest for you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-brand-navy">Business details</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <span className="font-medium text-slate-800">Phone: </span>
                <a className="text-brand-orange hover:underline" href={`tel:${SITE.phoneE164}`}>
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="font-medium text-slate-800">WhatsApp: </span>
                <a
                  className="text-brand-orange hover:underline"
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open chat
                </a>
              </li>
              <li>
                <span className="font-medium text-slate-800">Email: </span>
                {SITE.email}
              </li>
              <li>
                <span className="font-medium text-slate-800">Address: </span>
                {SITE.addressLine}, {SITE.addressCity}
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${SITE.phoneE164}`}
                className="rounded-xl bg-brand-orange text-white px-5 py-2.5 text-sm font-semibold hover:bg-orange-600"
              >
                Call now
              </a>
              <a
                href={whatsappLink(`Hello ${SITE.company}, I have a question.`)}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-slate-50"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-white min-h-[280px]">
            <iframe
              title="Map — UM Construction Karachi"
              src={SITE.mapEmbedSrc}
              className="w-full h-[320px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-6 sm:p-8 shadow-card h-fit">
          <h2 className="text-lg font-semibold text-brand-navy">Send a message</h2>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Name *</span>
              <input
                name="name"
                required
                value={form.name}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange outline-none"
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
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Service required</span>
              <select
                name="service"
                value={form.service}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-orange/40 outline-none"
              >
                <option value="">Select…</option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Message</span>
              <textarea
                name="message"
                rows={4}
                value={form.message}
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
              className="w-full rounded-xl bg-brand-blue text-white py-3 text-sm font-semibold hover:bg-brand-sky disabled:opacity-60"
            >
              {status.type === 'loading' ? 'Sending…' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
