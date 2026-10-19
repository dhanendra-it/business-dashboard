import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

export default function Delta({ cur, prev, invert = false, points = false }) {
  let text
  let dir

  if (points) {
    const diff = cur - prev
    dir = Math.sign(Math.round(diff * 10))
    text = `${Math.abs(diff).toFixed(1)} pts`
  } else if (!prev) {
    dir = cur ? 1 : 0
    text = cur ? 'new' : '0%'
  } else {
    const change = ((cur - prev) / prev) * 100
    dir = Math.sign(Math.round(change * 10))
    text = `${Math.abs(change).toFixed(1)}%`
  }

  const good = dir === 0 ? null : dir > 0 !== invert
  const tone = good === null ? 'text-muted' : good ? 'text-emerald-600' : 'text-rose-600'
  const Icon = dir > 0 ? TrendingUp : dir < 0 ? TrendingDown : Minus

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${tone}`}>
      <Icon size={14} />
      {text}
    </span>
  )
}
