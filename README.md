# RowRunner — Fan Ordering App

> Skip the Line, Not the Game.

QR-based in-seat food, beverage, and merchandise ordering for live event venues.
This repo is the **fan-facing ordering flow** — the eight screens a fan sees from
QR scan to "your order has arrived" — implemented from the
[Claude Design](https://claude.ai/design) handoff. The demo is themed for
**NYC Tech Week** (The Glasshouse · Demo Day).

| | |
|---|---|
| **Brand** | Navy `#072E48` · Ice Blue `#5BB8D4` / `#87CEEB` |
| **Site** | rowrunner.app |
| **Stack here** | React 18 + TypeScript + Vite |
| **Backend (separate)** | Node/Express edge server + Supabase (Realtime) |
| **Hardware (separate)** | Brother QL label printer · Amazon Fire tablet (KDS) |

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle in dist/
npm run preview    # preview the production build
```

Requires **Node.js 18+**. (A hand-built single-file `standalone.html` existed
while Node wasn't installed; it's been retired now that the app builds with
Vite. `public/standalone.html` is just a redirect that keeps old links working.)

---

## What's implemented — the 8 screens

1. **Landing** — seat confirmation after the QR scan
2. **Menu** — Food / Drinks / Merch tabs, search, multi-select **dietary filter sheet**, quick-add; back to home
3. **Item detail** — **"Where to order from": every restaurant in the venue that serves the item, each with its own ETA** (required pick), then options, add-ons, quantity
4. **Cart** — line items (with chosen restaurant), swipe-to-remove, live fee math (service 10.5% + $2 delivery + 7% tax)
5. **Checkout** — collapsible summary, tip pills + custom, Apple/Google Pay + card
6. **Order confirmed** — ETA + status tracker
7. **Live tracking** — counting-down ETA, runner card, animated progress
8. **Delivery complete** — confetti + runner rating, **Order Again / Exit** (Exit returns home)

Every screen with a header has a **back** control so a fan can undo a wrong tap.
Vendors-per-item, their ETAs, and dietary tags live in `src/data/menu.ts`
(`vendorsFor`, `dietFor`) — deterministic stand-ins for the Supabase data.

The order lifecycle (received → preparing → picked up → on the way → delivered)
runs on a local **simulated engine** so the whole flow is clickable with no
backend. In production that engine is replaced by Supabase Realtime — see below.

## Project structure

```
src/
  main.tsx            app entry
  App.tsx             router shell + toast
  index.css           design tokens (navy/ice palette) + keyframes
  types.ts            domain types (MenuItem, CartLine, Totals, …)
  data/menu.ts        venue, seat, menu, tints  (← swap for a Supabase fetch)
  store/store.tsx     cart, totals, nav, and the simulated order engine
  lib/orders.ts       backend integration seam (typed, documented, not yet wired)
  components/         Icon, ui kit (CTA, header, stepper, tile, tag, confetti), StatusTracker
  screens/            Landing, Menu, ItemDetail, Cart, Checkout, Confirm, Track, Done
public/assets/        logo lockups + bird marks (navy / white)
```

## Connecting the backend

`src/lib/orders.ts` is the single seam. It defines the `OrderPayload` /
`OrderRecord` contract and stubs `submitOrder()` + `subscribeToOrder()` with the
intended Express-edge + Supabase-Realtime shape. To go live:

1. `npm install @supabase/supabase-js`, fill `.env` from `.env.example`.
2. Implement `submitOrder()` to POST to the in-venue Express server (which owns
   the Brother QL printer + kitchen queue) and mirror to Supabase.
3. Replace the simulated engine in `store.tsx`'s `useEffect` with
   `subscribeToOrder()` so `orderStage` / `etaSec` come from Realtime.
4. Replace `data/menu.ts` with a per-venue Supabase fetch (`VITE_VENUE_ID`).

The screens never touch data sources directly, so none of them change.

## Notes / decisions

- **Dropped from the design prototype:** the demo-only iPhone frame and the
  designer "Tweaks" panel. Fans run this full-screen on their own phones; the
  app is mobile-first and centers as a phone-width card on desktop.
- **Imagery** is emoji-on-tinted-tiles (DoorDash-style), matching the design —
  no photography pipeline needed for the MVP.
- **Not in this repo** (design covered the fan flow only): the React KDS
  kitchen display, the Express edge server, label printing, and the 21+ ID-check
  / payment-success states. Natural next steps.
