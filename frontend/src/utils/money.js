export function formatPkr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  try {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(Number(amount))
  } catch {
    return `PKR ${Math.round(Number(amount)).toLocaleString('en-PK')}`
  }
}
