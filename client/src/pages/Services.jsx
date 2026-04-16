import { serviceCategories } from '../data/serviceDetails'
import { useQuote } from '../context/QuoteContext'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Services() {
  usePageTitle('Services')
  const { openQuote } = useQuote()

  return (
    <div className="bg-slate-50">
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          <p className="text-brand-amber text-sm font-semibold uppercase tracking-wide">
            Services
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold max-w-3xl">
            Detailed solutions for construction and home maintenance
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Each category below includes common scopes we deliver in Karachi — with clear
            workmanship standards and material options.
          </p>
          <button
            type="button"
            onClick={openQuote}
            className="mt-8 rounded-xl bg-brand-orange px-6 py-3 font-semibold hover:bg-orange-600 transition"
          >
            Request service / quote
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 space-y-16">
        {serviceCategories.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            className="scroll-mt-24 rounded-3xl bg-white border border-slate-100 shadow-card overflow-hidden"
          >
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative min-h-[240px] lg:min-h-full">
                <img
                  src={cat.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent lg:bg-gradient-to-r" />
                <div className="relative p-8 lg:p-10 flex flex-col justify-end h-full min-h-[240px]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{cat.title}</h2>
                  <p className="text-slate-200 mt-2 text-sm sm:text-base max-w-md">{cat.summary}</p>
                </div>
              </div>
              <div className="p-8 lg:p-10 space-y-6">
                {cat.items.map((item) => (
                  <div key={item.name} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                    <h3 className="text-lg font-semibold text-brand-navy">{item.name}</h3>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed">{item.description}</p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={openQuote}
                  className="w-full sm:w-auto rounded-xl bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-sky transition"
                >
                  Get quote — {cat.title}
                </button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
