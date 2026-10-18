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

// Public Supabase project values (anon key is public by design). Env vars take
// precedence; the literals are fallbacks since build env isn't guaranteed to
// reach the function runtime.
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kboevpucqjoftgmhrkzq.supabase.co'
const SUPABASE_ANON =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib2V2cHVjcWpvZnRnbWhya3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Mjk0OTUsImV4cCI6MjA5NjUwNTQ5NX0.T6W1QPUrVIqXsGog5axDlDneTUwZJnYu_JClIDVCkPc'
// Accept either name — the canonical STRIPE_SECRET_KEY or a plain SECRET_KEY.
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || process.env.SECRET_KEY
// The vendor's Stripe Connect account (e.g. acct_… for Pam's Grill). When set,
// each charge is split: the vendor receives the food base, RowRunner keeps the
// fees as an application fee. Unset → all funds go to the platform (no split).
const VENDOR_ACCOUNT = process.env.PAMS_GRILL_ACCOUNT || process.env.VENDOR_ACCOUNT

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
  if (!STRIPE_SECRET) return json(500, { error: 'Payments are not configured' })

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
    const stripe = new Stripe(STRIPE_SECRET)
    const usd = (c) => (c / 100).toFixed(2)
    const clip = (s) => String(s || '').slice(0, 480)

    // Human-readable list of what was ordered, e.g.
    // "2× Classic Cheeseburger (Double, Bacon) · 1× French Fries (Large)"
    const itemsText = lines
      .map((l) => {
        const extras = [l.option, ...(Array.isArray(l.addons) ? l.addons : [])].filter(Boolean).join(', ')
        const qty = Math.max(1, Math.min(20, Math.round(Number(l.qty) || 1)))
        return `${qty}× ${l.name || l.itemId}${extras ? ` (${extras})` : ''}`
      })
      .join(' · ')
      .slice(0, 480)
    const itemCount = lines.reduce((n, l) => n + Math.max(1, Math.min(20, Math.round(Number(l.qty) || 1))), 0)

    // Stamped on every payment: the vendor cut (so you can settle manually) plus
    // what/where/who, so the Stripe dashboard + CSV export double as an order log.
    const metadata = {
      venue_id: 'uri-mens-soccer',
      event_id: 'uri-lasalle-msoc',
      vendor: "Pam's Grill",
      vendor_base_usd: usd(subtotal), // ← pay this to Pam's
      platform_fees_usd: usd(service + delivery + tax),
      tip_usd: usd(tip),
      order_total_usd: usd(amount),
      items: itemsText || '—',
      item_count: String(itemCount),
    }
    if (body.seatText) metadata.seat = clip(body.seatText)
    if (body.customerName) metadata.customer = clip(body.customerName)
    if (body.notes) metadata.notes = clip(body.notes)

    const params = {
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata,
    }
    // Revenue split (Stripe Connect destination charge): the vendor is paid the
    // food base; RowRunner keeps everything above it (fees + tip) as the
    // application fee. Stripe's processing fee comes out of the application fee
    // (the platform), so the vendor always receives the full base amount.
    if (VENDOR_ACCOUNT) {
      params.transfer_data = { destination: VENDOR_ACCOUNT }
      params.application_fee_amount = amount - subtotal // = service + delivery + tax + tip
    }
    const pi = await stripe.paymentIntents.create(params)
    return json(200, { clientSecret: pi.client_secret, amount, paymentIntentId: pi.id })
  } catch (e) {
    return json(502, { error: e instanceof Error ? e.message : 'Payment provider error' })
  }
}
