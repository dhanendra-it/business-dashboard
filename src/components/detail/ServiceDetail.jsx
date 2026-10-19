import Badge from '../Badge'
import { Block, Note, Stat } from './parts'
import { quoteStats } from '../../lib/analytics'
import { fmtDate, inr, inrShort, pct } from '../../lib/format'

export default function ServiceDetail({ service, quotations, index, open }) {
  const list = quotations.filter(q => q.service === service).sort((a, b) => b.createdAt - a.createdAt)
  const stats = quoteStats(list)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Quotations" value={stats.count} />
        <Stat label="Quoted" value={inrShort(stats.value)} />
        <Stat label="Accepted" value={stats.accepted} />
        <Stat label="Conversion" value={pct(stats.rate)} />
      </div>

      <Block title="Quotations in selected range" count={list.length}>
        {list.length === 0 && <Note>No quotations for this service in the range</Note>}
        {list.map(q => {
          const lead = index.leadById[q.leadId]
          return (
            <div key={q.id} className="rounded-xl border border-line bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <button
                    onClick={() => open({ type: 'lead', id: q.leadId })}
                    className="text-sm font-semibold text-brand"
                  >
                    {lead ? lead.name : q.leadId}
                  </button>
                  <div className="text-xs text-muted">
                    {q.id} · {fmtDate(q.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{inr(q.amount)}</div>
                  <Badge>{q.status}</Badge>
                </div>
              </div>
            </div>
          )
        })}
      </Block>
    </div>
  )
}
