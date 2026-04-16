import { SITE, whatsappLink } from '../siteConfig'

export default function FloatingActions() {
  const msg = `Hi ${SITE.company}, I need help with a home/construction service in ${SITE.city}.`
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
      <a
        href={whatsappLink(msg)}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-4 pr-5 py-3 shadow-lift font-semibold text-sm hover:brightness-110 transition animate-float"
        aria-label="Chat on WhatsApp"
      >
        <span className="text-lg" aria-hidden>
          💬
        </span>
        WhatsApp
      </a>
      <a
        href={`tel:${SITE.phoneE164.replace(/\s/g, '')}`}
        className="sm:hidden flex items-center gap-2 rounded-full bg-brand-blue text-white pl-4 pr-5 py-3 shadow-lift font-semibold text-sm hover:bg-brand-sky transition"
        aria-label="Call now"
      >
        <span aria-hidden>📞</span>
        Call
      </a>
    </div>
  )
}
