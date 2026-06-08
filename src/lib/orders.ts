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
import { getSupabase, hasSupabase } from './supabase'

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

/** Base URL of the in-venue edge server (the shared order bus). */
const EDGE_URL = import.meta.env.VITE_EDGE_URL || 'http://localhost:4000'

/** What the runner app needs to see for an order, derived at submit time. */
export interface EdgeOrderInput {
  /** client-generated id, so the (anon) fan can poll its own order's status */
  id: string
  venueId: string
  seat: Seat
  /** where the runner picks up — the order's primary (slowest) stand */
  stand: { name: string; loc: string }
  lines: Array<{ name: string; qty: number; option: string | null; addons: string[] }>
}

/** Live status of a single order, as the fan tracking screen reads it. */
export interface OrderStatus {
  /** 0 received · 1 preparing · 2 picked up · 3 on the way · 4 delivered */
  stage: number
  orderNo: number
  runnerName: string | null
}

/**
 * Place an order on the shared edge server so the runner dispatch app sees it.
 *
 * Edge-first design (per the architecture): the device POSTs to the in-venue
 * Express server, which owns the label printer + kitchen queue and mirrors to
 * Supabase. The runner app reads the same row and claims/delivers it; the KDS
 * fans status changes back here. For the pilot, `rowrunner-edge` is that server.
 *
 * Swap to Supabase later by replacing this fetch with an insert into `orders`.
 */
export async function submitOrder(input: EdgeOrderInput): Promise<void> {
  // Supabase when configured — the shared production backend.
  if (hasSupabase) {
    const sb = getSupabase()
    // No .select() back: under hardened RLS the anon (fan) role can insert but
    // cannot read, so we must not request the row in return. (If the fan UI
    // later needs the real order number, expose a security-definer RPC that
    // inserts and returns it — that works for anon without opening reads.)
    const { error } = await sb.from('orders').insert({
      id: input.id,
      venue_id: input.venueId,
      seat: input.seat,
      stand: input.stand,
      lines: input.lines,
      stage: 1,
    })
    if (error) throw error
    return
  }

  // else fall back to the local edge server (the pilot stand-in).
  const res = await fetch(`${EDGE_URL}/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`edge submit failed: ${res.status}`)
}

/**
 * Read one order's live status. Anon (fans) can't SELECT the orders table under
 * the hardened RLS, so this calls a security-definer RPC (`order_status`) that
 * returns just this one order by id — the fan knows the id because it generated
 * it at submit time. Returns null if not found / not yet readable.
 */
export async function fetchOrderStatus(id: string): Promise<OrderStatus | null> {
  if (hasSupabase) {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('order_status', { p_id: id })
    const row = Array.isArray(data) ? data[0] : data
    if (error || !row) return null
    return { stage: row.stage, orderNo: row.order_no, runnerName: row.runner_name }
  }
  // edge fallback (pilot stand-in)
  const res = await fetch(`${EDGE_URL}/orders`)
  if (!res.ok) return null
  const all = (await res.json()) as Array<{ id: string; stage: number; orderNo: number; runnerName: string | null }>
  const o = all.find((x) => x.id === id)
  return o ? { stage: o.stage, orderNo: o.orderNo, runnerName: o.runnerName } : null
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
