import { fmtShort } from './format'

export const DAY = 86400000
const HOUR = 3600000

export const startOfDay = ts => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const endOfDay = ts => {
  const d = new Date(ts)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export const addDays = (ts, n) => {
  const d = new Date(ts)
  d.setDate(d.getDate() + n)
  return d.getTime()
}

export const daysBetween = (start, end) =>
  Math.round((startOfDay(end) - startOfDay(start)) / DAY) + 1

export const toInputValue = ts => {
  const d = new Date(ts)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export const fromInputValue = value => {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function getRange(preset, custom, now) {
  const today = startOfDay(now)
  if (preset === 'today') return { start: today, end: endOfDay(now) }
  if (preset === '7d') return { start: addDays(today, -6), end: endOfDay(now) }
  if (preset === '30d') return { start: addDays(today, -29), end: endOfDay(now) }
  let start = fromInputValue(custom.from)
  let end = fromInputValue(custom.to)
  if (start > end) [start, end] = [end, start]
  return { start: startOfDay(start), end: endOfDay(end) }
}

export function previousRange(range) {
  const days = daysBetween(range.start, range.end)
  return {
    start: addDays(range.start, -days),
    end: endOfDay(addDays(range.start, -1))
  }
}

export function buildBuckets(range, now) {
  const days = daysBetween(range.start, range.end)
  const out = []

  if (days === 1) {
    const includesNow = range.start <= now && range.end >= now
    const lastHour = includesNow ? new Date(now).getHours() : 23
    for (let h = 0; h <= lastHour; h++) {
      const start = range.start + h * HOUR
      out.push({ start, end: start + HOUR - 1, label: `${String(h).padStart(2, '0')}:00` })
    }
    return out
  }

  const step = days <= 31 ? 1 : days <= 120 ? 7 : 30
  let start = range.start
  while (start <= range.end) {
    const end = Math.min(endOfDay(addDays(start, step - 1)), range.end)
    out.push({ start, end, label: fmtShort(start) })
    start = startOfDay(addDays(start, step))
  }
  return out
}

export function groupIntoBuckets(buckets, items, getTs) {
  const groups = buckets.map(() => [])
  items.forEach(item => {
    const ts = getTs(item)
    const i = buckets.findIndex(b => ts >= b.start && ts <= b.end)
    if (i >= 0) groups[i].push(item)
  })
  return groups
}
