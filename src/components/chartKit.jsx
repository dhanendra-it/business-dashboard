export const AXIS = {
  tick: { fontSize: 11, fill: '#6b756f' },
  tickLine: false,
  axisLine: false
}

export const GRID = {
  stroke: '#ece6da',
  strokeDasharray: '3 3',
  vertical: false
}

export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg">
      {label !== undefined && label !== '' && (
        <div className="mb-1 font-semibold text-ink">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={`${p.name}-${i}`} className="flex items-center gap-2 text-muted">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color || p.fill || (p.payload && p.payload.color) }}
          />
          <span>{p.name}</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums text-ink">
            {formatter ? formatter(p.value, p) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}
