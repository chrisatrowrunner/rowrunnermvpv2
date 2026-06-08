// store.tsx — RowRunner app state: routing, cart, and the live order engine.
//
// Ported from the design prototype's app root. Kept as a single context so the
// screen components read a small `useStore()` surface instead of prop-drilling.
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { vendorsFor, locForVendor, SEAT } from '../data/menu'
import { submitOrder } from '../lib/orders'
import type {
  CartLine,
  Category,
  DemoSpeed,
  MenuItem,
  Screen,
  Totals,
} from '../types'

/** How long (seconds) the simulated delivery takes, by pace. */
const SPEEDS: Record<DemoSpeed, number> = { Chill: 26, Normal: 15, Fast: 7 }

/**
 * Behavior toggles. In the design tool these were a live "Tweaks" panel; in
 * production they're configuration. `demoSpeed` drives the simulated order
 * engine and would be replaced by real Supabase Realtime status events.
 */
const CONFIG = {
  confetti: true,
  demoSpeed: 'Normal' as DemoSpeed,
}

/** Input to {@link Store.addToCart} — a configured item before it gets a uid. */
export interface NewLine {
  item: MenuItem
  qty: number
  vendor: string
  etaMin: number
  option: string | null
  addons: string[]
  lineTotal: number
}

/** A stand involved in the order: its slowest item ETA and how many items it owns. */
export interface Stand {
  vendor: string
  etaMin: number
  items: number
}

export interface Store {
  // routing
  screen: Screen
  currentItem: MenuItem | null
  nav: (s: Screen) => void
  back: () => void
  openItem: (item: MenuItem) => void
  // menu
  category: Category
  setCategory: (c: Category) => void
  // cart
  cart: CartLine[]
  addToCart: (line: NewLine) => void
  quickAdd: (item: MenuItem) => void
  setQty: (uid: number, qty: number) => void
  removeLine: (uid: number) => void
  totals: () => Totals
  /** the order grouped by stand, fastest-first */
  stands: () => Stand[]
  // order lifecycle
  orderNo: number
  orderStage: number
  etaSec: number
  placeOrder: () => void
  reset: () => void
  exit: () => void
  // chrome
  tweaks: typeof CONFIG
  toast: (msg: string) => void
  toastMsg: string | null
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('landing')
  const [category, setCategory] = useState<Category>('food')
  const [cart, setCart] = useState<CartLine[]>([])
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null)
  const [orderNo] = useState(4821)
  const [stage, setStage] = useState(0)
  const [eta, setEta] = useState(0)
  const [active, setActive] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const hist = useRef<Screen[]>([])
  const screenRef = useRef(screen)
  screenRef.current = screen
  const startRef = useRef(0)
  const etaStartRef = useRef(480) // initial ETA (s), derived from the order's stands
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── nav ──
  const go = (s: Screen) => {
    hist.current.push(screenRef.current)
    setScreen(s)
  }
  const back = () => setScreen(hist.current.length ? hist.current.pop()! : 'menu')
  const openItem = (item: MenuItem) => {
    setCurrentItem(item)
    go('item')
  }
  const toast = (msg: string) => {
    setToastMsg(msg)
    if (toastT.current) clearTimeout(toastT.current)
    toastT.current = setTimeout(() => setToastMsg(null), 1900)
  }

  // ── live order engine ──
  // Simulates the kitchen → runner → delivered progression. In production this
  // effect is replaced by a Supabase Realtime subscription on the order row.
  useEffect(() => {
    if (!active) return
    const dur = SPEEDS[CONFIG.demoSpeed]
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - startRef.current) / 1000 / dur)
      setEta(Math.round(etaStartRef.current * (1 - p)))
      setStage(Math.min(4, 1 + Math.floor(p * 3 + 1e-9)))
      if (p >= 1) {
        clearInterval(id)
        setActive(false)
        setStage(4)
        setEta(0)
        if (screenRef.current === 'track' || screenRef.current === 'confirm') {
          setTimeout(() => go('done'), 1100)
        }
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // ── cart ──
  const addToCart = (line: NewLine) =>
    setCart((c) => {
      // same item + same vendor + same config merges into one line
      const sig =
        line.item.id + '|' + line.vendor + '|' + (line.option || '') + '|' + line.addons.join(',')
      const i = c.findIndex((l) => l.sig === sig)
      if (i >= 0) {
        const n = [...c]
        const unit = n[i].lineTotal / n[i].qty
        const q = n[i].qty + line.qty
        n[i] = { ...n[i], qty: q, lineTotal: unit * q }
        return n
      }
      return [...c, { ...line, uid: Date.now() + Math.random(), sig }]
    })

  const quickAdd = (item: MenuItem) => {
    const d = item.options ? item.options.choices[0].d : 0
    const fastest = vendorsFor(item)[0] // fastest restaurant by default
    addToCart({
      item,
      qty: 1,
      vendor: fastest ? fastest.name : '',
      etaMin: fastest ? fastest.etaMin : 0,
      option: item.options ? item.options.choices[0].name : null,
      addons: [],
      lineTotal: item.price + d,
    })
  }

  const setQty = (uid: number, q: number) =>
    setCart((c) =>
      c.map((l) =>
        l.uid === uid ? { ...l, qty: q, lineTotal: (l.lineTotal / l.qty) * q } : l,
      ),
    )

  const removeLine = (uid: number) =>
    setCart((c) => c.filter((l) => l.uid !== uid))

  const totals = (): Totals => {
    const subtotal = cart.reduce((s, l) => s + l.lineTotal, 0)
    const service = subtotal * 0.105
    const delivery = subtotal > 0 ? 2.0 : 0
    const tax = subtotal * 0.07
    return { subtotal, service, delivery, tax, total: subtotal + service + delivery + tax }
  }

  // Group the order by stand; each stand's ETA is its slowest item.
  const stands = (): Stand[] => {
    const map = new Map<string, Stand>()
    for (const l of cart) {
      const cur = map.get(l.vendor)
      if (cur) {
        cur.etaMin = Math.max(cur.etaMin, l.etaMin)
        cur.items += l.qty
      } else {
        map.set(l.vendor, { vendor: l.vendor, etaMin: l.etaMin, items: l.qty })
      }
    }
    return [...map.values()].sort((a, b) => a.etaMin - b.etaMin)
  }

  const placeOrder = () => {
    // The order is delivered when the slowest stand arrives.
    const slowest = cart.reduce((m, l) => Math.max(m, l.etaMin), 0)
    etaStartRef.current = Math.max(60, slowest * 60)
    startRef.current = Date.now()
    setStage(1)
    setEta(etaStartRef.current)
    setActive(true)

    // Send the order to the shared edge server so the runner app picks it up.
    // The runner picks up from the order's slowest (primary) stand.
    const grouped = stands()
    const primary = grouped[grouped.length - 1]
    submitOrder({
      venueId: import.meta.env.VITE_VENUE_ID || 'nyc-tech-week',
      seat: SEAT,
      stand: primary
        ? { name: primary.vendor, loc: locForVendor(primary.vendor) }
        : { name: 'Concession', loc: '' },
      lines: cart.map((l) => ({
        name: l.item.name,
        qty: l.qty,
        option: l.option,
        addons: l.addons,
      })),
    }).catch(() => toast('Saved locally — runner sync offline'))

    go('confirm')
  }

  // "Order again" — clear the order, go back to browsing.
  const reset = () => {
    setCart([])
    setStage(0)
    setEta(0)
    setActive(false)
    hist.current = []
    setScreen('menu')
  }

  // "Exit" — leave the ordering flow entirely, back to the home screen.
  const exit = () => {
    setCart([])
    setStage(0)
    setEta(0)
    setActive(false)
    hist.current = []
    setScreen('landing')
  }

  const value: Store = {
    screen,
    currentItem,
    nav: go,
    back,
    openItem,
    category,
    setCategory,
    cart,
    addToCart,
    quickAdd,
    setQty,
    removeLine,
    totals,
    stands,
    orderNo,
    orderStage: stage,
    etaSec: eta,
    placeOrder,
    reset,
    exit,
    tweaks: CONFIG,
    toast,
    toastMsg,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}
