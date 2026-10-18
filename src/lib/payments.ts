// payments.ts — client-side Stripe helpers.
//
// The publishable key is public (safe in the bundle). The actual charge is
// created server-side by the create-payment-intent Netlify function, which
// totals the order from Supabase prices — the client never sends an amount.
import { loadStripe, type Stripe } from '@stripe/stripe-js'

const PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

/** True when a Stripe publishable key is configured (else checkout falls back). */
export const hasStripe = !!PK

/** Lazily-loaded Stripe.js instance (null when unconfigured). */
export const stripePromise: Promise<Stripe | null> | null = PK ? loadStripe(PK) : null

/** One order line, as the server needs it to price the charge + describe it. */
export interface PayLine {
  itemId: string
  /** display name, e.g. "Classic Cheeseburger" — used for the items summary */
  name: string
  option: string | null
  addons: string[]
  qty: number
}

/** Extra order context stamped onto the payment's metadata (for the vendor/records). */
export interface OrderContext {
  seatText?: string
  customerName?: string
  notes?: string
}

export interface IntentResult {
  clientSecret: string
  amount: number
  paymentIntentId: string
}

/** Ask the server to price the order and open a PaymentIntent. */
export async function createPaymentIntent(
  lines: PayLine[],
  tipCents: number,
  ctx: OrderContext = {},
): Promise<IntentResult> {
  const res = await fetch('/.netlify/functions/create-payment-intent', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lines, tipCents, ...ctx }),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error(msg.error || 'Could not start payment')
  }
  return res.json()
}
