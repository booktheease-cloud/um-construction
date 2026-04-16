import { useEffect, useState } from 'react'
import { fetchPortfolio } from '../api'
import { useQuote } from '../context/QuoteContext'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Portfolio() {
  usePageTitle('Portfolio')
  const { openQuote } = useQuote()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchPortfolio()
      .then((data) => {
        if (cancelled) return
        setProjects(Array.isArray(data?.projects) ? data.projects : [])
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load portfolio. Is the server running?')
        setProjects([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-slate-50">
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <p className="text-brand-amber text-sm font-semibold uppercase tracking-wide">
            Portfolio
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Real projects across Pakistan</h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Before / after comparisons from waterproofing, bathrooms, and structural scopes. Images
            are representative of our workmanship standards.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 space-y-12">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {loading && !error ? (
          <p className="text-slate-600 text-center py-10">Loading portfolio…</p>
        ) : null}
        {!loading && !error && projects.length === 0 ? (
          <p className="text-slate-600 text-center py-10">No portfolio projects yet.</p>
        ) : null}
        {projects.map((proj) => (
          <article
            key={proj._id || proj.title}
            className="rounded-3xl bg-white border border-slate-100 shadow-card overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <figure className="relative">
                <img
                  src={proj.beforeImage}
                  alt={`${proj.title} — before`}
                  className="h-64 md:h-full w-full object-cover min-h-[16rem]"
                  loading="lazy"
                />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/60 text-white text-xs px-3 py-1">
                  Before
                </figcaption>
              </figure>
              <figure className="relative border-t md:border-t-0 md:border-l border-slate-100">
                <img
                  src={proj.afterImage}
                  alt={`${proj.title} — after`}
                  className="h-64 md:h-full w-full object-cover min-h-[16rem]"
                  loading="lazy"
                />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-brand-orange text-white text-xs px-3 py-1 font-semibold">
                  After
                </figcaption>
              </figure>
            </div>
            <div className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-brand-navy">{proj.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{proj.location}</p>
                <p className="text-slate-600 mt-3 text-sm leading-relaxed max-w-2xl">
                  {proj.description}
                </p>
              </div>
              <button
                type="button"
                onClick={openQuote}
                className="shrink-0 rounded-xl bg-brand-orange text-white px-5 py-2.5 text-sm font-semibold hover:bg-orange-600"
              >
                Request similar work
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
