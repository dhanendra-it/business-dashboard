export default function LegendRow({ items }) {
  return (
    <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
      {items.map(item => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
