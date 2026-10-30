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
  // 256px JPEG (37 KB) — a "PG" monogram shows if it ever fails to load.
  logo: '/assets/pams-grill-logo.jpg',
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

// Pam's Grill's real menu (from the menu sheet at the truck). Prices are the
// sheet's; the sheet lists no options/add-ons, so none are invented here —
// the only choice is which drink. Descriptions are ours (the sheet has none).
//
// PRICES ARE CHARGED FROM SUPABASE `menu_prices`, not from here. After editing
// this list, regenerate the SQL (`npm run menu:sql > supabase/menu-prices.sql`),
// run it in Supabase, THEN deploy — an item missing from menu_prices fails at
// checkout with "Unknown item".
export const SECTIONS = [
  "Pam's Specialties",
  'Burgers & Dogs',
  'Chicken',
  'Bites & Apps',
  'Sides',
  'Sweets & Snacks',
  'Drinks',
] as const

const item = (
  id: string,
  section: (typeof SECTIONS)[number],
  name: string,
  price: number,
  emoji: string,
  tint: TintKey,
  etaMin: number,
  desc: string,
  extra: Partial<MenuItem> = {},
): MenuItem => ({ id, section, name, price, emoji, tint, etaMin, desc, tag: null, options: null, addons: [], ...extra })

export const MENU: MenuItem[] = [
  // ── Pam's Specialties
  item('specialty-burger', "Pam's Specialties", "Pam's Specialty Burger", 11, '🍔', 'rose', 14,
    "Pam's signature burger, served on two glazed donuts.", { tag: "Pam's specialty" }),
  item('lobster-rangoon', "Pam's Specialties", 'Lobster Rangoon', 15, '🦞', 'peach', 10,
    'Crispy lobster rangoon, served with sweet chili sauce.'),
  item('stuffies', "Pam's Specialties", 'Homemade Stuffies', 6, '🐚', 'sky', 8,
    'Homemade Rhode Island stuffed quahogs.'),
  // ── Burgers & Dogs
  item('cheeseburger', 'Burgers & Dogs', 'Cheeseburger', 8, '🍔', 'butter', 12, 'A classic cheeseburger.'),
  item('hamburger', 'Burgers & Dogs', 'Hamburger', 7, '🍔', 'butter', 12, 'A classic hamburger.'),
  item('hot-dog', 'Burgers & Dogs', 'Hot Dog', 6, '🌭', 'rose', 6, 'A classic hot dog.'),
  item('hot-wieners', 'Burgers & Dogs', 'Hot Wieners', 5, '🌭', 'rose', 6, 'Rhode Island–style hot wieners.'),
  item('sausage-peppers-onions', 'Burgers & Dogs', 'Sausage, Peppers & Onions', 15, '🫑', 'mint', 12,
    'Sausage with grilled peppers and onions.'),
  // ── Chicken
  item('chicken-tenders', 'Chicken', 'Chicken Tenders', 9, '🍗', 'peach', 10, 'Crispy fried chicken tenders.'),
  item('chicken-wings', 'Chicken', 'Chicken Wings', 10, '🍖', 'peach', 12, 'Crispy fried chicken wings.'),
  item('buffalo-chicken-balls', 'Chicken', 'Buffalo Chicken Balls', 15, '🧆', 'rose', 10, 'Fried buffalo chicken bites.'),
  // ── Bites & Apps
  item('beef-empanadas', 'Bites & Apps', 'Beef Empanadas', 12, '🥟', 'butter', 10, 'Golden fried beef empanadas.'),
  item('mac-cheese-bites', 'Bites & Apps', 'Mac & Cheese Bites', 10, '🧀', 'butter', 9, 'Fried mac & cheese bites.'),
  item('fried-ravioli', 'Bites & Apps', 'Fried Ravioli', 13, '🍝', 'rose', 10, 'Crispy fried ravioli.'),
  item('rice-balls', 'Bites & Apps', 'Rice Balls', 12, '🍙', 'slate', 10, 'Fried rice balls.'),
  item('jalapeno-poppers', 'Bites & Apps', 'Jalapeño Poppers', 9, '🌶️', 'mint', 9, 'Fried cheese-stuffed jalapeño poppers.'),
  item('mozzarella-sticks', 'Bites & Apps', 'Mozzarella Sticks', 10, '🧀', 'butter', 9, 'Breaded, fried mozzarella sticks.'),
  item('broccoli-cheese-bites', 'Bites & Apps', 'Broccoli & Cheese Bites', 9, '🥦', 'mint', 9, 'Fried broccoli & cheese bites.'),
  item('zucchini-sticks', 'Bites & Apps', 'Zucchini Sticks', 9, '🥒', 'mint', 9, 'Breaded, fried zucchini sticks.'),
  // ── Sides
  item('fries', 'Sides', 'Fries', 6, '🍟', 'butter', 8, 'Crispy golden fries.'),
  item('potato-tots', 'Sides', 'Potato Tots', 9, '🥔', 'butter', 8, 'Crispy potato tots.'),
  item('onion-rings', 'Sides', 'Onion Rings', 9, '🧅', 'butter', 9, 'Crispy fried onion rings.'),
  // ── Sweets & Snacks
  item('doughboy', 'Sweets & Snacks', 'Large Doughboy', 10, '🍩', 'peach', 9, 'Rhode Island fried dough.'),
  item('ice-cream', 'Sweets & Snacks', 'Novelty Ice Cream', 5, '🍦', 'sky', 3, 'A frozen novelty ice cream treat.'),
  item('chips', 'Sweets & Snacks', 'Chips', 2, '🥔', 'butter', 3, 'A bag of chips.'),
  // ── Drinks
  item('drink', 'Drinks', 'Drink', 3, '🥤', 'sky', 3, 'Coke, Diet Coke, Sprite, Water, or Gatorade.', {
    options: {
      label: 'Choose your drink',
      required: true,
      choices: ['Coke', 'Diet Coke', 'Sprite', 'Water', 'Gatorade'].map((name) => ({ name, d: 0 })),
    },
  }),
]

export const ALLERGENS = ['Gluten Free', 'Nut Free', 'Dairy Free', 'Vegetarian', 'Vegan']

export const money = (n: number): string => '$' + n.toFixed(2)

/** "~7–12 min" across the menu, for the restaurant header. */
export function etaRange(): string {
  const mins = MENU.map((m) => m.etaMin)
  return `~${Math.min(...mins)}–${Math.max(...mins)} min`
}

// ── Dietary tags (drives the dietary filter) ─────────────────
// CONSERVATIVE PLACEHOLDERS — confirm with Pam's Grill. Only obvious cases are
// tagged: no-meat items as Vegetarian, and only packaged drinks as GF / dairy-
// free / vegan (fryer oil is shared with seafood and meat; batter has gluten).
// Nothing is tagged Nut Free until Pam confirms it. Rice balls and fried
// ravioli are left untagged because their fillings vary (often meat).
const VEGETARIAN = [
  'fries', 'potato-tots', 'onion-rings', 'zucchini-sticks', 'mozzarella-sticks', 'jalapeno-poppers',
  'broccoli-cheese-bites', 'mac-cheese-bites', 'doughboy', 'ice-cream', 'chips',
]
const DIET: Record<string, string[]> = {
  ...Object.fromEntries(VEGETARIAN.map((id) => [id, ['Vegetarian']])),
  drink: ['Gluten Free', 'Dairy Free', 'Vegetarian', 'Vegan'],
}

export function dietFor(id: string): string[] {
  return DIET[id] ?? []
}
