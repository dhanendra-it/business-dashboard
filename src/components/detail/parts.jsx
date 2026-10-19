export function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 text-base font-extrabold tabular-nums">{value}</div>
    </div>
  )
}

export function Block({ title, count, children }) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
        {title}
        {count !== undefined && (
          <span className="rounded-full bg-line px-1.5 py-0.5 text-[10px] text-ink">{count}</span>
        )}
      </h4>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

export function Facts({ items }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] text-muted">{label}</dt>
          <dd className="font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Note({ children }) {
  return <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-sm text-muted">{children}</p>
}
