// Shared domain types for the RowRunner fan ordering flow.

export type TintKey =
  | 'peach'
  | 'butter'
  | 'mint'
  | 'sky'
  | 'grape'
  | 'rose'
  | 'navy'
  | 'slate'

/** A selectable choice within a required option group (e.g. a sauce). */
export interface Choice {
  name: string
  /** price delta in dollars */
  d: number
}

export interface OptionGroup {
  label: string
  required: boolean
  choices: Choice[]
}

export interface Addon {
  name: string
  /** price delta in dollars */
  d: number
}

export interface MenuItem {
  id: string
  name: string
  emoji: string
  price: number
  /** prep + delivery estimate in minutes */
  etaMin: number
  tint: TintKey
  tag: string | null
  desc: string
  options: OptionGroup | null
  addons: Addon[]
}

/**
 * Where to deliver. Shared shape with the runner app, KDS, and label printer
 * (stored as `orders.seat` jsonb).
 *
 * Numbered venues fill section/row/seat. Zone venues (unnumbered seating, e.g.
 * the URI Soccer Complex) also set `zone` + `label` + `detail`; every reader
 * shows `label`/`detail` when present and falls back to section/row/seat.
 */
export interface Seat {
  section: string
  row: string
  seat: string
  /** zone id the guest tapped on the venue map, e.g. "A2" or "B" */
  zone?: string
  /** primary line, e.g. "Section A2" */
  label?: string
  /** secondary line, e.g. "South bleachers" */
  detail?: string
}

/** A tappable area on a zone venue's map. */
export interface Zone {
  id: string
  label: string
  detail: string
  kind: 'bleacher' | 'standing'
}

export interface Restaurant {
  id: string
  name: string
  /** pickup location the runner sees */
  loc: string
  /** short descriptor under the name */
  blurb: string
  /** logo in public/assets; a monogram shows until the file exists */
  logo: string
}

export interface Venue {
  name: string
  event: string
  date: string
}

/** A line in the cart. `uid` is unique per line; `sig` identifies identical configs for merging. */
export interface CartLine {
  uid: number
  sig: string
  item: MenuItem
  qty: number
  /** which restaurant in the venue this is being ordered from */
  vendor: string
  /** that restaurant's prep+delivery ETA for this item, in minutes */
  etaMin: number
  option: string | null
  addons: string[]
  /** total price for this line including qty */
  lineTotal: number
}

export interface Totals {
  subtotal: number
  service: number
  delivery: number
  tax: number
  total: number
}

export type Screen =
  | 'landing'
  | 'zone'
  | 'menu'
  | 'item'
  | 'cart'
  | 'checkout'
  | 'confirm'
  | 'track'
  | 'done'

export type DemoSpeed = 'Chill' | 'Normal' | 'Fast'
