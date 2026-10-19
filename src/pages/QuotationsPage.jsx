import { useMemo, useState } from 'react'
import { CheckCircle2, FileText, IndianRupee, Percent } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import KpiCard from '../components/KpiCard'
import Panel from '../components/Panel'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import Donut from '../components/Donut'
import Empty from '../components/Empty'
import Ring from '../components/Ring'
import TwoLine from '../components/TwoLine'
import { SearchBox } from '../components/Controls'
import { AXIS, GRID, ChartTooltip } from '../components/chartKit'
import { COLORS, SERVICES } from '../data/constants'
import { groupIntoBuckets } from '../lib/dates'
import { quoteStats } from '../lib/analytics'
import { fmtDate, inr, inrShort, pct } from '../lib/format'

export default function QuotationsPage({ current, previous, buckets, index, open }) {
  const [query, setQuery] = useState('')

  const cur = useMemo(() => quoteStats(current.quotations), [current])
  const prev = useMemo(() => quoteStats(previous.quotations), [previous])

  const groups = useMemo(
    () => groupIntoBuckets(buckets, current.quotations, q => q.createdAt),
    [buckets, current]
  )
  const spark = useMemo(() => groups.map(g => quoteStats(g)), [groups])

  const serviceRows = useMemo(
    () =>
      SERVICES.map(s => ({
        id: s.name,
        short: s.short,
        ...quoteStats(current.quotations.filter(q => q.service === s.name))
      }))
        .filter(r => r.count > 0)
        .sort((a, b) => b.count - a.count),
    [current]
  )

  const valueRows = useMemo(() => [...serviceRows].sort((a, b) => b.value - a.value), [serviceRows])

  const historyRows = useMemo(() => {
    const map = {}
    current.quotations.forEach(q => {
      if (!map[q.leadId]) map[q.leadId] = []
      map[q.leadId].push(q)
    })
    const needle = query.trim().toLowerCase()
    return Object.entries(map)
      .map(([leadId, list]) => ({
        id: leadId,
        lead: index.leadById[leadId],
        last: Math.max(...list.map(q => q.createdAt)),
        ...quoteStats(list)
      }))
      .filter(r => !needle || `${r.lead.name} ${r.lead.company} ${r.id}`.toLowerCase().includes(needle))
      .sort((a, b) => b.last - a.last)
  }, [current, index, query])

  const statusData = [
    { name: 'Accepted', value: cur.accepted, color: COLORS.quote.Accepted },
    { name: 'Pending', value: cur.pending, color: COLORS.quote.Pending },
    { name: 'Rejected', value: cur.rejected, color: COLORS.quote.Rejected }
  ]

  const serviceColumns = [
    { label: 'Service', render: r => <span className="font-semibold">{r.id}</span> },
    { label: 'Quotes', right: true, render: r => r.count },
    { label: 'Quoted', right: true, render: r => inr(r.value) },
    { label: 'Accepted', right: true, render: r => r.accepted },
    { label: 'Pending', right: true, render: r => r.pending },
    { label: 'Rejected', right: true, render: r => r.rejected },
    { label: 'Conv.', right: true, render: r => pct(r.rate) }
  ]

  const historyColumns = [
    {
      label: 'Lead',
      render: r => <TwoLine main={r.lead.name} sub={`${r.lead.company} · ${r.id}`} />
    },
    { label: 'Quotes', right: true, render: r => r.count },
    { label: 'Total quoted', right: true, render: r => inr(r.value) },
    {
      label: 'Status mix',
      render: r => (
        <span className="flex gap-1">
          {r.accepted > 0 && <Badge>Accepted</Badge>}
          {r.pending > 0 && <Badge>Pending</Badge>}
          {r.rejected > 0 && <Badge>Rejected</Badge>}
        </span>
      )
    },
    { label: 'Last quoted', right: true, render: r => fmtDate(r.last) }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Quotations created"
          icon={FileText}
          tone={COLORS.slate}
          value={cur.count}
          cur={cur.count}
          prev={prev.count}
          spark={spark.map(s => s.count)}
        />
        <KpiCard
          label="Quoted value"
          icon={IndianRupee}
          tone={COLORS.amber}
          value={inrShort(cur.value)}
          cur={cur.value}
          prev={prev.value}
          spark={spark.map(s => s.value)}
        />
        <KpiCard
          label="Accepted"
          icon={CheckCircle2}
          tone={COLORS.brand}
          value={cur.accepted}
          note={`${inrShort(cur.acceptedValue)} accepted value`}
          cur={cur.accepted}
          prev={prev.accepted}
          spark={spark.map(s => s.accepted)}
        />
        <KpiCard
          label="Quote to deal rate"
          icon={Percent}
          tone={COLORS.leadStatus.Converted}
          value={pct(cur.rate)}
          note="accepted / created"
          cur={cur.rate}
          prev={prev.rate}
          points
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Quotations by service" subtitle="Number of quotations raised">
          {serviceRows.length === 0 ? (
            <Empty height="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={serviceRows} layout="vertical" margin={{ left: 0, right: 16, top: 4 }}>
                <CartesianGrid {...GRID} horizontal={false} vertical />
                <XAxis type="number" {...AXIS} allowDecimals={false} />
                <YAxis type="category" dataKey="short" width={76} {...AXIS} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f4f1ea' }} />
                <Bar dataKey="count" name="Quotations" fill={COLORS.slate} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Quotation value by service" subtitle="Total quoted amount">
          {valueRows.length === 0 ? (
            <Empty height="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={valueRows} layout="vertical" margin={{ left: 0, right: 16, top: 4 }}>
                <CartesianGrid {...GRID} horizontal={false} vertical />
                <XAxis type="number" {...AXIS} tickFormatter={inrShort} />
                <YAxis type="category" dataKey="short" width={76} {...AXIS} />
                <Tooltip
                  content={<ChartTooltip formatter={v => inr(v)} />}
                  cursor={{ fill: '#f4f1ea' }}
                />
                <Bar dataKey="value" name="Quoted" fill={COLORS.amber} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Quote to deal conversion" subtitle="Share of quotations that became deals">
          <div className="flex flex-col items-center gap-4 py-2">
            <Ring value={cur.rate} size={170} stroke={14} color={COLORS.brand}>
              <div>
                <div className="text-3xl font-extrabold tabular-nums">{pct(cur.rate)}</div>
                <div className="text-[11px] text-muted">conversion</div>
              </div>
            </Ring>
            <p className="text-sm text-muted">
              <b className="text-ink">{cur.accepted}</b> accepted out of{' '}
              <b className="text-ink">{cur.count}</b> quotations
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Quotation status" subtitle="Accepted, pending and rejected">
          <Donut data={statusData} centerLabel="quotations" />
        </Panel>

        <Panel
          title="Service wise quotation details"
          subtitle="Select a service to see every quotation behind the numbers"
          className="lg:col-span-2"
        >
          <DataTable
            columns={serviceColumns}
            rows={serviceRows}
            pageSize={8}
            onRowClick={r => open({ type: 'service', id: r.id })}
          />
        </Panel>
      </div>

      <Panel
        title="Lead wise quotation history"
        subtitle="One lead can have several quotations"
        action={<SearchBox value={query} onChange={setQuery} placeholder="Search lead" />}
      >
        <DataTable
          columns={historyColumns}
          rows={historyRows}
          pageSize={8}
          onRowClick={r => open({ type: 'lead', id: r.id })}
          empty="No quotation history for this range"
        />
      </Panel>
    </div>
  )
}
