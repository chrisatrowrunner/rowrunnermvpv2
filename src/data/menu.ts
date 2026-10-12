// Venue + menu data for the URI men's soccer pilot (URI vs. La Salle).
//
// One food truck (Pam's Grill), zone-based seating (the bleachers and standing
// areas aren't numbered). The multi-vendor NYC Tech Week version lives on the
// `nyc-tech-week` git branch.
//
// In production this would be fetched from Supabase (per-venue menu tables).
// The shape mirrors a denormalized API response so swapping the source is a
// one-file change.
import type { MenuItem, Restaurant, Seat, TintKey, Venue, Zone } from '../types'

export const VENUE: Venue = {
  name: 'URI vs. La Salle',
  event: "Men's Soccer · URI Soccer Complex",
  date: '',
}

// ── Zones on the URI Soccer Complex map ─────────────────────
// Zone A is the south bleachers (split into A0–A4); B/C/D are standing areas.
export const ZONES: Zone[] = [
  { id: 'A0', label: 'Section A0', detail: 'South bleachers', kind: 'bleacher' },
  { id: 'A1', label: 'Section A1', detail: 'South bleachers', kind: 'bleacher' },
  { id: 'A2', label: 'Section A2', detail: 'South bleachers', kind: 'bleacher' },
  { id: 'A3', label: 'Section A3', detail: 'South bleachers', kind: 'bleacher' },
  { id: 'A4', label: 'Section A4', detail: 'South bleachers', kind: 'bleacher' },
  { id: 'B', label: 'Zone B', detail: 'North sideline', kind: 'standing' },
  { id: 'C', label: 'Zone C', detail: 'East end', kind: 'standing' },
  { id: 'D', label: 'Zone D', detail: 'West end', kind: 'standing' },
]

export const zoneById = (id: string | null): Zone | null => ZONES.find((z) => z.id === id) ?? null

/** The delivery destination written to `orders.seat` for a picked zone. */
export function seatForZone(z: Zone): Seat {
  return { section: z.id, row: '', seat: '', zone: z.id, label: z.label, detail: z.detail }
}

// ── The one restaurant ───────────────────────────────────────
export const RESTAURANT: Restaurant = {
  id: 'pams-grill',
  name: "Pam's Grill",
  loc: 'Food truck · East gate, Tootell Rd',
  blurb: 'American grill · Food truck at the east gate',
  // Drop the real logo at public/assets/pams-grill-logo.png — a monogram shows until then.
  logo: '/assets/pams-grill-logo.png',
}

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

// Placeholder menu — generic American food-truck fare until Pam's real menu
// (items, prices, and allergen info) is confirmed.
export const MENU: MenuItem[] = [
  {
    id: 'cheeseburger', name: 'Classic Cheeseburger', emoji: '🍔', price: 10.0, etaMin: 12, tint: 'butter', tag: 'Fan favorite',
    desc: 'Griddled beef patty, American cheese, lettuce, tomato, pickles, and house sauce on a toasted bun.',
    options: { label: 'Size', required: true, choices: [{ name: 'Single', d: 0 }, { name: 'Double', d: 3.0 }] },
    addons: [{ name: 'Bacon', d: 2.0 }, { name: 'Extra Cheese', d: 1.0 }, { name: 'Grilled Onions', d: 0.5 }],
  },
  {
    id: 'veggie-burger', name: 'Black Bean Veggie Burger', emoji: '🌱', price: 10.0, etaMin: 12, tint: 'mint', tag: null,
    desc: 'House black bean patty with lettuce, tomato, red onion, and chipotle mayo on a toasted bun.',
    options: null,
    addons: [{ name: 'Add Cheese', d: 1.0 }, { name: 'Avocado', d: 1.5 }],
  },
  {
    id: 'chicken-sandwich', name: 'Crispy Chicken Sandwich', emoji: '🥪', price: 10.5, etaMin: 12, tint: 'peach', tag: null,
    desc: 'Buttermilk-fried chicken breast, pickles, and mayo on a brioche bun.',
    options: { label: 'Style', required: true, choices: [{ name: 'Classic', d: 0 }, { name: 'Spicy', d: 0 }, { name: 'Buffalo', d: 0 }] },
    addons: [{ name: 'Bacon', d: 2.0 }, { name: 'Add Cheese', d: 1.0 }],
  },
  {
    id: 'hot-dog', name: 'All-Beef Hot Dog', emoji: '🌭', price: 6.0, etaMin: 8, tint: 'rose', tag: 'Quick',
    desc: 'Grilled all-beef frank on a toasted roll. Ketchup, mustard, and relish on request.',
    options: { label: 'Style', required: true, choices: [{ name: 'Plain', d: 0 }, { name: 'Chili Dog', d: 1.5 }, { name: 'Chili Cheese Dog', d: 2.0 }] },
    addons: [{ name: 'Grilled Onions', d: 0.5 }, { name: 'Sauerkraut', d: 0.5 }],
  },
  {
    id: 'chicken-tenders', name: 'Chicken Tenders', emoji: '🍗', price: 9.5, etaMin: 10, tint: 'peach', tag: null,
    desc: 'Four golden chicken tenders with your choice of dipping sauce.',
    options: { label: 'Dipping sauce', required: true, choices: [{ name: 'Honey Mustard', d: 0 }, { name: 'BBQ', d: 0 }, { name: 'Buffalo', d: 0 }, { name: 'Ranch', d: 0 }] },
    addons: [{ name: 'Extra Sauce', d: 0.75 }, { name: 'Add Fries', d: 3.0 }],
  },
  {
    id: 'fries', name: 'French Fries', emoji: '🍟', price: 4.5, etaMin: 7, tint: 'butter', tag: 'Quick',
    desc: 'Crispy, lightly salted fries.',
    options: { label: 'Size', required: true, choices: [{ name: 'Regular', d: 0 }, { name: 'Large', d: 2.0 }] },
    addons: [{ name: 'Cheese Sauce', d: 1.5 }, { name: 'Cajun Seasoning', d: 0.5 }],
  },
  {
    id: 'onion-rings', name: 'Onion Rings', emoji: '🧅', price: 5.5, etaMin: 8, tint: 'butter', tag: null,
    desc: 'Beer-battered onion rings, fried golden.',
    options: null,
    addons: [{ name: 'Ranch', d: 0.75 }],
  },
  {
    id: 'mozzarella-sticks', name: 'Mozzarella Sticks', emoji: '🧀', price: 7.0, etaMin: 8, tint: 'butter', tag: null,
    desc: 'Six breaded mozzarella sticks with warm marinara.',
    options: null,
    addons: [{ name: 'Extra Marinara', d: 0.75 }],
  },
]

export const ALLERGENS = ['Gluten Free', 'Nut Free', 'Dairy Free', 'Vegetarian', 'Vegan']

export const money = (n: number): string => '$' + n.toFixed(2)

/** "~7–12 min" across the menu, for the restaurant header. */
export function etaRange(): string {
  const mins = MENU.map((m) => m.etaMin)
  return `~${Math.min(...mins)}–${Math.max(...mins)} min`
}

// ── Dietary tags (drives the dietary filter) ─────────────────
// PLACEHOLDERS — confirm every tag with Pam's Grill before the game. Fryer oil
// is usually shared, so nothing fried is tagged Gluten Free.
const DIET: Record<string, string[]> = {
  cheeseburger: ['Nut Free'],
  'veggie-burger': ['Nut Free', 'Vegetarian'],
  'chicken-sandwich': ['Nut Free'],
  'hot-dog': ['Nut Free'],
  'chicken-tenders': ['Nut Free'],
  fries: ['Nut Free', 'Dairy Free', 'Vegetarian', 'Vegan'],
  'onion-rings': ['Nut Free', 'Vegetarian'],
  'mozzarella-sticks': ['Nut Free', 'Vegetarian'],
}

export function dietFor(id: string): string[] {
  return DIET[id] ?? []
}
