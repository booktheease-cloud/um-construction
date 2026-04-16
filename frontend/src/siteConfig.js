/** Update these with your real business details. */
export const SITE = {
  company: 'UM Construction & Home Services',
  tagline: 'Complete Construction & Home Maintenance Services Under One Roof',
  city: 'Pakistan',
  country: 'Pakistan',
  phoneDisplay: '+92 301 4223889',
  /** E.164 without spaces for tel: / wa.me */
  phoneE164: '+923014223889',
  whatsappDigits: '923014223889',
  email: 'info@umconstruction.pk',
  addressLine: 'Shop & Office, Block 5 Clifton',
  addressCity: 'Pakistan',
  /** Google Maps embed (replace with your exact location). */
  mapEmbedSrc:
    'https://www.google.com/maps?q=Pakistan&output=embed',
}

export const WHATSAPP_BASE = `https://wa.me/${SITE.whatsappDigits}`

export function whatsappLink(text = '') {
  const q = text ? `?text=${encodeURIComponent(text)}` : ''
  return `${WHATSAPP_BASE}${q}`
}

export const SERVICE_OPTIONS = [
  'Construction / Grey structure',
  'Renovation & tile work',
  'Waterproofing',
  'Plumbing',
  'Electrical',
  'Woodwork',
  'Shop — chemicals & materials',
  'Other / not sure',
]
