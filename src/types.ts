// Shared domain types for the RowRunner fan ordering flow.

export type Category = 'food' | 'drinks' | 'merch'

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
  eta: string
  tint: TintKey
  tag: string | null
  desc: string
  options: OptionGroup | null
  addons: Addon[]
}

export type Menu = Record<Category, MenuItem[]>

export interface Seat {
  section: string
  row: string
  seat: string
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
  | 'menu'
  | 'item'
  | 'cart'
  | 'checkout'
  | 'confirm'
  | 'track'
  | 'done'

export type DemoSpeed = 'Chill' | 'Normal' | 'Fast'
