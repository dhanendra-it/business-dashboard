import { useMemo, useState } from 'react'
import { BadgeCheck, Percent, UserCheck, UserX, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import TwoLine from '../components/TwoLine'
import ProgressBar from '../components/ProgressBar'
import { Chips, SearchBox } from '../components/Controls'
import { AXIS, GRID, ChartTooltip } from '../components/chartKit'
import { COLORS, LEAD_STATUSES, SOURCES } from '../data/constants'
import { groupIntoBuckets } from '../lib/dates'
import { leadStats } from '../lib/analytics'
import { fmtDateTime, pct } from '../lib/format'

const LINES = ['Total', 'Qualified', 'Converted', 'Unqualified']

export default function LeadsPage({ current, previous, buckets, open }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')

  const cur = useMemo(() => leadStats(current.leads), [current])
  const prev = useMemo(() => leadStats(previous.leads), [previous])
  const groups = useMemo(
    () => groupIntoBuckets(buckets, current.leads, l => l.createdAt),
    [buckets, current]
  )

  const trend = useMemo(
    () =>
      groups.map((g, i) => {
        const s = leadStats(g)
        return {
          label: buckets[i].label,
          Total: s.total,
          Qualified: s.qualified,
          Converted: s.converted,
          Unqualified: s.unqualified
        }
      }),
    [groups, buckets]
  )

  const sourceTrend = useMemo(
    () =>
      groups.map((g, i) => {
        const row = { label: buckets[i].label }
        SOURCES.forEach(s => {
          row[s] = g.filter(l => l.source === s).length
        })
        return row
      }),
    [groups, buckets]
  )

  const sourceRows = useMemo(
    () =>
      SOURCES.map((name, i) => {
        const stats = leadStats(current.leads.filter(l => l.source === name))
        return { name, color: COLORS.sources[i], ...stats }
      }).sort((a, b) => b.total - a.total),
    [current]
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...current.leads]
      .reverse()
      .filter(l => status === 'All' || l.status === status)
      .filter(l => !q || `${l.name} ${l.company} ${l.id}`.toLowerCase().includes(q))
  }, [current, query, status])

  const steps = [
    { label: 'All leads', value: cur.total, color: COLORS.leadStatus.Total },
    { label: 'Qualified', value: cur.qualified, color: COLORS.leadStatus.Qualified },
    { label: 'Converted', value: cur.converted, color: COLORS.leadStatus.Converted }
  ]

  const columns = [
    { label: 'Lead', render: l => <TwoLine main={l.name} sub={l.company} /> },
    { label: 'Source', render: l => l.source },
    { label: 'Interested in', render: l => l.service },
    { label: 'Owner', render: l => l.owner },
    { label: 'Status', render: l => <Badge>{l.status}</Badge> },
    { label: 'Created', right: true, render: l => fmtDateTime(l.createdAt) }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Total leads"
          icon={Users}
          tone={COLORS.leadStatus.Total}
          value={cur.total}
          cur={cur.total}
          prev={prev.total}
          spark={trend.map(t => t.Total)}
        />
        <KpiCard
          label="Qualified"
          icon={UserCheck}
          tone={COLORS.leadStatus.Qualified}
          value={cur.qualified}
          note={`${pct(cur.qualifiedRate)} of total`}
          cur={cur.qualified}
          prev={prev.qualified}
          spark={trend.map(t => t.Qualified)}
        />
        <KpiCard
          label="Converted"
          icon={BadgeCheck}
          tone={COLORS.leadStatus.Converted}
          value={cur.converted}
          note={`${cur.qualified ? pct((cur.converted / cur.qualified) * 100) : '0.0%'} of qualified`}
          cur={cur.converted}
          prev={prev.converted}
          spark={trend.map(t => t.Converted)}
        />
        <KpiCard
          label="Unqualified"
          icon={UserX}
          tone={COLORS.leadStatus.Unqualified}
          value={cur.unqualified}
          note={`${pct(cur.unqualifiedRate)} of total`}
          cur={cur.unqualified}
          prev={prev.unqualified}
          invert
          spark={trend.map(t => t.Unqualified)}
        />
        <KpiCard
          label="Conversion rate"
          icon={Percent}
          tone={COLORS.brand}
          value={pct(cur.rate)}
          note="converted / total"
          cur={cur.rate}
          prev={prev.rate}
          points
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Lead funnel" subtitle="How leads move through each stage">
          <div className="space-y-4">
            {steps.map((s, i) => {
              const share = cur.total ? (s.value / cur.total) * 100 : 0
              const stepRate =
                i > 0 && steps[i - 1].value ? (s.value / steps[i - 1].value) * 100 : null
              return (
                <div key={s.label}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{s.label}</span>
                    <span className="tabular-nums">
                      <b>{s.value}</b>
                      <span className="ml-1.5 text-xs text-muted">{pct(share)}</span>
                    </span>
                  </div>
                  <div className="h-9 rounded-lg bg-paper">
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{ width: `${Math.max(share, s.value ? 4 : 0)}%`, background: s.color }}
                    />
                  </div>
                  {stepRate !== null && (
                    <p className="mt-1 text-xs text-muted">{pct(stepRate)} of previous stage</p>
                  )}
                </div>
              )
            })}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-rose-300 bg-rose-50/60 px-3 py-2 text-sm">
              <span className="font-semibold text-rose-700">Unqualified</span>
              <span className="tabular-nums">
                <b>{cur.unqualified}</b>
                <span className="ml-1.5 text-xs text-muted">{pct(cur.unqualifiedRate)}</span>
              </span>
            </div>
          </div>
        </Panel>

        <Panel
          title="Lead status trend"
          subtitle="Leads created per period, split by status"
          className="lg:col-span-2"
          action={
            <LegendRow items={LINES.map(k => ({ label: k, color: COLORS.leadStatus[k] }))} />
          }
        >
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={trend} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" {...AXIS} minTickGap={24} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              {LINES.map(k => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={COLORS.leadStatus[k]}
                  strokeWidth={2}
                  dot={trend.length < 3 ? { r: 3 } : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Lead source trend"
          subtitle="Where new leads are coming from"
          className="lg:col-span-2"
          action={
            <LegendRow items={SOURCES.map((s, i) => ({ label: s, color: COLORS.sources[i] }))} />
          }
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sourceTrend} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" {...AXIS} minTickGap={24} />
              <YAxis {...AXIS} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f4f1ea' }} />
              {SOURCES.map((s, i) => (
                <Bar key={s} dataKey={s} stackId="source" fill={COLORS.sources[i]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Source performance" subtitle="Leads and conversion by source">
          {current.leads.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-4">
              {sourceRows.map(s => (
                <div key={s.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">{s.name}</span>
                    <span className="tabular-nums">
                      <b>{s.total}</b>
                      <span className="ml-2 text-xs text-muted">{pct(s.rate)} converted</span>
                    </span>
                  </div>
                  <ProgressBar
                    value={current.leads.length ? (s.total / current.leads.length) * 100 : 0}
                    color={s.color}
                    height="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Leads in this range"
        subtitle="Select a lead to see its quotations, deals, orders and payments"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SearchBox value={query} onChange={setQuery} placeholder="Search name or company" />
          </div>
        }
      >
        <div className="mb-3">
          <Chips options={['All', ...LEAD_STATUSES]} value={status} onChange={setStatus} />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          onRowClick={l => open({ type: 'lead', id: l.id })}
          empty="No leads match the current filters"
        />
      </Panel>
    </div>
  )
}
