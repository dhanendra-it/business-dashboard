export const inr = n => '₹' + Math.round(n).toLocaleString('en-IN')

export function inrShort(n) {
  const a = Math.abs(n)
  if (a >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (a >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  if (a >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`
  return `₹${Math.round(n)}`
}

export const pct = (n, digits = 1) => `${n.toFixed(digits)}%`

export const fmtShort = ts =>
  new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export const fmtDate = ts =>
  new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const fmtDateTime = ts =>
  new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

export function describeRange(range) {
  const same = new Date(range.start).toDateString() === new Date(range.end).toDateString()
  return same ? fmtDate(range.start) : `${fmtDate(range.start)} to ${fmtDate(range.end)}`
}
