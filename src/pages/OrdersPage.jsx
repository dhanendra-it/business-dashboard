import { useMemo, useState } from 'react'
import { CheckCircle2, Hourglass, Loader, Package, Wallet } from 'lucide-react'
import {
  Area,
  AreaChart,
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
import ProgressBar from '../components/ProgressBar'
import TwoLine from '../components/TwoLine'
import { Chips } from '../components/Controls'
import { AXIS, GRID, ChartTooltip } from '../components/chartKit'
import { COLORS, ORDER_STATUSES, SERVICES } from '../data/constants'
import { groupIntoBuckets } from '../lib/dates'
import { orderStats, total } from '../lib/analytics'
import { fmtDate, fmtDateTime, inr, inrShort } from '../lib/format'

export default function OrdersPage({ current, previous, buckets, index, open }) {
  const [status, setStatus] = useState('All')

  const cur = useMemo(() => orderStats(current.orders), [current])
  const prev = useMemo(() => orderStats(previous.orders), [previous])
  const collected = useMemo(() => total(current.payments, p => p.amount), [current])
  const prevCollected = useMemo(() => total(previous.payments, p => p.amount), [previous])

  const trend = useMemo(() => {
    const groups = groupIntoBuckets(buckets, current.payments, p => p.paidAt)
    const orderGroups = groupIntoBuckets(buckets, current.orders, o => o.createdAt)
    return buckets.map((b, i) => ({
      label: b.label,
      Collected: total(groups[i], p => p.amount),
      Orders: orderGroups[i].length
    }))
  }, [buckets, current])

  const statusData = ORDER_STATUSES.map(s => ({
    name: s,
    value: current.orders.filter(o => o.status === s).length,
    color: COLORS.order[s]
  }))

  const serviceRows = useMemo(
    () =>
      SERVICES.map(s => {
        const list = current.orders.filter(o => o.service === s.name)
        return {
          name: s.name,
          count: list.length,
          progress: list.length ? total(list, o => o.progress) / list.length : 0
        }
      })
        .filter(r => r.count > 0)
        .sort((a, b) => b.count - a.count),
    [current]
  )

  const orderRows = useMemo(
    () =>
      [...current.orders]
        .reverse()
        .filter(o => status === 'All' || o.status === status)
        .map(o => {
          const deal = index.dealById[o.dealId]
          return { ...o, lead: deal ? index.leadById[deal.leadId] : null }
        }),
    [current, index, status]
  )

  const paymentRows = useMemo(
    () =>
      [...current.payments].reverse().map(p => {
        const deal = index.dealById[p.dealId]
        return { ...p, lead: deal ? index.leadById[deal.leadId] : null, service: deal ? deal.service : '' }
      }),
    [current, index]
  )

  const orderColumns = [
    { label: 'Order', render: o => <TwoLine main={o.service} sub={o.id} /> },
    { label: 'Deal', render: o => o.dealId },
    { label: 'Client', render: o => (o.lead ? o.lead.name : '-') },
    { label: 'Status', render: o => <Badge>{o.status}</Badge> },
    {
      label: 'Progress',
      render: o => (
        <div className="w-32">
          <ProgressBar value={o.progress} color={COLORS.order[o.status]} />
          <div className="mt-1 text-[11px] text-muted">
            Stage {o.stagesDone} of {o.stagesTotal} · {o.progress}%
          </div>
        </div>
      )
    },
    { label: 'Started', right: true, render: o => fmtDate(o.createdAt) }
  ]

  const paymentColumns = [
    { label: 'Payment', render: p => <TwoLine main={p.id} sub={p.service} /> },
    { label: 'Deal', render: p => p.dealId },
    { label: 'Client', render: p => (p.lead ? p.lead.name : '-') },
    { label: 'Method', render: p => p.method },
    { label: 'Received', render: p => fmtDateTime(p.paidAt) },
    {
      label: 'Amount',
      right: true,
      render: p => <span className="font-bold text-emerald-700">{inr(p.amount)}</span>
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Total orders"
          icon={Package}
          tone={COLORS.slate}
          value={cur.total}
          cur={cur.total}
          prev={prev.total}
        />
        <KpiCard
          label="Completed"
          icon={CheckCircle2}
          tone={COLORS.brand}
          value={cur.completed}
          cur={cur.completed}
          prev={prev.completed}
        />
        <KpiCard
          label="In progress"
          icon={Loader}
          tone={COLORS.slate}
          value={cur.inProgress}
          cur={cur.inProgress}
          prev={prev.inProgress}
        />
        <KpiCard
          label="Pending or on hold"
          icon={Hourglass}
          tone={COLORS.amber}
          value={cur.pending + cur.onHold}
          cur={cur.pending + cur.onHold}
          prev={prev.pending + prev.onHold}
          invert
        />
        <KpiCard
          label="Payments received"
          icon={Wallet}
          tone={COLORS.brand}
          value={inrShort(collected)}
          cur={collected}
          prev={prevCollected}
          spark={trend.map(t => t.Collected)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Order status" subtitle="Orders created in this range">
          <Donut data={statusData} centerLabel="orders" />
        </Panel>

        <Panel
          title="Collection trend"
          subtitle="Payments received per period"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend} margin={{ left: -6, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="collection" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.brand} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLORS.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" {...AXIS} minTickGap={24} />
              <YAxis {...AXIS} tickFormatter={inrShort} />
              <Tooltip content={<ChartTooltip formatter={(v, p) => (p.dataKey === 'Collected' ? inr(v) : v)} />} />
              <Area
                type="monotone"
                dataKey="Collected"
                stroke={COLORS.brand}
                strokeWidth={2.2}
                fill="url(#collection)"
                dot={trend.length < 3 ? { r: 3 } : false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Progress by service" subtitle="Average order progress">
          {serviceRows.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-4">
              {serviceRows.map(s => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{s.name}</span>
                    <span className="tabular-nums text-muted">
                      {s.count} order{s.count === 1 ? '' : 's'} · {Math.round(s.progress)}%
                    </span>
                  </div>
                  <ProgressBar value={s.progress} color={COLORS.slate} height="h-2" />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Orders"
          subtitle="Select an order to open its deal, other orders and payments"
          className="lg:col-span-2"
        >
          <div className="mb-3">
            <Chips options={['All', ...ORDER_STATUSES]} value={status} onChange={setStatus} />
          </div>
          <DataTable
            columns={orderColumns}
            rows={orderRows}
            pageSize={7}
            onRowClick={o => open({ type: 'deal', id: o.dealId })}
            empty="No orders for the current filters"
          />
        </Panel>
      </div>

      <Panel title="Payment history" subtitle="Every payment received in this range">
        <DataTable
          columns={paymentColumns}
          rows={paymentRows}
          pageSize={8}
          onRowClick={p => open({ type: 'deal', id: p.dealId })}
          empty="No payments received in this range"
        />
      </Panel>
    </div>
  )
}
