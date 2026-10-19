import { TONES } from '../data/constants'

export default function Badge({ children }) {
  const tone = TONES[children] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
      {children}
    </span>
  )
}
