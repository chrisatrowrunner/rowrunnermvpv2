// create-payment-intent — the server that actually charges (Option A).
//
// The client sends the order's LINE ITEMS (not a dollar amount) plus the tip.
// We look up the authoritative prices in Supabase (menu_prices), recompute the
// subtotal + fees ourselves, add the tip, and create a Stripe PaymentIntent for
// that amount. A tampered client therefore can't underpay — the charge is
// always derived from the server's own prices.
//
// Env (set in Netlify ▸ Site configuration ▸ Environment variables):
//   STRIPE_SECRET_KEY   (secret — sk_test_… now, sk_live_… at go-live)
//   SUPABASE_URL / SUPABASE_ANON_KEY  (fall back to the VITE_ build vars)
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// fee formula — mirrors the fan app's totals() (service 10.5% + $2 delivery + 7% tax)
const SERVICE_RATE = 0.105
const DELIVERY_CENTS = 200
const TAX_RATE = 0.07
const TIP_CAP_CENTS = 100000 // sanity cap

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(obj),
})

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
  if (!process.env.STRIPE_SECRET_KEY) return json(500, { error: 'Payments are not configured' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid request' })
  }

  const lines = Array.isArray(body.lines) ? body.lines : []
  if (lines.length === 0) return json(400, { error: 'Your cart is empty' })
  let tip = Math.round(Number(body.tipCents) || 0)
  if (!Number.isFinite(tip) || tip < 0) tip = 0
  if (tip > TIP_CAP_CENTS) tip = TIP_CAP_CENTS

  // authoritative prices
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON)
  const { data: rows, error } = await sb.from('menu_prices').select('*')
  if (error || !rows) return json(500, { error: 'Could not load prices' })
  const priceOf = Object.fromEntries(rows.map((r) => [r.item_id, r]))

  let subtotal = 0
  for (const l of lines) {
    const p = priceOf[l.itemId]
    if (!p) return json(400, { error: `Unknown item: ${l.itemId}` })
    let cents = p.base_cents
    if (l.option && p.options && l.option in p.options) cents += p.options[l.option]
    for (const a of Array.isArray(l.addons) ? l.addons : []) {
      if (p.addons && a in p.addons) cents += p.addons[a]
    }
    const qty = Math.max(1, Math.min(20, Math.round(Number(l.qty) || 1)))
    subtotal += cents * qty
  }
  if (subtotal <= 0) return json(400, { error: 'Invalid order total' })

  const service = Math.round(subtotal * SERVICE_RATE)
  const delivery = DELIVERY_CENTS
  const tax = Math.round(subtotal * TAX_RATE)
  const amount = subtotal + service + delivery + tax + tip

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const pi = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { venue_id: 'uri-mens-soccer', event_id: 'uri-lasalle-msoc' },
    })
    return json(200, { clientSecret: pi.client_secret, amount, paymentIntentId: pi.id })
  } catch (e) {
    return json(502, { error: e instanceof Error ? e.message : 'Payment provider error' })
  }
}
