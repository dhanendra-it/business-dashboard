import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltip } from './chartKit'
import Empty from './Empty'

export default function Donut({ data, centerLabel }) {
  const sum = data.reduce((t, d) => t + d.value, 0)
  const visible = data.filter(d => d.value > 0)

  if (!sum) return <Empty />

  return (
    <div>
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visible}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              stroke="none"
            >
              {visible.map(d => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-2xl font-extrabold tabular-nums">{sum}</div>
            <div className="text-[11px] text-muted">{centerLabel}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            <span className="text-muted">{d.name}</span>
            <span className="ml-auto font-semibold tabular-nums">{d.value}</span>
            <span className="w-12 text-right tabular-nums text-muted">
              {((d.value / sum) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
