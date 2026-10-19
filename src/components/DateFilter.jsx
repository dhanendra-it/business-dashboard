import { CalendarDays } from 'lucide-react'

const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom' }
]

export default function DateFilter({ preset, onPreset, custom, onCustom, max }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-xl border border-line bg-card p-1">
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => onPreset(p.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              preset === p.id ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <CalendarDays size={15} />
          <input
            type="date"
            value={custom.from}
            max={max}
            onChange={e => e.target.value && onCustom({ ...custom, from: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={custom.to}
            max={max}
            onChange={e => e.target.value && onCustom({ ...custom, to: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}
