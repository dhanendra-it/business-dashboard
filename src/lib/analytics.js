export const inRange = (ts, range) => ts >= range.start && ts <= range.end

export const total = (list, fn) => list.reduce((sum, item) => sum + fn(item), 0)

const ratio = (a, b) => (b ? (a / b) * 100 : 0)

export function sliceData(data, range) {
  return {
    leads: data.leads.filter(l => inRange(l.createdAt, range)),
    quotations: data.quotations.filter(q => inRange(q.createdAt, range)),
    deals: data.deals.filter(d => inRange(d.createdAt, range)),
    orders: data.orders.filter(o => inRange(o.createdAt, range)),
    payments: data.payments.filter(p => inRange(p.paidAt, range))
  }
}

export function buildIndex(data) {
  const index = {
    leadById: {},
    dealById: {},
    quoteById: {},
    quotesByLead: {},
    dealsByLead: {},
    dealByQuote: {},
    ordersByDeal: {},
    paymentsByDeal: {},
    paidByDeal: {},
    progressByDeal: {}
  }
  const push = (map, key, item) => {
    if (!map[key]) map[key] = []
    map[key].push(item)
  }

  data.leads.forEach(l => {
    index.leadById[l.id] = l
  })
  data.quotations.forEach(q => {
    index.quoteById[q.id] = q
    push(index.quotesByLead, q.leadId, q)
  })
  data.deals.forEach(d => {
    index.dealById[d.id] = d
    index.dealByQuote[d.quotationId] = d
    push(index.dealsByLead, d.leadId, d)
  })
  data.orders.forEach(o => push(index.ordersByDeal, o.dealId, o))
  data.payments.forEach(p => {
    push(index.paymentsByDeal, p.dealId, p)
    index.paidByDeal[p.dealId] = (index.paidByDeal[p.dealId] || 0) + p.amount
  })
  data.deals.forEach(d => {
    const list = index.ordersByDeal[d.id] || []
    index.progressByDeal[d.id] = list.length ? total(list, o => o.progress) / list.length : 0
  })

  return index
}

export function leadStats(leads) {
  const count = status => leads.filter(l => l.status === status).length
  const converted = count('Converted')
  const qualified = count('Qualified') + converted
  return {
    total: leads.length,
    qualified,
    converted,
    unqualified: count('Unqualified'),
    open: count('Open'),
    rate: ratio(converted, leads.length),
    qualifiedRate: ratio(qualified, leads.length),
    unqualifiedRate: ratio(count('Unqualified'), leads.length)
  }
}

export function quoteStats(quotes) {
  const by = status => quotes.filter(q => q.status === status)
  const accepted = by('Accepted')
  return {
    count: quotes.length,
    value: total(quotes, q => q.amount),
    accepted: accepted.length,
    acceptedValue: total(accepted, q => q.amount),
    pending: by('Pending').length,
    rejected: by('Rejected').length,
    rate: ratio(accepted.length, quotes.length)
  }
}

export function dealStats(deals, index) {
  const value = total(deals, d => d.value)
  const collected = total(deals, d => index.paidByDeal[d.id] || 0)
  return {
    count: deals.length,
    value,
    collected,
    outstanding: Math.max(value - collected, 0),
    collectedRate: ratio(collected, value)
  }
}

export function orderStats(orders) {
  const count = status => orders.filter(o => o.status === status).length
  return {
    total: orders.length,
    completed: count('Completed'),
    inProgress: count('In Progress'),
    pending: count('Pending'),
    onHold: count('On Hold'),
    avgProgress: orders.length ? total(orders, o => o.progress) / orders.length : 0
  }
}
