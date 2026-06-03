// orders.ts — the integration seam between the fan UI and the backend.
//
// The current build runs a self-contained demo: `store.tsx` simulates the
// kitchen → runner → delivered progression locally so the whole flow is
// clickable with no server. This file documents and isolates the single place
// that changes when you connect the real Node/Express + Supabase backend, so
// the screens never need to know whether data is real or simulated.
//
// Nothing here is imported by the demo yet — it's a typed contract + reference
// implementation. Wire `submitOrder` into `store.placeOrder()` when ready.
import type { CartLine, Seat, Totals } from '../types'

/** What the client sends to create an order. */
export interface OrderPayload {
  venueId: string
  seat: Seat
  lines: Array<{
    itemId: string
    name: string
    qty: number
    option: string | null
    addons: string[]
    lineTotal: number
  }>
  totals: Totals
  tip: number
  /** payment intent / token from Apple Pay, Google Pay, or the card form */
  paymentRef?: string
}

/** Order lifecycle stages — index matches StatusTracker's STEPS. */
export type OrderStage = 0 | 1 | 2 | 3 | 4

export interface OrderRecord {
  id: string
  orderNo: number
  stage: OrderStage
  etaSec: number
}

export function toPayload(
  venueId: string,
  seat: Seat,
  cart: CartLine[],
  totals: Totals,
  tip: number,
): OrderPayload {
  return {
    venueId,
    seat,
    lines: cart.map((l) => ({
      itemId: l.item.id,
      name: l.item.name,
      qty: l.qty,
      option: l.option,
      addons: l.addons,
      lineTotal: l.lineTotal,
    })),
    totals,
    tip,
  }
}

/**
 * Reference implementation — replace the body with a real call.
 *
 * Edge-first design: the device POSTs to the in-venue Express server (which
 * owns the Brother QL label printer and the kitchen queue) and mirrors to
 * Supabase when connectivity allows. The KDS reads the same Supabase row and
 * fans status changes back to this client via Supabase Realtime.
 *
 *   POST {EDGE_URL}/orders            -> { id, orderNo }
 *   supabase.channel(`order:${id}`)   -> stage / etaSec updates
 *
 * Example (uncomment once @supabase/supabase-js is installed):
 *
 *   import { createClient } from '@supabase/supabase-js'
 *   const supabase = createClient(
 *     import.meta.env.VITE_SUPABASE_URL,
 *     import.meta.env.VITE_SUPABASE_ANON_KEY,
 *   )
 *   const res = await fetch(`${EDGE_URL}/orders`, {
 *     method: 'POST',
 *     headers: { 'content-type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   })
 *   return res.json()
 */
export async function submitOrder(payload: OrderPayload): Promise<OrderRecord> {
  void payload
  throw new Error(
    'submitOrder is a backend seam — wire it to the Express/Supabase edge server. ' +
      'The demo flow uses the local simulator in store.tsx.',
  )
}

/**
 * Subscribe to live stage/ETA updates for an order. Reference shape for the
 * Supabase Realtime subscription the Track screen would consume.
 */
export function subscribeToOrder(
  orderId: string,
  onUpdate: (rec: OrderRecord) => void,
): () => void {
  void orderId
  void onUpdate
  // return supabase.channel(`order:${orderId}`)...subscribe()  -> unsubscribe fn
  return () => {}
}
