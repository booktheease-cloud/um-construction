import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { SITE } from '../siteConfig'
import { useQuote } from '../context/QuoteContext'
import { useCart } from '../context/CartContext'
import umLogo from '../assets/um-logo.png'

const linkClass = ({ isActive }) =>
  `text-sm font-medium px-3 py-2 rounded-lg transition ${
    isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:text-white hover:bg-white/5'
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { openQuote } = useQuote()
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <img
            src={umLogo}
            alt="UM Construction logo"
            className="h-9 w-9 object-contain"
            draggable={false}
          />
          <div className="leading-tight">
            <p className="text-white font-semibold text-sm sm:text-base tracking-tight">
              UM Construction
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400">& Home Services · {SITE.city}</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/services" className={linkClass}>
            Services
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          <Link
            to="/cart"
            className="text-sm font-medium px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/5 relative"
          >
            Cart
            {itemCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] rounded-full bg-brand-orange text-[10px] font-bold text-white grid place-items-center px-1">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            ) : null}
          </Link>
          <NavLink to="/portfolio" className={linkClass}>
            Portfolio
          </NavLink>
          <NavLink to="/booking" className={linkClass}>
            Booking
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
          <button
            type="button"
            onClick={openQuote}
            className="ml-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-md"
          >
            Free quote
          </button>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={openQuote}
            className="rounded-lg bg-brand-orange px-3 py-2 text-xs font-semibold text-white"
          >
            Quote
          </button>
          <button
            type="button"
            className="p-2 rounded-lg text-white border border-white/15"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-brand-navy px-4 pb-4 space-y-1">
          <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/services" className={linkClass} onClick={() => setOpen(false)}>
            Services
          </NavLink>
          <NavLink to="/products" className={linkClass} onClick={() => setOpen(false)}>
            Products
          </NavLink>
          <Link
            to="/cart"
            className="text-sm font-medium px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/5 flex items-center justify-between"
            onClick={() => setOpen(false)}
          >
            <span>Cart</span>
            {itemCount > 0 ? (
              <span className="rounded-full bg-brand-orange text-white text-xs font-bold px-2 py-0.5">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <NavLink to="/portfolio" className={linkClass} onClick={() => setOpen(false)}>
            Portfolio
          </NavLink>
          <NavLink to="/booking" className={linkClass} onClick={() => setOpen(false)}>
            Booking
          </NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setOpen(false)}>
            Contact
          </NavLink>
        </div>
      )}
    </header>
  )
}
