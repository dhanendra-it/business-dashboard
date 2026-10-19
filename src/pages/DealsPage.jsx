import { useMemo, useState } from 'react'
import { Handshake, Hourglass, IndianRupee, Wallet } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import KpiCard from '../components/KpiCard'
import Panel from '../components/Panel'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import Empty from '../components/Empty'
import LegendRow from '../components/LegendRow'
import ProgressBar from '../components/ProgressBar'
import TwoLine from '../components/TwoLine'
import { Chips } from '../components/Controls'
import { AXIS, GRID, ChartTooltip } from '../components/chartKit'
import { CATEGORIES, COLORS, PRIORITIES, SERVICES } from '../data/constants'
import { groupIntoBuckets } from '../lib/dates'
import { dealStats, total } from '../lib/analytics'
import { inr, inrShort, pct } from '../lib/format'

export default function DealsPage({ current, previous, buckets, index, open }) {
  const [priority, setPriority] = useState('All')

  const cur = useMemo(() => dealStats(current.deals, index), [current, index])
  const prev = useMemo(() => dealStats(previous.deals, index), [previous, index])

  const trend = useMemo(() => {
    const dealGroups = groupIntoBuckets(buckets, current.deals, d => d.createdAt)
    const payGroups = groupIntoBuckets(buckets, current.payments, p => p.paidAt)
    return buckets.map((b, i) => ({
      label: b.label,
      count: dealGroups[i].length,
      Booked: total(dealGroups[i], d => d.value),
      Collected: total(payGroups[i], p => p.amount)
    }))
  }, [buckets, current])

  const serviceRows = useMemo(
    () =>
      SERVICES.map(s => {
        const list = current.deals.filter(d => d.service === s.name)
        return { name: s.name, short: s.short, deals: list.length, revenue: total(list, d => d.value) }
      })
        .filter(r => r.deals > 0)
        .sort((a, b) => b.revenue - a.revenue),
    [current]
  )

  const categoryRows = useMemo(
    () =>
      CATEGORIES.map(c => ({
        name: c,
        revenue: total(
          current.deals.filter(d => d.category === c),
          d => d.value
        )
      }))
        .filter(r => r.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue),
    [current]
  )

  const priorityRows = useMemo(
    () =>
      PRIORITIES.map(p => {
        const list = current.deals.filter(d => d.priority === p)
        return { name: p, deals: list.length, revenue: total(list, d => d.value) }
      }),
    [current]
  )

  const dealRows = useMemo(
    () =>
      [...current.deals]
        .reverse()
        .filter(d => priority === 'All' || d.priority === priority)
        .map(d => ({
          ...d,
          lead: index.leadById[d.leadId],
          paid: index.paidByDeal[d.id] || 0,
          progress: index.progressByDeal[d.id] || 0,
          orderCount: (index.ordersByDeal[d.id] || []).length
        })),
    [current, index, priority]
  )

  const maxCategory = categoryRows.length ? categoryRows[0].revenue : 0

  const columns = [
    { label: 'Deal', render: d => <TwoLine main={d.service} sub={d.id} /> },
    { label: 'Lead', render: d => (d.lead ? d.lead.name : '-') },
    { label: 'Value', right: true, render: d => inr(d.value) },
    {
      label: 'Collected',
      render: d => (
        <div className="w-28">
          <ProgressBar value={(d.paid / d.value) * 100} />
          <div className="mt-1 text-[11px] text-muted">{pct((d.paid / d.value) * 100, 0)}</div>
        </div>
      )
    },
    {
      label: 'Order progress',
      render: d => (
        <div className="w-28">
          <ProgressBar value={d.progress} color={COLORS.slate} />
          <div className="mt-1 text-[11px] text-muted">
            {Math.round(d.progress)}% of {d.orderCount} order{d.orderCount === 1 ? '' : 's'}
          </div>
        </div>
      )
    },
    { label: 'Priority', render: d => <Badge>{d.priority}</Badge> }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Deals created"
          icon={Handshake}
          tone={COLORS.slate}
          value={cur.count}
          cur={cur.count}
          prev={prev.count}
          spark={trend.map(t => t.count)}
        />
        <KpiCard
          label="Deal revenue"
          icon={IndianRupee}
          tone={COLORS.brand}
          value={inrShort(cur.value)}
          cur={cur.value}
          prev={prev.value}
          spark={trend.map(t => t.Booked)}
        />
        <KpiCard
          label="Collected"
          icon={Wallet}
          tone={COLORS.amber}
          value={inrShort(cur.collected)}
          note={`${pct(cur.collectedRate)} of deal revenue`}
          cur={cur.collected}
          prev={prev.collected}
          spark={trend.map(t => t.Collected)}
        />
        <KpiCard
          label="Outstanding"
          icon={Hourglass}
          tone={COLORS.leadStatus.Unqualified}
          value={inrShort(cur.outstanding)}
          note="yet to be collected"
          cur={cur.outstanding}
          prev={prev.outstanding}
          invert
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Deals and revenue by service"
          subtitle="Revenue on the left axis, deal count on the right"
          className="lg:col-span-2"
          action={
            <LegendRow
              items={[
                { label: 'Deal revenue', color: COLORS.brand },
                { label: 'Deals', color: COLORS.amber }
              ]}
            />
          }
        >
          {serviceRows.length === 0 ? (
            <Empty height="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <ComposedChart data={serviceRows} margin={{ left: -6, right: 0, top: 8 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="short" {...AXIS} />
                <YAxis yAxisId="rev" {...AXIS} tickFormatter={inrShort} />
                <YAxis yAxisId="cnt" orientation="right" {...AXIS} allowDecimals={false} />
                <Tooltip
                  content={
                    <ChartTooltip formatter={(v, p) => (p.dataKey === 'revenue' ? inr(v) : v)} />
                  }
                  cursor={{ fill: '#f4f1ea' }}
                />
                <Bar yAxisId="rev" dataKey="revenue" name="Deal revenue" fill={COLORS.brand} radius={[4, 4, 0, 0]} barSize={22} />
                <Bar yAxisId="cnt" dataKey="deals" name="Deals" fill={COLORS.amber} radius={[4, 4, 0, 0]} barSize={22} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Total vs collected revenue" subtitle="For deals created in this range">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted">Total deal value</div>
              <div className="text-2xl font-extrabold tabular-nums">{inr(cur.value)}</div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted">
                <span>Collected</span>
                <span className="font-bold text-ink">{pct(cur.collectedRate)}</span>
              </div>
              <ProgressBar value={cur.collectedRate} color={COLORS.brand} height="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-brand-soft p-3">
                <div className="text-[11px] font-semibold text-brand-dark">Collected</div>
                <div className="font-extrabold tabular-nums text-brand-dark">{inr(cur.collected)}</div>
              </div>
              <div className="rounded-xl bg-rose-50 p-3">
                <div className="text-[11px] font-semibold text-rose-700">Outstanding</div>
                <div className="font-extrabold tabular-nums text-rose-700">{inr(cur.outstanding)}</div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Daily revenue trend"
          subtitle="Deal value booked against payments received"
          className="lg:col-span-2"
          action={
            <LegendRow
              items={[
                { label: 'Booked', color: COLORS.brand },
                { label: 'Collected', color: COLORS.amber }
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={trend} margin={{ left: -6, right: 8, top: 8 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" {...AXIS} minTickGap={24} />
              <YAxis {...AXIS} tickFormatter={inrShort} />
              <Tooltip
                content={<ChartTooltip formatter={v => inr(v)} />}
                cursor={{ fill: '#f4f1ea' }}
              />
              <Bar dataKey="Booked" fill={COLORS.brand} radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Line
                type="monotone"
                dataKey="Collected"
                stroke={COLORS.amber}
                strokeWidth={2.2}
                dot={trend.length < 3 ? { r: 3 } : false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Priority breakdown" subtitle="Deals and revenue by priority">
          <div className="space-y-4">
            {priorityRows.map(p => (
              <div key={p.name}>
                <div className="mb-1 flex items-center justify-between">
                  <Badge>{p.name}</Badge>
                  <span className="text-sm tabular-nums">
                    <b>{p.deals}</b> deals
                    <span className="ml-2 text-xs text-muted">{inrShort(p.revenue)}</span>
                  </span>
                </div>
                <ProgressBar
                  value={cur.value ? (p.revenue / cur.value) * 100 : 0}
                  color={COLORS.priority[p.name]}
                  height="h-2"
                />
                <div className="mt-1 text-right text-[11px] text-muted">
                  {pct(cur.value ? (p.revenue / cur.value) * 100 : 0)} of revenue
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Revenue by category" subtitle="Deal value grouped by service category">
          {categoryRows.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-4">
              {categoryRows.map(c => (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{c.name}</span>
                    <span className="tabular-nums">{inrShort(c.revenue)}</span>
                  </div>
                  <ProgressBar
                    value={maxCategory ? (c.revenue / maxCategory) * 100 : 0}
                    color={COLORS.brand}
                    height="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Deal progress"
          subtitle="Collection and fulfilment per deal. Select a deal for orders and payments"
          className="lg:col-span-2"
        >
          <div className="mb-3">
            <Chips options={['All', ...PRIORITIES]} value={priority} onChange={setPriority} />
          </div>
          <DataTable
            columns={columns}
            rows={dealRows}
            pageSize={7}
            onRowClick={d => open({ type: 'deal', id: d.id })}
            empty="No deals for the current filters"
          />
        </Panel>
      </div>
    </div>
  )
}
