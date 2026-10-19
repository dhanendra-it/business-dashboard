import { useCallback, useMemo, useState } from 'react'
import { Activity, FileText, IndianRupee, PackageCheck, Users } from 'lucide-react'
import DateFilter from './components/DateFilter'
import Drawer from './components/Drawer'
import LeadsPage from './pages/LeadsPage'
import QuotationsPage from './pages/QuotationsPage'
import DealsPage from './pages/DealsPage'
import OrdersPage from './pages/OrdersPage'
import { generateData } from './data/generate'
import { buildIndex, sliceData } from './lib/analytics'
import { addDays, buildBuckets, getRange, previousRange, toInputValue } from './lib/dates'
import { describeRange } from './lib/format'

const NOW = Date.now()
const DATA = generateData(NOW)
const INDEX = buildIndex(DATA)

const PAGES = [
  {
    id: 'leads',
    label: 'Leads',
    icon: Users,
    title: 'Lead Analytics',
    blurb: 'How many leads arrive, where they come from and how many convert',
    view: LeadsPage
  },
  {
    id: 'quotations',
    label: 'Quotes',
    icon: FileText,
    title: 'Quotation Analytics',
    blurb: 'Quotations raised, their value and how often they turn into deals',
    view: QuotationsPage
  },
  {
    id: 'deals',
    label: 'Revenue',
    icon: IndianRupee,
    title: 'Deals and Revenue',
    blurb: 'Closed deals, revenue booked and money collected',
    view: DealsPage
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: PackageCheck,
    title: 'Orders and Payments',
    blurb: 'Fulfilment progress and payment collection',
    view: OrdersPage
  }
]

export default function App() {
  const [pageId, setPageId] = useState('leads')
  const [preset, setPreset] = useState('30d')
  const [custom, setCustom] = useState({
    from: toInputValue(addDays(NOW, -13)),
    to: toInputValue(NOW)
  })
  const [stack, setStack] = useState([])

  const range = useMemo(() => getRange(preset, custom, NOW), [preset, custom])
  const prevRange = useMemo(() => previousRange(range), [range])
  const current = useMemo(() => sliceData(DATA, range), [range])
  const previous = useMemo(() => sliceData(DATA, prevRange), [prevRange])
  const buckets = useMemo(() => buildBuckets(range, NOW), [range])

  const open = useCallback(entity => setStack(s => [...s, entity]), [])
  const back = useCallback(() => setStack(s => s.slice(0, -1)), [])
  const close = useCallback(() => setStack([]), [])

  const page = PAGES.find(p => p.id === pageId)
  const View = page.view

  return (
    <div className="min-h-screen md:pl-[84px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[84px] flex-col items-center gap-1.5 bg-ink py-5 md:flex">
        <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
          <Activity size={20} />
        </div>
        {PAGES.map(p => (
          <button
            key={p.id}
            onClick={() => setPageId(p.id)}
            className={`flex w-[68px] flex-col items-center gap-1 rounded-xl py-2.5 text-[10px] font-bold transition ${
              pageId === p.id ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white'
            }`}
          >
            <p.icon size={20} />
            {p.label}
          </button>
        ))}
      </aside>

      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-5 md:px-8">
        <nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">
          {PAGES.map(p => (
            <button
              key={p.id}
              onClick={() => setPageId(p.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold ${
                pageId === p.id ? 'border-ink bg-ink text-white' : 'border-line bg-card text-muted'
              }`}
            >
              <p.icon size={14} />
              {p.label}
            </button>
          ))}
        </nav>

        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand">
              Performance Desk
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{page.title}</h1>
            <p className="mt-1 text-sm text-muted">{page.blurb}</p>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <DateFilter
              preset={preset}
              onPreset={setPreset}
              custom={custom}
              onCustom={setCustom}
              max={toInputValue(NOW)}
            />
            <p className="text-xs text-muted">
              Showing <b className="text-ink">{describeRange(range)}</b> compared with{' '}
              {describeRange(prevRange)}
            </p>
          </div>
        </header>

        <View
          key={pageId}
          current={current}
          previous={previous}
          range={range}
          buckets={buckets}
          index={INDEX}
          open={open}
        />
      </main>

      <Drawer
        stack={stack}
        index={INDEX}
        quotations={current.quotations}
        open={open}
        onBack={back}
        onClose={close}
      />
    </div>
  )
}
