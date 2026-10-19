import { Search } from 'lucide-react'

export function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            value === option
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-card text-muted hover:text-ink'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-52 rounded-lg border border-line bg-card py-1.5 pl-8 pr-3 text-xs font-medium outline-none focus:border-brand"
      />
    </label>
  )
}
