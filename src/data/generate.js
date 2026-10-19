import { SERVICES, SOURCES, OWNERS, METHODS } from './constants'

const DAY = 86400000
const HOUR = 3600000
const MINUTE = 60000
const HISTORY_DAYS = 150

const FIRST = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Rohan', 'Kabir', 'Ishaan', 'Karan', 'Rahul', 'Nikhil',
  'Ananya', 'Diya', 'Meera', 'Kavya', 'Riya', 'Sneha', 'Pooja', 'Neha', 'Isha', 'Tanvi',
  'Sahil', 'Manish', 'Deepak', 'Varun', 'Harsh', 'Priya', 'Simran', 'Anjali', 'Yash', 'Mohit'
]

const LAST = [
  'Sharma', 'Verma', 'Gupta', 'Mehta', 'Joshi', 'Patel', 'Nair', 'Reddy', 'Singh', 'Choudhary',
  'Agarwal', 'Jain', 'Kapoor', 'Bansal', 'Mishra', 'Pandey', 'Rathore', 'Tiwari', 'Saxena', 'Malhotra'
]

const SUFFIX = ['Traders', 'Enterprises', 'Foods', 'Labs', 'Infotech', 'Logistics', 'Studios', 'Agro', 'Textiles', 'Solutions']

function seeded(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateData(now) {
  const rand = seeded(20261019)
  const int = (min, max) => min + Math.floor(rand() * (max - min + 1))
  const pick = list => list[Math.floor(rand() * list.length)]
  const weighted = (list, weights) => {
    const sum = weights.reduce((a, b) => a + b, 0)
    let r = rand() * sum
    for (let i = 0; i < list.length; i++) {
      r -= weights[i]
      if (r <= 0) return list[i]
    }
    return list[list.length - 1]
  }

  const latest = now - MINUTE
  const dayZero = new Date(now)
  dayZero.setHours(0, 0, 0, 0)
  const todayStart = dayZero.getTime()
  const after = (base, ms) => {
    const t = base + ms
    if (t <= latest) return t
    return Math.floor(base + rand() * Math.max(latest - base, 0))
  }

  const stampOn = offset => {
    if (offset === 0) {
      return Math.floor(todayStart + rand() * Math.max(latest - todayStart, 0))
    }
    const d = new Date(todayStart)
    d.setDate(d.getDate() - offset)
    return d.getTime() + int(8, 20) * HOUR + int(0, 59) * MINUTE
  }

  const leads = []
  let leadSeq = 1000
  for (let off = HISTORY_DAYS - 1; off >= 0; off--) {
    const day = new Date(todayStart)
    day.setDate(day.getDate() - off)
    let count = day.getDay() === 0 ? int(0, 2) : int(2, 6)
    if (off === 0) count = Math.max(count, 3)
    for (let i = 0; i < count; i++) {
      leadSeq += 1
      const first = pick(FIRST)
      const last = pick(LAST)
      leads.push({
        id: `L-${leadSeq}`,
        name: `${first} ${last}`,
        company: `${last} ${pick(SUFFIX)}`,
        source: weighted(SOURCES, [34, 26, 16, 14, 10]),
        service: weighted(SERVICES.map(s => s.name), [18, 10, 18, 12, 12, 10, 8, 12]),
        owner: pick(OWNERS),
        status: weighted(['Open', 'Unqualified', 'Qualified', 'Converted'], [10, 38, 30, 22]),
        createdAt: stampOn(off)
      })
    }
  }

  const quotations = []
  let quoteSeq = 2000
  leads.forEach(lead => {
    if (lead.status !== 'Qualified' && lead.status !== 'Converted') return
    const converted = lead.status === 'Converted'
    const count = converted ? int(1, 3) : weighted([1, 2, 3], [55, 35, 10])
    const acceptedCount = converted ? (count > 1 && rand() < 0.3 ? 2 : 1) : 0
    for (let i = 0; i < count; i++) {
      const service =
        i === 0 || rand() < 0.4
          ? SERVICES.find(s => s.name === lead.service)
          : pick(SERVICES)
      let status
      if (converted) {
        status = i < acceptedCount ? 'Accepted' : rand() < 0.5 ? 'Rejected' : 'Pending'
      } else {
        status = rand() < 0.7 ? 'Pending' : 'Rejected'
      }
      quoteSeq += 1
      quotations.push({
        id: `Q-${quoteSeq}`,
        leadId: lead.id,
        service: service.name,
        category: service.category,
        amount: Math.round((service.base * (0.8 + rand() * 0.9)) / 100) * 100,
        status,
        createdAt: after(lead.createdAt, int(2, 120) * HOUR)
      })
    }
  })

  const deals = []
  let dealSeq = 3000
  quotations
    .filter(q => q.status === 'Accepted')
    .forEach(q => {
      dealSeq += 1
      deals.push({
        id: `D-${dealSeq}`,
        leadId: q.leadId,
        quotationId: q.id,
        service: q.service,
        category: q.category,
        value: Math.round((q.amount * (0.9 + rand() * 0.1)) / 100) * 100,
        priority: weighted(['High', 'Medium', 'Low'], [35, 45, 20]),
        createdAt: after(q.createdAt, int(6, 120) * HOUR)
      })
    })

  const orders = []
  let orderSeq = 4000
  deals.forEach(deal => {
    const count = weighted([1, 2, 3], [50, 35, 15])
    for (let i = 0; i < count; i++) {
      orderSeq += 1
      const service = i === 0 ? deal.service : pick(SERVICES).name
      const createdAt = after(deal.createdAt, int(1, 48) * HOUR)
      const duration = int(7, 35)
      const elapsed = (latest - createdAt) / DAY
      const stagesTotal = int(4, 6)
      let status = 'In Progress'
      let progress = 0
      let completedAt = null
      if (elapsed < 1 || rand() < 0.06) {
        status = 'Pending'
      } else if (elapsed >= duration) {
        status = 'Completed'
        progress = 100
        completedAt = createdAt + duration * DAY
      } else {
        const raw = Math.round((elapsed / duration) * 100 * (0.7 + rand() * 0.3))
        progress = Math.min(95, Math.max(5, raw))
        status = rand() < 0.12 ? 'On Hold' : 'In Progress'
      }
      orders.push({
        id: `O-${orderSeq}`,
        dealId: deal.id,
        service,
        status,
        progress,
        stagesTotal,
        stagesDone: status === 'Completed' ? stagesTotal : Math.floor((progress / 100) * stagesTotal),
        createdAt,
        completedAt
      })
    }
  })

  const payments = []
  let paySeq = 5000
  deals.forEach(deal => {
    const advance = 0.4 + rand() * 0.2
    const pattern =
      rand() < 0.45
        ? [1]
        : rand() < 0.5
          ? [advance, 1 - advance]
          : [advance, (1 - advance) / 2, (1 - advance) / 2]
    const offsets = [int(0, 1), int(8, 16), int(20, 34)]
    let remaining = deal.value
    let skipped = false
    pattern.forEach((share, i) => {
      let paidAt = deal.createdAt + offsets[i] * DAY + int(1, 6) * HOUR
      if (i === 0) {
        paidAt = after(deal.createdAt, paidAt - deal.createdAt)
      } else {
        if (paidAt > latest) return
        if (rand() < 0.18) {
          skipped = true
          return
        }
      }
      let amount = Math.round((deal.value * share) / 100) * 100
      if (i === pattern.length - 1 && !skipped) amount = remaining
      amount = Math.min(amount, remaining)
      if (amount <= 0) return
      remaining -= amount
      paySeq += 1
      payments.push({
        id: `P-${paySeq}`,
        dealId: deal.id,
        amount,
        method: weighted(METHODS, [38, 28, 14, 12, 8]),
        paidAt
      })
    })
  })

  const byCreated = (a, b) => a.createdAt - b.createdAt
  leads.sort(byCreated)
  quotations.sort(byCreated)
  deals.sort(byCreated)
  orders.sort(byCreated)
  payments.sort((a, b) => a.paidAt - b.paidAt)

  return { leads, quotations, deals, orders, payments }
}
