import { useEffect } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import LeadDetail from './detail/LeadDetail'
import DealDetail from './detail/DealDetail'
import ServiceDetail from './detail/ServiceDetail'

export default function Drawer({ stack, index, quotations, open, onBack, onClose }) {
  const entity = stack[stack.length - 1]

  useEffect(() => {
    if (!entity) return undefined
    const onKey = e => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [entity, onClose])

  if (!entity) return null

  let kicker = ''
  let title = ''
  let body = null

  if (entity.type === 'lead') {
    const lead = index.leadById[entity.id]
    kicker = `Lead ${lead.id}`
    title = lead.name
    body = <LeadDetail lead={lead} index={index} open={open} />
  } else if (entity.type === 'deal') {
    const deal = index.dealById[entity.id]
    kicker = 'Deal'
    title = deal.id
    body = <DealDetail deal={deal} index={index} open={open} />
  } else {
    kicker = 'Service'
    title = entity.id
    body = <ServiceDetail service={entity.id} quotations={quotations} index={index} open={open} />
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade bg-ink/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl animate-slide overflow-y-auto bg-paper shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur">
          {stack.length > 1 && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted">{kicker}</div>
            <div className="truncate text-lg font-extrabold">{title}</div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>
        <div className="p-5">{body}</div>
      </aside>
    </div>
  )
}
