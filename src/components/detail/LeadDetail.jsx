import { ChevronRight } from 'lucide-react'
import Badge from '../Badge'
import ProgressBar from '../ProgressBar'
import { Block, Facts, Note, Stat } from './parts'
import { total } from '../../lib/analytics'
import { fmtDate, inr, inrShort } from '../../lib/format'

export default function LeadDetail({ lead, index, open }) {
  const quotes = index.quotesByLead[lead.id] || []
  const deals = index.dealsByLead[lead.id] || []
  const quoted = total(quotes, q => q.amount)
  const collected = total(deals, d => index.paidByDeal[d.id] || 0)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Badge>{lead.status}</Badge>
          <span className="text-xs text-muted">via {lead.source}</span>
        </div>
        <Facts
          items={[
            ['Company', lead.company],
            ['Owner', lead.owner],
            ['Interested in', lead.service],
            ['Created', fmtDate(lead.createdAt)]
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Quotations" value={quotes.length} />
        <Stat label="Quoted" value={inrShort(quoted)} />
        <Stat label="Deals" value={deals.length} />
        <Stat label="Collected" value={inrShort(collected)} />
      </div>

      <Block title="Quotations" count={quotes.length}>
        {quotes.length === 0 && <Note>No quotations for this lead</Note>}
        {quotes.map(q => {
          const deal = index.dealByQuote[q.id]
          return (
            <div key={q.id} className="rounded-xl border border-line bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{q.service}</div>
                  <div className="text-xs text-muted">
                    {q.id} · {fmtDate(q.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{inr(q.amount)}</div>
                  <Badge>{q.status}</Badge>
                </div>
              </div>
              {deal && (
                <button
                  onClick={() => open({ type: 'deal', id: deal.id })}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand"
                >
                  Converted into deal {deal.id}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )
        })}
      </Block>

      <Block title="Deals" count={deals.length}>
        {deals.length === 0 && <Note>No deals closed yet</Note>}
        {deals.map(d => {
          const paid = index.paidByDeal[d.id] || 0
          const orders = index.ordersByDeal[d.id] || []
          return (
            <button
              key={d.id}
              onClick={() => open({ type: 'deal', id: d.id })}
              className="block w-full rounded-xl border border-line bg-card p-3 text-left transition hover:border-brand"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{d.service}</div>
                  <div className="text-xs text-muted">
                    {d.id} · {orders.length} order{orders.length === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{inr(d.value)}</div>
                  <Badge>{d.priority}</Badge>
                </div>
              </div>
              <div className="mt-2.5">
                <ProgressBar value={(paid / d.value) * 100} />
                <div className="mt-1 text-[11px] text-muted">
                  {inr(paid)} collected of {inr(d.value)}
                </div>
              </div>
            </button>
          )
        })}
      </Block>
    </div>
  )
}
