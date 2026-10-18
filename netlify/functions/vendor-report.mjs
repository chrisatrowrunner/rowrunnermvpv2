// vendor-report — totals what you owe the vendor (and your fees) straight from
// Stripe, so you never touch a spreadsheet. Reads the split off each payment's
// metadata (vendor_base_usd, platform_fees_usd, tip_usd).
//
// Access-gated: the caller must send the x-report-token header matching the
// REPORT_TOKEN env var (set in Netlify, Functions scope). Uses the same Stripe
// secret as the payment function (read-only use here).
import Stripe from 'stripe'

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || process.env.SECRET_KEY
const REPORT_TOKEN = process.env.REPORT_TOKEN

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(obj),
})

const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export const handler = async (event) => {
  if (!STRIPE_SECRET) return json(500, { error: 'Payments are not configured' })
  if (!REPORT_TOKEN) return json(500, { error: 'Report is not configured (set REPORT_TOKEN)' })

  const token = event.headers['x-report-token'] || event.headers['X-Report-Token']
  if (token !== REPORT_TOKEN) return json(401, { error: 'Wrong access code' })

  // Optional date range (YYYY-MM-DD, UTC). Absent → all time.
  const q = event.queryStringParameters || {}
  const created = {}
  if (q.from) created.gte = Math.floor(new Date(q.from + 'T00:00:00Z').getTime() / 1000)
  if (q.to) created.lte = Math.floor(new Date(q.to + 'T23:59:59Z').getTime() / 1000)

  const stripe = new Stripe(STRIPE_SECRET)
  const t = {
    pamsOwed: 0,
    platformFees: 0,
    tips: 0,
    gross: 0,
    stripeFeesEst: 0,
    orders: 0,
    refunded: 0,
    unlabeled: 0,
  }

  try {
    let startingAfter
    for (let page = 0; page < 25; page++) {
      const params = { limit: 100, expand: ['data.latest_charge'] }
      if (created.gte || created.lte) params.created = created
      if (startingAfter) params.starting_after = startingAfter
      const res = await stripe.paymentIntents.list(params)
      for (const pi of res.data) {
        if (pi.status !== 'succeeded') continue // skip incomplete/failed intents
        const ch = pi.latest_charge && typeof pi.latest_charge === 'object' ? pi.latest_charge : null
        const refundedCents = ch ? ch.amount_refunded : 0
        if (refundedCents >= pi.amount) {
          t.refunded += 1 // fully refunded → money returned, nothing owed
          continue
        }
        const vb = num(pi.metadata?.vendor_base_usd)
        t.pamsOwed += vb
        t.platformFees += num(pi.metadata?.platform_fees_usd)
        t.tips += num(pi.metadata?.tip_usd)
        t.gross += pi.amount / 100
        t.stripeFeesEst += 0.029 * (pi.amount / 100) + 0.3
        t.orders += 1
        if (!pi.metadata?.vendor_base_usd) t.unlabeled += 1 // pre-split-metadata order
      }
      if (!res.has_more) break
      startingAfter = res.data[res.data.length - 1]?.id
      if (!startingAfter) break
    }
  } catch (e) {
    return json(502, { error: e instanceof Error ? e.message : 'Stripe error' })
  }

  const round = (n) => Math.round(n * 100) / 100
  return json(200, {
    vendor: "Pam's Grill",
    range: { from: q.from || 'all time', to: q.to || 'now' },
    pamsOwed: round(t.pamsOwed),
    platformFees: round(t.platformFees),
    tips: round(t.tips),
    gross: round(t.gross),
    stripeFeesEst: round(t.stripeFeesEst),
    yourNet: round(t.gross - t.pamsOwed - t.stripeFeesEst), // left after paying Pam's + Stripe
    orders: t.orders,
    refundedExcluded: t.refunded,
    unlabeledOrders: t.unlabeled,
  })
}
