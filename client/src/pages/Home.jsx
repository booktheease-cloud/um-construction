import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuote } from '../context/QuoteContext'
import { SITE, whatsappLink } from '../siteConfig'
import { testimonials } from '../data/testimonials'
import { portfolioProjects } from '../data/portfolio'
import { fetchCatalog } from '../api'
import { formatPkr } from '../utils/money'
import { usePageTitle } from '../hooks/usePageTitle'

const services = [
  {
    title: 'Construction',
    desc: 'Grey structure, renovation, and precision tile work.',
    icon: '🏗️',
  },
  {
    title: 'Waterproofing',
    desc: 'Roofs, bathrooms, tanks — stop seepage for good.',
    icon: '💧',
  },
  {
    title: 'Plumbing',
    desc: 'Installations, upgrades, and leak repairs.',
    icon: '🔧',
  },
  {
    title: 'Electrical',
    desc: 'Safe wiring, faults, and modern switchboards.',
    icon: '⚡',
  },
  {
    title: 'Woodwork',
    desc: 'Cabinets, doors, and custom furniture.',
    icon: '🪵',
  },
]

const why = [
  { title: 'Experienced team', text: 'Supervised crews for civil and finishing trades.' },
  { title: 'Quality materials', text: 'We use products we trust — many available at our shop.' },
  { title: 'Fast service', text: 'Clear timelines and responsive coordination.' },
  { title: 'Affordable pricing', text: 'Itemized quotes so you know where money goes.' },
]

export default function Home() {
  usePageTitle('Home')
  const { openQuote } = useQuote()
  const wa = whatsappLink(
    `Hello ${SITE.company}, I would like a quote for work in ${SITE.city}.`
  )

  const [catalog, setCatalog] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetchCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data)
      })
      .catch(() => {
        if (!cancelled) setCatalog(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const featured = catalog?.categories?.length
    ? catalog.categories.flatMap((c) => c.items.slice(0, 1))
    : []

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/95 to-brand-navy/80" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-brand-amber text-sm font-semibold tracking-wide uppercase mb-3">
              Karachi · Trusted trades under one roof
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance leading-tight">
              {SITE.tagline}
            </h1>
            <p className="mt-5 text-slate-300 text-lg leading-relaxed">
              Reliable workmanship, honest guidance, and materials backed by our physical shop —
              ideal for homeowners, landlords, and small commercial spaces.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={openQuote}
                className="inline-flex justify-center items-center rounded-xl bg-brand-orange px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-orange-600 transition"
              >
                Get free quote
              </button>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center items-center rounded-xl border border-white/25 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition"
              >
                Chat on WhatsApp
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
              <div>
                <p className="text-white font-semibold text-2xl">10+</p>
                <p>Years combined field experience</p>
              </div>
              <div>
                <p className="text-white font-semibold text-2xl">24/7</p>
                <p>Emergency plumbing & electrical</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">What we do</h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              One coordinated team for civil, wet trades, power, and carpentry — fewer
              handoffs, faster completion.
            </p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-brand-orange hover:text-orange-700"
          >
            View all services →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl bg-white p-6 shadow-card border border-slate-100 hover:shadow-lift transition duration-300"
            >
              <div className="text-3xl mb-3" aria-hidden>
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-brand-navy">{s.title}</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy text-center mb-10">
            Why customers choose us
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {why.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center"
              >
                <h3 className="font-semibold text-brand-navy">{w.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-brand-orange to-amber-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-white text-lg sm:text-xl font-semibold">
            24/7 emergency plumbing & electrical services available
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${SITE.phoneE164}`}
              className="rounded-xl bg-white text-brand-navy px-5 py-2.5 text-sm font-bold shadow-md hover:bg-slate-50"
            >
              Call now
            </a>
            <a
              href={whatsappLink('Emergency — need plumber/electrician in Karachi.')}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-brand-navy text-white px-5 py-2.5 text-sm font-bold border border-white/20 hover:bg-brand-blue"
            >
              WhatsApp emergency
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Featured products</h2>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Construction chemicals and materials we supply — buy online with delivery options at
              checkout.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-brand-orange hover:text-orange-700"
          >
            All products →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full">
              Loading highlights… connect the API server to see live catalogue and prices.
            </p>
          ) : null}
          {featured.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-card"
            >
              <Link to={`/products/${p.id}`} className="aspect-[4/3] overflow-hidden block">
                <img
                  src={p.image}
                  alt=""
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </Link>
              <div className="p-5">
                <h3 className="font-semibold text-brand-navy">
                  <Link to={`/products/${p.id}`} className="hover:text-brand-orange transition">
                    {p.name}
                  </Link>
                </h3>
                <p className="text-sm text-slate-600 mt-1">{p.note}</p>
                {p.pricePkr != null ? (
                  <p className="text-sm font-bold text-brand-navy mt-2">{formatPkr(p.pricePkr)}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/products/${p.id}`}
                    className="text-sm font-semibold text-brand-orange hover:text-orange-700"
                  >
                    View & buy →
                  </Link>
                  <a
                    href={whatsappLink(`I want to inquire about: ${p.name}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-slate-500 hover:text-brand-navy"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Recent transformations</h2>
              <p className="text-slate-600 mt-2">Before / after highlights from real Karachi sites.</p>
            </div>
            <Link
              to="/portfolio"
              className="text-sm font-semibold text-brand-orange hover:text-orange-700"
            >
              Full portfolio →
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {portfolioProjects.slice(0, 2).map((proj) => (
              <div
                key={proj.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-card"
              >
                <div className="grid grid-cols-2 gap-px bg-slate-200">
                  <figure>
                    <img src={proj.before} alt={`${proj.title} before`} className="h-48 w-full object-cover" loading="lazy" />
                    <figcaption className="text-xs text-center py-2 text-slate-500">Before</figcaption>
                  </figure>
                  <figure>
                    <img src={proj.after} alt={`${proj.title} after`} className="h-48 w-full object-cover" loading="lazy" />
                    <figcaption className="text-xs text-center py-2 text-slate-500">After</figcaption>
                  </figure>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-brand-navy">{proj.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{proj.location}</p>
                  <p className="text-sm text-slate-600 mt-2">{proj.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy text-center mb-10">
          What clients say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl bg-white border border-slate-100 p-6 shadow-card"
            >
              <p className="text-slate-700 text-sm leading-relaxed">“{t.text}”</p>
              <footer className="mt-4 text-sm">
                <p className="font-semibold text-brand-navy">{t.name}</p>
                <p className="text-slate-500">{t.area}</p>
                <p className="text-brand-orange text-xs font-medium mt-1">{t.service}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-brand-navy">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to start your project?</h2>
            <p className="text-slate-300 mt-3 max-w-xl">
              Call, WhatsApp, or send your details — we will suggest the right visit time and
              estimate path.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={`tel:${SITE.phoneE164}`}
              className="inline-flex justify-center rounded-xl bg-white text-brand-navy px-6 py-3 font-bold hover:bg-slate-100"
            >
              Call now
            </a>
            <button
              type="button"
              onClick={openQuote}
              className="inline-flex justify-center rounded-xl bg-brand-orange text-white px-6 py-3 font-bold hover:bg-orange-600"
            >
              Get a quote
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
