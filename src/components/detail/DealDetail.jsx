import { ChevronRight } from 'lucide-react'
import Badge from '../Badge'
import ProgressBar from '../ProgressBar'
import { Block, Facts, Note, Stat } from './parts'
import { COLORS } from '../../data/constants'
import { fmtDate, inr } from '../../lib/format'

export default function DealDetail({ deal, index, open }) {
  const lead = index.leadById[deal.leadId]
  const orders = index.ordersByDeal[deal.id] || []
  const payments = [...(index.paymentsByDeal[deal.id] || [])].sort((a, b) => b.paidAt - a.paidAt)
  const paid = index.paidByDeal[deal.id] || 0
  const outstanding = Math.max(deal.value - paid, 0)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Badge>{deal.priority}</Badge>
          <span className="text-xs text-muted">{deal.category}</span>
        </div>
        <Facts
          items={[
            ['Service', deal.service],
            ['Created', fmtDate(deal.createdAt)],
            ['From quotation', deal.quotationId],
            ['Lead', lead ? lead.name : '-']
          ]}
        />
        {lead && (
          <button
            onClick={() => open({ type: 'lead', id: lead.id })}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand"
          >
            Open lead {lead.id}
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="mb-3 grid grid-cols-3 gap-3">
          <Stat label="Deal value" value={inr(deal.value)} />
          <Stat label="Collected" value={inr(paid)} />
          <Stat label="Outstanding" value={inr(outstanding)} />
        </div>
        <ProgressBar value={(paid / deal.value) * 100} height="h-2" />
        <div className="mt-1.5 text-[11px] text-muted">
          {((paid / deal.value) * 100).toFixed(1)}% collected
        </div>
      </div>

      <Block title="Orders" count={orders.length}>
        {orders.map(o => (
          <div key={o.id} className="rounded-xl border border-line bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{o.service}</div>
                <div className="text-xs text-muted">
                  {o.id} · started {fmtDate(o.createdAt)}
                </div>
              </div>
              <Badge>{o.status}</Badge>
            </div>
            <div className="mt-2.5">
              <ProgressBar value={o.progress} color={COLORS.order[o.status]} />
              <div className="mt-1 flex justify-between text-[11px] text-muted">
                <span>
                  Stage {o.stagesDone} of {o.stagesTotal}
                </span>
                <span>{o.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </Block>

      <Block title="Payments" count={payments.length}>
        {payments.length === 0 && <Note>No payments received yet</Note>}
        {payments.map(p => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-line bg-card px-3 py-2.5"
          >
            <div>
              <div className="text-sm font-semibold">{p.method}</div>
              <div className="text-xs text-muted">
                {p.id} · {fmtDate(p.paidAt)}
              </div>
            </div>
            <div className="text-sm font-bold tabular-nums text-emerald-700">{inr(p.amount)}</div>
          </div>
        ))}
      </Block>
    </div>
  )
}
