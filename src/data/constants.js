export const SERVICES = [
  { name: 'Private Limited Company', short: 'Pvt Ltd', category: 'Company Formation', base: 14000 },
  { name: 'LLP Registration', short: 'LLP', category: 'Company Formation', base: 9500 },
  { name: 'GST Registration', short: 'GST', category: 'Tax and Compliance', base: 4200 },
  { name: 'Annual Compliance', short: 'Compliance', category: 'Tax and Compliance', base: 8000 },
  { name: 'Trademark Filing', short: 'Trademark', category: 'Brand and IP', base: 6800 },
  { name: 'FSSAI License', short: 'FSSAI', category: 'Licenses', base: 5600 },
  { name: 'ISO Certification', short: 'ISO', category: 'Licenses', base: 16000 },
  { name: 'Website Development', short: 'Website', category: 'Digital Services', base: 26000 }
]

export const CATEGORIES = [...new Set(SERVICES.map(s => s.category))]

export const SOURCES = ['Google Ads', 'Website', 'Just Dial', 'Referral', 'LinkedIn']

export const OWNERS = ['Aarav Mehta', 'Diya Sharma', 'Kabir Joshi', 'Meera Nair', 'Rohan Verma']

export const METHODS = ['UPI', 'Bank Transfer', 'Card', 'Cash', 'Cheque']

export const LEAD_STATUSES = ['Open', 'Qualified', 'Converted', 'Unqualified']
export const ORDER_STATUSES = ['Pending', 'In Progress', 'Completed', 'On Hold']
export const PRIORITIES = ['High', 'Medium', 'Low']

export const COLORS = {
  leadStatus: {
    Total: '#4f6f8f',
    Qualified: '#14766a',
    Converted: '#d99a1f',
    Unqualified: '#c4584c'
  },
  sources: ['#14766a', '#d99a1f', '#4f6f8f', '#c4584c', '#8a6bb5'],
  quote: { Accepted: '#14766a', Pending: '#d99a1f', Rejected: '#c4584c' },
  order: {
    Completed: '#14766a',
    'In Progress': '#4f6f8f',
    Pending: '#d99a1f',
    'On Hold': '#e07a3f'
  },
  priority: { High: '#c4584c', Medium: '#d99a1f', Low: '#94a3a0' },
  brand: '#14766a',
  amber: '#d99a1f',
  slate: '#4f6f8f'
}

export const TONES = {
  Open: 'bg-slate-100 text-slate-600',
  Qualified: 'bg-teal-50 text-teal-700',
  Converted: 'bg-emerald-50 text-emerald-700',
  Unqualified: 'bg-rose-50 text-rose-700',
  Pending: 'bg-amber-50 text-amber-700',
  Accepted: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
  'In Progress': 'bg-sky-50 text-sky-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  'On Hold': 'bg-orange-50 text-orange-700',
  High: 'bg-rose-50 text-rose-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-slate-100 text-slate-600'
}
