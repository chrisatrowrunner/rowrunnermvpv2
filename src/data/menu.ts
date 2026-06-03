// Menu data for the RowRunner demo venue.
//
// In production this would be fetched from Supabase (per-venue `menu_items`,
// `option_groups`, `addons` tables). The shape here intentionally mirrors a
// denormalized API response so swapping the source is a one-file change.
import type { Addon, Category, Menu, MenuItem, OptionGroup, Seat, Venue, TintKey } from '../types'

export const VENUE: Venue = {
  name: 'NYC Tech Week',
  event: 'The Glasshouse · Demo Day Main Stage',
  date: 'Mon, Jun 8 · 6:30 PM',
}

export const SEAT: Seat = { section: '204', row: 'J', seat: '17' }

// soft tinted tiles behind each emoji (cohesive, brand-adjacent pastels)
export const TINTS: Record<TintKey, string> = {
  peach: 'linear-gradient(135deg,#FFE9D6,#FFD9BC)',
  butter: 'linear-gradient(135deg,#FFF3CF,#FFE8A8)',
  mint: 'linear-gradient(135deg,#D8F3E4,#BCEBD2)',
  sky: 'linear-gradient(135deg,#DCF1FA,#BFE4F4)',
  grape: 'linear-gradient(135deg,#E7E0FB,#D4C8F5)',
  rose: 'linear-gradient(135deg,#FFE1E6,#FFC9D3)',
  navy: 'linear-gradient(135deg,#0E3F5E,#072E48)',
  slate: 'linear-gradient(135deg,#E9EEF3,#D7E0E9)',
}

export const MENU: Menu = {
  food: [
    {
      id: 'wings', name: 'Buffalo Wings', emoji: '🍗', price: 13.5, eta: '10–14 min', tint: 'peach', tag: 'Fan favorite',
      desc: 'Eight crispy jumbo wings tossed in your choice of sauce. Served with celery and a side dip.',
      options: { label: 'Pick your sauce', required: true, choices: [
        { name: 'Classic Buffalo', d: 0 }, { name: 'Smoky BBQ', d: 0 }, { name: 'Honey Mustard', d: 0 }, { name: 'Garlic Parm', d: 0.5 }] },
      addons: [{ name: 'Add Loaded Fries', d: 3.0 }, { name: 'Extra Sauce', d: 1.0 }, { name: 'Ranch Dip', d: 0.75 }],
    },
    {
      id: 'burger', name: 'Stadium Cheeseburger', emoji: '🍔', price: 12.0, eta: '12–16 min', tint: 'butter', tag: null,
      desc: 'Quarter-pound smashed patty, American cheese, pickles, house sauce on a toasted brioche bun.',
      options: { label: 'Temperature', required: true, choices: [{ name: 'Medium', d: 0 }, { name: 'Medium-Well', d: 0 }, { name: 'Well Done', d: 0 }] },
      addons: [{ name: 'Add Bacon', d: 2.0 }, { name: 'Add Fries', d: 3.0 }, { name: 'Extra Cheese', d: 1.0 }],
    },
    {
      id: 'nachos', name: 'Loaded Nachos', emoji: '🧀', price: 11.0, eta: '8–12 min', tint: 'butter', tag: null,
      desc: 'Warm tortilla chips smothered in queso, jalapeños, pico de gallo, and sour cream.',
      options: { label: 'Protein', required: true, choices: [{ name: 'No protein', d: 0 }, { name: 'Pulled Pork', d: 2.5 }, { name: 'Seasoned Beef', d: 2.5 }] },
      addons: [{ name: 'Extra Queso', d: 1.5 }, { name: 'Guacamole', d: 2.0 }],
    },
    {
      id: 'hotdog', name: 'Classic Hot Dog', emoji: '🌭', price: 7.5, eta: '6–9 min', tint: 'rose', tag: 'Quick',
      desc: 'All-beef foot-long on a steamed bun. Dress it your way at no extra charge.',
      options: { label: 'Style', required: true, choices: [{ name: 'Plain', d: 0 }, { name: 'Chicago', d: 0 }, { name: 'Chili Cheese', d: 1.5 }] },
      addons: [{ name: 'Add Fries', d: 3.0 }, { name: 'Extra Dog', d: 4.0 }],
    },
    {
      id: 'pretzel', name: 'Jumbo Soft Pretzel', emoji: '🥨', price: 8.0, eta: '5–8 min', tint: 'peach', tag: 'Quick',
      desc: 'Warm Bavarian pretzel with sea salt and a side of beer cheese.',
      options: null,
      addons: [{ name: 'Extra Beer Cheese', d: 1.5 }, { name: 'Cinnamon Sugar', d: 0.5 }],
    },
    {
      id: 'pizza', name: 'Personal Pepperoni', emoji: '🍕', price: 10.5, eta: '12–15 min', tint: 'rose', tag: null,
      desc: 'Seven-inch stone-baked pizza with mozzarella and crispy pepperoni.',
      options: { label: 'Crust', required: true, choices: [{ name: 'Classic', d: 0 }, { name: 'Thin & Crispy', d: 0 }] },
      addons: [{ name: 'Extra Cheese', d: 1.5 }, { name: 'Add Mushrooms', d: 1.0 }],
    },
    {
      id: 'fries', name: 'Garlic Parm Fries', emoji: '🍟', price: 6.5, eta: '7–10 min', tint: 'butter', tag: null,
      desc: 'Crispy fries tossed in garlic, parmesan, and parsley.', options: null,
      addons: [{ name: 'Add Queso', d: 1.5 }, { name: 'Truffle Drizzle', d: 2.0 }],
    },
    {
      id: 'popcorn', name: 'Kettle Popcorn', emoji: '🍿', price: 5.5, eta: '4–7 min', tint: 'butter', tag: 'Quick',
      desc: 'Freshly popped sweet-and-salty kettle corn in a souvenir tub.', options: null, addons: [],
    },
  ],
  drinks: [
    {
      id: 'beer', name: 'Draft Beer', emoji: '🍺', price: 11.0, eta: '5–8 min', tint: 'butter', tag: '21+',
      desc: '24oz ice-cold draft. Valid ID required on delivery.',
      options: { label: 'Choose your pour', required: true, choices: [{ name: 'Narragansett Lager', d: 0 }, { name: 'Local IPA', d: 1.0 }, { name: 'Light', d: 0 }] },
      addons: [],
    },
    {
      id: 'marg', name: 'Frozen Margarita', emoji: '🍹', price: 13.0, eta: '6–9 min', tint: 'mint', tag: '21+',
      desc: 'Hand-blended frozen margarita. Valid ID required on delivery.',
      options: { label: 'Flavor', required: true, choices: [{ name: 'Classic Lime', d: 0 }, { name: 'Strawberry', d: 0 }, { name: 'Mango', d: 0 }] }, addons: [],
    },
    {
      id: 'soda', name: 'Fountain Soda', emoji: '🥤', price: 5.5, eta: '4–6 min', tint: 'rose', tag: null,
      desc: '32oz souvenir cup with free refills at any stand.',
      options: { label: 'Pick your soda', required: true, choices: [{ name: 'Cola', d: 0 }, { name: 'Diet Cola', d: 0 }, { name: 'Lemon-Lime', d: 0 }, { name: 'Root Beer', d: 0 }] }, addons: [],
    },
    {
      id: 'lemonade', name: 'Fresh Lemonade', emoji: '🍋', price: 6.0, eta: '4–6 min', tint: 'butter', tag: null,
      desc: 'Hand-squeezed lemonade over ice.',
      options: { label: 'Flavor', required: true, choices: [{ name: 'Original', d: 0 }, { name: 'Strawberry', d: 0.5 }, { name: 'Blue Raspberry', d: 0.5 }] }, addons: [],
    },
    {
      id: 'water', name: 'Bottled Water', emoji: '💧', price: 4.0, eta: '3–5 min', tint: 'sky', tag: null,
      desc: '20oz purified bottled water. Stay hydrated.', options: null, addons: [],
    },
    {
      id: 'coffee', name: 'Hot Coffee', emoji: '☕', price: 4.5, eta: '4–7 min', tint: 'peach', tag: null,
      desc: 'Freshly brewed regular or decaf.',
      options: { label: 'Roast', required: true, choices: [{ name: 'Regular', d: 0 }, { name: 'Decaf', d: 0 }] }, addons: [{ name: 'Extra Shot', d: 1.0 }],
    },
  ],
  merch: [
    {
      id: 'cap', name: 'Friars Snapback', emoji: '🧢', price: 32.0, eta: '9–13 min', tint: 'navy', tag: 'Bestseller',
      desc: 'Adjustable embroidered cap in team colors. One size fits most.', options: null, addons: [],
    },
    {
      id: 'tee', name: 'Game Day Tee', emoji: '👕', price: 28.0, eta: '9–13 min', tint: 'navy', tag: null,
      desc: 'Soft cotton tee with the official team crest.',
      options: { label: 'Size', required: true, choices: [{ name: 'S', d: 0 }, { name: 'M', d: 0 }, { name: 'L', d: 0 }, { name: 'XL', d: 0 }, { name: 'XXL', d: 2.0 }] }, addons: [],
    },
    {
      id: 'towel', name: 'Rally Towel', emoji: '🏳️', price: 12.0, eta: '8–11 min', tint: 'sky', tag: null,
      desc: 'Wave it loud. Official white-out rally towel.', options: null, addons: [],
    },
    {
      id: 'scarf', name: 'Team Scarf', emoji: '🧣', price: 24.0, eta: '9–13 min', tint: 'navy', tag: null,
      desc: 'Knit supporter scarf with team name and crest.', options: null, addons: [],
    },
    {
      id: 'finger', name: 'Foam Finger', emoji: '☝️', price: 15.0, eta: '8–11 min', tint: 'sky', tag: 'Fan favorite',
      desc: 'Classic #1 foam finger. Let them know who runs this house.', options: null, addons: [],
    },
    {
      id: 'helmet', name: 'Mini Helmet', emoji: '⛑️', price: 35.0, eta: '10–14 min', tint: 'navy', tag: null,
      desc: 'Collectible mini helmet with authentic team decals.', options: null, addons: [],
    },
  ],
}

export const ALLERGENS = ['Gluten Free', 'Nut Free', 'Dairy Free', 'Vegetarian', 'Vegan']

export const money = (n: number): string => '$' + n.toFixed(2)

// ── Vendors (restaurants in the venue) ───────────────────────
// Each item is offered by several vendors, each with its own ETA. The pools are
// per-category so a coffee never shows up under a beer hall.
export interface Restaurant {
  id: string
  name: string
  loc: string
  /** seating section the stand sits in — used for "closest to me" */
  section: number
  /** a house-special flavor this vendor adds to flavor-customizable items */
  signature?: string
  /** this vendor's own extras (replace the item's generic add-ons) */
  extras?: Addon[]
}

const VENDOR_POOL: Record<Category, Restaurant[]> = {
  food: [
    { id: 'brooklyn-grill', name: 'The Brooklyn Grill', loc: 'Concourse A · Sec 110', section: 110,
      signature: 'Brooklyn Char BBQ', extras: [{ name: 'Loaded Fries', d: 3.0 }, { name: 'Pickle Spear', d: 1.0 }] },
    { id: 'empire-eats', name: 'Empire Eats', loc: 'Main Hall · Sec 118', section: 118,
      signature: 'Empire Classic Buffalo', extras: [{ name: 'Cheese Fries', d: 3.5 }, { name: 'Extra Sauce', d: 1.0 }] },
    { id: 'liberty-bites', name: 'Liberty Bites', loc: 'Concourse C · Sec 232', section: 232,
      signature: 'Liberty Smokehouse', extras: [{ name: 'Onion Rings', d: 3.0 }, { name: 'Jalapeños', d: 1.0 }] },
    { id: 'gotham-greens', name: 'Gotham Greens', loc: 'Atrium · Sec 101', section: 101,
      signature: 'Gotham Green Goddess', extras: [{ name: 'Side Salad', d: 3.5 }, { name: 'Avocado', d: 2.0 }] },
    { id: 'flatiron-fry', name: 'Flatiron Fry House', loc: 'Mezzanine · Sec 220', section: 220,
      signature: 'Flatiron Fire', extras: [{ name: 'Truffle Fries', d: 4.0 }, { name: 'Garlic Aioli', d: 1.0 }] },
  ],
  drinks: [
    { id: 'hudson-coffee', name: 'Hudson Coffee Co.', loc: 'Atrium · Sec 101', section: 101,
      signature: 'Hudson House Blend', extras: [{ name: 'Extra Shot', d: 1.0 }, { name: 'Oat Milk', d: 0.75 }] },
    { id: 'five-boroughs', name: 'Five Boroughs Tap', loc: 'Mezzanine · Sec 220', section: 220,
      signature: 'Five Boroughs Reserve', extras: [{ name: 'Souvenir Cup', d: 4.0 }, { name: 'Pretzel Bites', d: 5.0 }] },
    { id: 'highline-pours', name: 'High Line Pours', loc: 'Concourse B · Sec 204', section: 204,
      signature: 'High Line Citrus', extras: [{ name: 'Lime Wedge', d: 0.5 }, { name: 'Salt Rim', d: 0.5 }] },
    { id: 'gramercy-juice', name: 'Gramercy Juice Bar', loc: 'Concourse B · Sec 208', section: 208,
      signature: 'Cold-Pressed Daily', extras: [{ name: 'Chia Boost', d: 1.0 }, { name: 'Ginger Shot', d: 1.5 }] },
  ],
  merch: [
    { id: 'official-store', name: 'The Official Store', loc: 'Main Hall · Sec 115', section: 115 },
    { id: 'midtown-merch', name: 'Midtown Merch', loc: 'Concourse A · Sec 112', section: 112 },
    { id: 'techweek-popup', name: 'Tech Week Pop-Up', loc: 'Atrium · Sec 100', section: 100 },
  ],
}

const VENDOR_BY_ID: Record<string, Restaurant> = {}
;(Object.values(VENDOR_POOL).flat() as Restaurant[]).forEach((r) => (VENDOR_BY_ID[r.id] = r))

const ITEM_CAT: Record<string, Category> = {}
;(Object.keys(MENU) as Category[]).forEach((c) =>
  MENU[c].forEach((it) => (ITEM_CAT[it.id] = c)),
)

// Stable string hash so a given item+vendor always gets the same ETA.
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface VendorOffer {
  id: string
  name: string
  loc: string
  section: number
  etaMin: number
}

/**
 * Restaurants in the venue that serve this item, each with its own ETA,
 * sorted fastest-first. Deterministic — does not change between renders.
 */
export function vendorsFor(item: MenuItem): VendorOffer[] {
  const cat = ITEM_CAT[item.id] ?? 'food'
  // Deterministic vendor ordering for this item.
  const ranked = VENDOR_POOL[cat]
    .map((r) => ({ r, k: hashStr(item.id + '::' + r.id) }))
    .sort((a, b) => a.k - b.k)
  const n = 2 + (hashStr(item.id) % 2) // 2 or 3 spots per item
  const chosen = ranked.slice(0, Math.min(n, ranked.length))
  // Assign distinct, increasing ETAs so the fastest reads first.
  const base = 3 + (hashStr(item.id) % 9) // fastest: 3–11 min
  const step = 3 + (hashStr(item.id + 'step') % 4) // gap: 3–6 min
  return chosen.map((c, i) => ({
    id: c.r.id,
    name: c.r.name,
    loc: c.r.loc,
    section: c.r.section,
    etaMin: base + i * step,
  }))
}

// ── Dietary tags (drives the allergen filter) ────────────────
const DIET: Record<string, string[]> = {
  wings: ['Nut Free'],
  burger: ['Nut Free'],
  nachos: ['Gluten Free', 'Nut Free', 'Vegetarian'],
  hotdog: ['Nut Free'],
  pretzel: ['Nut Free', 'Vegetarian'],
  pizza: ['Nut Free', 'Vegetarian'],
  fries: ['Nut Free', 'Vegetarian'],
  popcorn: ['Gluten Free', 'Nut Free', 'Vegetarian'],
  beer: ['Dairy Free', 'Nut Free', 'Vegetarian', 'Vegan'],
  marg: ['Gluten Free', 'Dairy Free', 'Nut Free', 'Vegetarian', 'Vegan'],
  soda: ['Gluten Free', 'Dairy Free', 'Nut Free', 'Vegetarian', 'Vegan'],
  lemonade: ['Gluten Free', 'Dairy Free', 'Nut Free', 'Vegetarian', 'Vegan'],
  water: ['Gluten Free', 'Dairy Free', 'Nut Free', 'Vegetarian', 'Vegan'],
  coffee: ['Gluten Free', 'Dairy Free', 'Nut Free', 'Vegetarian'],
}

export function dietFor(id: string): string[] {
  return DIET[id] ?? []
}

// ── Per-vendor menus ─────────────────────────────────────────
// Items whose flavor/sauce choice is the vendor's to riff on. (Structural
// choices like size, temperature, or crust stay the same everywhere.)
const FLAVOR_CUSTOMIZABLE = new Set(['wings', 'hotdog', 'beer', 'marg', 'soda', 'lemonade', 'coffee'])

// Deterministic vendor-specific subset of the base choices, stable per item+vendor.
function pickSubset<T>(arr: T[], k: number, seed: string): T[] {
  return arr
    .map((c, i) => ({ c, r: hashStr(seed + ':' + i) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, Math.min(k, arr.length))
    .map((x) => x.c)
}

/** The option group as offered by a specific vendor — flavors differ per restaurant. */
export function optionsFor(item: MenuItem, vendorId: string): OptionGroup | null {
  if (!item.options) return null
  if (!FLAVOR_CUSTOMIZABLE.has(item.id)) return item.options
  const v = VENDOR_BY_ID[vendorId]
  const picked = pickSubset(item.options.choices, 3, item.id + '@' + vendorId)
  const sig = v?.signature ? [{ name: v.signature, d: 0.5 }] : []
  return { label: item.options.label, required: true, choices: [...sig, ...picked] }
}

/** The add-ons as offered by a specific vendor — each restaurant has its own extras. */
export function extrasFor(item: MenuItem, vendorId: string): Addon[] {
  if (ITEM_CAT[item.id] === 'merch') return item.addons
  const v = VENDOR_BY_ID[vendorId]
  return v?.extras ?? item.addons
}

// Fastest delivery time across the restaurants that serve this item — drives
// both the "Under 5 min" filter and the "Quickest to me" sort.
export function fastestEta(item: MenuItem): number {
  return vendorsFor(item)[0].etaMin
}
