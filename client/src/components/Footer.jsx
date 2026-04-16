import { Link } from 'react-router-dom'
import { SITE, whatsappLink } from '../siteConfig'
import { useQuote } from '../context/QuoteContext'

export default function Footer() {
  const { openQuote } = useQuote()
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-white font-semibold text-lg">{SITE.company}</p>
          <p className="mt-2 text-sm leading-relaxed">
            Construction, waterproofing, MEP trades, woodwork, and trusted materials — serving
            homes and businesses across {SITE.city}.
          </p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Quick links</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" to="/services">
                Services
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/products">
                Products
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/portfolio">
                Portfolio
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/booking">
                Book a visit
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="hover:text-white" href={`tel:${SITE.phoneE164}`}>
                {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={whatsappLink()}>
                WhatsApp
              </a>
            </li>
            <li>{SITE.email}</li>
            <li>
              {SITE.addressLine}
              <br />
              {SITE.addressCity}
            </li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Get started</p>
          <p className="text-sm mb-4">
            Need a fast estimate? Send details online — we usually respond the same day.
          </p>
          <button
            type="button"
            onClick={openQuote}
            className="w-full sm:w-auto rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            Get free quote
          </button>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 px-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center text-[11px] sm:text-xs text-slate-600">
        <span className="text-slate-500">
          © {new Date().getFullYear()} {SITE.company}. All rights reserved.
        </span>
        <span className="hidden sm:inline text-slate-600" aria-hidden>
          ·
        </span>
        <Link
          to="/admin"
          className="text-slate-600 hover:text-slate-400 transition underline-offset-2 hover:underline"
        >
          Staff
        </Link>
      </div>
    </footer>
  )
}
