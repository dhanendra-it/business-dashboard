import Delta from './Delta'
import Sparkline from './Sparkline'

export default function KpiCard({
  label,
  value,
  note,
  icon: Icon,
  tone = '#14766a',
  cur,
  prev,
  invert,
  points,
  spark
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</span>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{ background: `${tone}1a`, color: tone }}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-2xl font-extrabold tabular-nums">{value}</div>
          {note && <div className="mt-0.5 truncate text-xs text-muted">{note}</div>}
        </div>
        {spark && <Sparkline data={spark} color={tone} />}
      </div>
      <div className="mt-2 flex items-center gap-1.5 whitespace-nowrap border-t border-line/70 pt-2 text-xs text-muted">
        <Delta cur={cur} prev={prev} invert={invert} points={points} />
        <span>vs previous period</span>
      </div>
    </div>
  )
}
