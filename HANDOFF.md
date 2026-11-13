# RowRunner — Project Handoff

_Last updated 2026-11-13. Written for a fresh Claude session with no prior context.
Everything here was checked against the code, git history, GitHub and the live
Supabase database on that date — not just recalled._

---

## 1. Project summary

**RowRunner** ("Skip the Line, Not the Game") is QR-based in-seat food ordering
for live events. A fan scans a QR code at their seat, orders from a phone, pays,
and a runner brings the food to them. Site: **rowrunner.app**.

It's an early-stage startup run by a solo founder who is product-driven:
they describe outcomes, send screenshots/photos, and expect working,
deployed results.

**Current status — live pilot.** The system is set up for one real event:
**URI vs. La Salle men's soccer at the URI Soccer Complex**, with one food
truck, **Pam's Grill** (“Pam's Grill On-The-Go”). Real payments are live
(Stripe live mode). The flow works end to end:

> fan orders + pays → Kitchen Display (KDS) confirms → KDS marks ready → label
> prints → runner claims → runner delivers (verified by a 6-digit code)

The system is **five apps on one Supabase project**. Four of them (fan, runner,
KDS, printer) share the `orders` table; the marketing site only uses the
separate `waitlist_signups` table:

| App | Folder (this Mac) | GitHub repo | Live at |
|---|---|---|---|
| Fan ordering web app | `~/rowrunner` (this repo) | `chrisatrowrunner/rowrunnermvpv2` | `rowrunner.netlify.app` |
| Runner dispatch app | `~/rowrunner-runner` | `chrisatrowrunner/rowrunner-runner` | `rowrunner-runner.netlify.app` |
| Kitchen Display (KDS) | `~/rowrunner-kds` | `chrisatrowrunner/rowrunner-kds` | `rowrunnerkds.netlify.app` |
| Label print worker | `~/rowrunner-print` | `chrisatrowrunner/rowrunner-print` | runs on a PC next to the printer |
| Marketing site | `~/rowrunner-site` | `chrisatrowrunner/rowrunner-site` | **rowrunner.app** |

Also on this Mac but **not in git** (see §8): `~/rowrunner-edge` (retired edge
server) and `~/rowrunner-outreach` (cold-email tool, has a live `.env`).

---

## 2. Tech stack and architecture

**Frontends (fan, runner, KDS):** React 18 + TypeScript + Vite 5. No UI
library — all styling is **inline `style={{}}`** objects plus CSS custom
properties in `src/index.css`. Brand: navy `#072E48`, ice blue `#5BB8D4`
(deep `#3AA3C2`), font **Plus Jakarta Sans**. Icons are a hand-rolled SVG set
in `src/components/Icon.tsx`. Food "photos" are emoji on tinted tiles.

**Backend: Supabase** (project name `rowrunnermvpv2`, ref `kboevpucqjoftgmhrkzq`).
- One shared table, `public.orders`. Key columns: `id` (client-generated uuid),
  `order_no`, `venue_id`, `event_id`, `customer_name`, `code` (6-digit handoff
  code — **hidden from the API by column-level grants**), `notes`,
  `payment_ref`, `seat` (jsonb), `stand` (jsonb), `lines` (jsonb), `stage`,
  `placed_at`, `confirmed_at`, `ready_at`, `printed_at`, `runner_id`, `runner_name`.
- Order lifecycle `stage`: `0 received · 1 preparing · 2 picked up · 3 on the
  way · 4 delivered`. The fan tracker hides step 3 (pickup implies it).
- RPCs (security definer): `order_status(uuid)` (fan polls its own order),
  `deliver_order(uuid, code)` (runner delivers only with the right code),
  `mark_printed(uuid)` / `mark_unprinted(uuid)` (print worker exactly-once claim).
- `public.menu_prices` — **the server-side price list the payment function
  charges from** (generated from the fan app's menu, see §5).
- `public.waitlist_signups` — marketing-site waitlist (anon insert-only).
- Realtime: runner and KDS subscribe to `orders` changes and refetch.
- Staff (runners, kitchen) use Supabase Auth email/password.

**Payments: Stripe (LIVE mode).** Fan app uses Stripe Express Checkout
(Apple Pay / Google Pay) + Payment Element (card) in the *deferred-intent*
flow. A **Netlify Function** (`netlify/functions/create-payment-intent.mjs`)
re-prices the order from `menu_prices` (the client can't set the amount),
adds fees (service 10.5%, $2 delivery, 7% tax) + tip, and creates the
PaymentIntent. If a vendor connected account id is configured, it uses a
**Stripe Connect destination charge**: the food subtotal goes to Pam's Grill,
RowRunner keeps fees+tip as `application_fee_amount`. The order is written to
Supabase **only after payment succeeds**, with the PaymentIntent id in `payment_ref`.

**Hosting: Netlify** — each web app is its own Netlify site, auto-deploying
from `main` on every push. **Every deploy costs Netlify credits** (see §8/§10).

**Print worker:** Python 3.9 (`brother_ql` + Pillow + requests) polling
Supabase with the public anon key, printing a 62mm label on a
**Brother QL-820NWB** (black+red roll). Auto-starts via launchd (Mac) or Task
Scheduler (Windows).

**Marketing site:** plain static HTML/JS (no build), Supabase for the waitlist,
a Netlify Function that emails via **Resend**. DNS for rowrunner.app is at
**Cloudflare**; email is **Google Workspace**.

**How the pieces connect**

```
Fan phone ──(Stripe pay)──▶ Netlify fn create-payment-intent ──reads──▶ menu_prices
    │ after payment succeeds
    └──insert──▶ Supabase orders ◀──realtime/select── KDS (Confirm → Mark ready)
                     │   ▲                             Runner (claim → deliver w/ code)
                     │   └─── order_status RPC (fan tracker polls every 3s)
                     └──poll── print worker ──▶ Brother QL label
```

**Scoping:** the `orders` table holds every event ever, so every reader filters:
runner + KDS by `venue_id = VITE_VENUE_ID` (server-side); KDS also by
`event_id = VITE_EVENT_ID`; the runner app picks an event after login and filters
by it client-side; the print worker by `VENUE_ID`.

---

## 3. How to run it

**Node is NOT on the default PATH on this Mac.** Prefix commands with:

```bash
export PATH="$HOME/.local/node-v24.16.0-darwin-arm64/bin:$PATH"
```

**Fan / runner / KDS** (same commands in each folder):

```bash
npm install
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build  (this is what Netlify runs)
npm run typecheck    # fan app
npm run menu:sql     # FAN ONLY: print menu_prices SQL from src/data/menu.ts
```

There are no automated tests. Verification = `npm run build` + clicking
through in a browser.

**Offline mode (use this to test without touching the live DB):** each app has a
gitignored `.env.offline.local` that blanks the Supabase vars (runner/KDS add
`VITE_USE_MOCK=1` → in-memory mock orders; demo login accepts any email +
password). Run `vite --mode offline`. Preview configs `fan-offline` (5177),
`runner-offline` (5178), `kds-offline` (5179) exist in `~/.claude/launch.json`;
`fan-dev` (5173), `runner-dev` (5174), `kds-dev` (5175) use the LIVE DB.

**Print worker** (`~/rowrunner-print`, has a `.venv`):

```bash
.venv/bin/python worker.py --demo        # render a sample label PNG to out/ (no DB, no printer)
.venv/bin/python worker.py --selftest    # render newest real ready order (no claim, no print)
.venv/bin/python worker.py --test-print  # send the demo label to the printer (no DB)
.venv/bin/python worker.py --once        # one real poll cycle
.venv/bin/python worker.py               # run the loop
```
Run it **without** `python -I` (isolated mode hides `config.py`).

**Deploy:** push to `main` → Netlify auto-builds that site. **Ask the founder
before pushing** (credits). For docs-only commits put `[skip netlify]` in the
commit message so no build runs.

**Env var names (values live in local `.env` files / Netlify UI — never commit):**

| Where | Names |
|---|---|
| Fan build (`netlify.toml` `[build.environment]`, public values) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VENUE_ID`, `VITE_EVENT_ID`, `VITE_STRIPE_PUBLISHABLE_KEY`, `SECRETS_SCAN_OMIT_KEYS`; optional `VITE_EDGE_URL` |
| Fan Netlify **Functions** env (Netlify UI, Secret, Functions scope only) | `SECRET_KEY` (Stripe secret; `STRIPE_SECRET_KEY` also accepted), `PAMS_GRILL_ACCOUNT` (or `VENDOR_ACCOUNT`, Stripe Connect account id); optional `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| Runner build | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VENUE_ID`; dev: `VITE_USE_MOCK`, `VITE_EDGE_URL` |
| KDS build | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VENUE_ID`, `VITE_EVENT_ID`; dev: `VITE_USE_MOCK` |
| Print worker `.env` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DRY_RUN`, `PRINTER_MODEL`, `PRINTER_BACKEND`, `PRINTER_IDENTIFIER`, `LABEL_SIZE`, `LABEL_RED`, `LABEL_LOGO`, `PRINT_TRIGGER`, `MAX_PRINT_STAGE`, `VENUE_ID`, `POLL_SECONDS`, `OUT_DIR`, `FONT_BOLD`, `FONT_REGULAR` |
| Marketing site (Netlify UI) | `RESEND_API_KEY` |
| Outreach tool `.env` | `RESEND_API_KEY`, `SENDER_EMAIL` |

The Supabase **anon key and Stripe publishable key are public by design** (they
ship in the browser) and are committed in `netlify.toml`. The Stripe **secret**
key and Resend key must never be committed.

---

## 4. Key files and directories (fan app — this repo)

| Path | What it is |
|---|---|
| `src/data/menu.ts` | **Venue, zones, restaurant, menu, dietary tags.** The one file to edit per event. `VENUE`, `ZONES` (map areas), `RESTAURANT` (Pam's Grill), `SECTIONS`, `MENU` (26 items), `DIET`. |
| `src/screens/` | Landing → `ZonePicker` (venue map) → `Menu` → `ItemDetail` → `Cart` → `Checkout` → `Confirm` → `Track` → `Done` |
| `src/screens/ZonePicker.tsx` | Interactive SVG map of the URI Soccer Complex. **Only the 8 zones are tappable** (bleachers A0–A4, standing B/C/D). |
| `src/store/store.tsx` | All app state: routing, cart, picked zone, `placeOrder`, status polling, resume-after-refresh (localStorage `rr.fan.activeOrder`). |
| `src/lib/orders.ts` | `submitOrder` (Supabase insert, else edge fallback), `fetchOrderStatus` (RPC). |
| `src/lib/payments.ts`, `src/components/StripeCheckout.tsx` | Stripe client side. |
| `src/lib/seat.ts` | **Shared seat formatter — copied verbatim into runner + KDS** (and mirrored in the printer's `label.py:_seat_str`). Keep all four in sync. |
| `netlify/functions/create-payment-intent.mjs` | Server-side pricing + PaymentIntent + Connect split + payment metadata. |
| `scripts/menu-sql.mjs` | Generates `supabase/menu-prices.sql` from `menu.ts` (`npm run menu:sql`). |
| `supabase/menu-prices.sql` | **Generated** — run in Supabase SQL Editor after menu changes. |
| `netlify.toml` | Build command, functions dir, public build env, SPA redirect. |
| `.githooks/pre-commit` | Blocks Stripe secret keys (`sk_…`) from being committed. Enable with `git config core.hooksPath .githooks` on a fresh clone. |
| `public/assets/` | Logos (`logo-lockup-*.png`, `pams-grill-logo.jpg` 256px/37KB). |
| `public/standalone.html` | Just a redirect to `/` (old single-file demo, retired). |

Other repos: runner `src/data/events.ts` (games a runner can pick),
`src/lib/orders.ts` (queries + claim/deliver), `supabase/*.sql` (**the
canonical schema + RLS lives here**: `schema.sql`, `harden-rls.sql`,
`identity-and-code.sql`, `add-name-code-notes.sql`, `order-status-rpc.sql`,
`event-id.sql`). KDS `supabase/kds-columns.sql`. Print `supabase/print-rpcs.sql`,
`deploy/install-macos.sh`, `deploy/install-windows.md`. Site
`supabase/waitlist-schema.sql`, `netlify/functions/notify.js`.

---

## 5. Decisions made and why (incl. rejected approaches)

- **Built from a Claude Design handoff**, ported from a CDN/Babel single-file
  prototype into Vite + TS. The single-file `standalone.html` was **retired**
  once Node was installed (two codebases drifted).
- **Supabase shared `orders` table** replaced the original in-venue Express
  "edge server" (`~/rowrunner-edge`, kept only as a fallback; apps still fall
  back to it when Supabase env vars are unset).
- **Zone seating instead of seat numbers** — the URI bleachers aren't numbered,
  so fans tap an area on a map. The `seat` jsonb keeps `{section,row,seat}` and
  adds `zone`, `label` ("Section A2"), `detail` ("South bleachers"); every
  reader shows label/detail when present, else Sec/Row/Seat. **No DB migration
  needed, old orders still render.**
- **Map is a redrawn SVG, not the founder's PNG** — at phone width the PNG's
  side zones were ~13px wide (untappable). SVG keeps the layout with thumb-size
  zones and makes nothing but the zones clickable. (Offered to swap in the
  literal image if wanted.)
- **Single restaurant, real menu, nothing invented** — the menu is Pam's actual
  sheet (26 items, sheet prices). The sheet lists no options/add-ons, so none
  were added (only a drink choice). Descriptions were written by us (sheet has none).
- **Server-side pricing ("Option A")** — the payment function never trusts the
  client total; it re-prices from `menu_prices`. The SQL is *generated* from
  `menu.ts` so prices can't drift. Rejected: client-computed totals.
- **Order is inserted only after payment succeeds.**
- **Venue + event scoping** added after stale NYC Tech Week orders showed up in
  the URI runner queue (one table, many events).
- **Old version preserved** — before the URI pivot, the multi-vendor NYC Tech
  Week fan app was saved on branch **`nyc-tech-week`** + tag
  **`nyc-tech-week-v1`**; runner/KDS/print have tag **`pre-uri-soccer`**.
  The founder explicitly wants old event versions retrievable.
- **Print worker uses only the public anon key** + security-definer RPCs —
  deliberately no `service_role` key on a venue PC. Default
  `PRINT_TRIGGER=placed` (label prints the moment the fan pays, like a kitchen
  ticket); `ready` prints on KDS "Mark ready" instead.
- **Runner + KDS have no service worker** (a stale SW served old builds; it was
  removed).
- **Rejected for sharing demos:** localhost.run / Cloudflare quick tunnels
  (kept dropping, URLs changed). Use Netlify.
- **Old orders:** founder chose to **delete** (not close) the 9 stale NYC orders
  — SQL not run yet (see §7).

---

## 6. Current state

**Done and working**
- Full fan flow for URI vs. La Salle: landing → zone map → Pam's Grill menu
  (26 items, 7 sections, real logo) → cart → Stripe checkout → tracking → done.
- Live Stripe payments (card + Apple Pay verified by founder), server-side
  pricing, Connect destination-charge split (active only if the vendor account
  env var is set in Netlify — confirm it is).
- Runner app: login → pick event → queue (only kitchen-ready orders) → claim →
  deliver with 6-digit code → history.
- KDS: New → Confirm → Preparing → Mark ready, scoped to venue + event.
- Print worker: hardware-verified on the founder's home network, zone labels,
  venue filter.
- Marketing site live at rowrunner.app (waitlist + demo/contact forms).
- All Supabase migrations applied (verified 2026-11-13: `event_id`,
  `payment_ref`, KDS columns, `mark_printed` RPC, `menu_prices` with 26 rows
  matching the app exactly; `code` hidden; waitlist not publicly readable).

**In progress / unverified**
- **Fan app deploy of `5afda42`** (real 26-item menu + removal of a debug
  readout) was pushed 2026-10-30 but **was not live** at last check — the live
  bundle matched the earlier logo commit. Likely cause: Netlify build credits
  exhausted / builds paused. Supabase prices are already updated, so checkout is
  correct either way. **Check Netlify ▸ rowrunner ▸ Deploys.**
- **Google Pay never appears** (tested on Android/Samsung). Investigation was
  interrupted. Apple Pay works.
- **Print worker on the venue machine** needs `git pull` + restart to get zone
  labels and the venue filter; unknown whether that was done. Its startup log
  should show `venue: uri-mens-soccer`.

**Broken / half-finished / stale**
- 9 undelivered NYC Tech Week orders still in `orders` (hidden by filters).
- 4 open orders for `uri-mens-soccer` (2 without `event_id`, placed before the
  event column existed) — likely tests; check before the game.
- Runner `src/data/events.ts` header comment is stale (says orders aren't tagged
  with an event id — they are now).
- Fan README's "What's implemented — the 8 screens" section predates the zone
  map and real menu; the GitHub repo description still says "NYC Tech Week web demo".
- Dietary tags are conservative placeholders (see §8).
- Separate older React Native/Expo app `chrisatrowrunner/RowRunner` has open
  security PRs **#2, #3, #4 (#4 draft)** from an audit — not part of the live pilot.

---

## 7. Next steps (prioritized)

1. **Get the fan menu deploy live.** Netlify ▸ site `rowrunner` ▸ Deploys. If
   "credit limit"/paused: founder decides (wait for reset, add credits, or move
   the fan site to Cloudflare Pages — no build credits). If failed: read the
   log; `npm run build` passes locally with Netlify's env. Don't push extra
   commits to "retry" (each costs credits) — use Netlify's "Retry deploy".
2. **Pre-game checks with Pam (founder):** confirm Hot Wieners price (read as
   $5.00 from handwriting), dietary tags, and any add-ons she offers. Menu edits:
   `src/data/menu.ts` → `npm run menu:sql > supabase/menu-prices.sql` → founder
   runs that SQL in Supabase **first** → then deploy. An item missing from
   `menu_prices` fails at checkout with "Unknown item".
3. **Confirm the Stripe vendor split is configured:** Netlify fan site ▸
   Functions env has `PAMS_GRILL_ACCOUNT` set to Pam's connected account id.
   Without it, all money lands in RowRunner's account.
4. **Print worker at the venue:** on the venue PC, `git pull` in
   `rowrunner-print`, restart the service, check the log shows
   `venue: uri-mens-soccer`. Printer must be on a network **with internet**
   (wired works only with the printer's WLAN off; Wireless Direct has no internet).
5. **Google Pay:** check Stripe Dashboard (LIVE mode) ▸ Settings ▸ Payment
   methods ▸ Google Pay is **on**; Payment method domains includes the exact
   domain the fan app is served from (`rowrunner.netlify.app` and/or any custom
   domain); test in **Chrome on Android with a card saved in Google Wallet**
   (Samsung Internet may not offer it). Optionally set the Express Checkout
   `paymentMethods: { googlePay: 'always' }` option to force the button.
6. **Delete the stale NYC orders** (founder runs in Supabase SQL Editor; permanent):
   `delete from public.orders where venue_id = 'nyc-tech-week' and stage < 4 returning order_no;`
   (expect 9 rows, #4845–#4853). Also review the 4 open URI test orders.
7. **Security hardening before scaling** (see §8): stop anonymous reads of
   `orders`.
8. Tidy-ups: fix the stale comment in runner `events.ts`, refresh the fan
   README and repo description, decide what to do with RowRunner PRs #2–#4.
9. **Back up `~/rowrunner-outreach`** into a private git repo (never commit its `.env`).

**Switching to the next event** (checklist): new branch/tag for the current
event first; then update `VITE_VENUE_ID` in fan/runner/KDS `netlify.toml`,
`VITE_EVENT_ID` in fan + KDS, the runner's `src/data/events.ts`, the print
worker's `VENUE_ID`, and the fan's `src/data/menu.ts` (venue, zones/map,
restaurant, menu) + regenerate/run `menu_prices` SQL. Batch into one push per repo.

---

## 8. Known issues, gotchas, and security notes

- **Netlify credits are limited.** Every push to `main` of a Netlify-connected
  repo triggers a paid build. Batch changes, ask before pushing, use
  `[skip netlify]` for docs-only commits, and **never poll live sites** to check
  deploys (bandwidth). Verify locally (build + offline previews) or via the
  Supabase REST API instead.
- **Migrate before deploy.** Apps select explicit column lists; deploying code
  that reads a column before its SQL runs → PostgREST 400 → live app breaks.
  Claude cannot run SQL — hand the founder idempotent SQL for the SQL Editor.
- **Column-level grants:** `code` is never granted; new columns need
  `grant select (col) on public.orders to anon, authenticated;` (additive).
- **SECURITY: `orders` is readable with the public anon key** (customer names,
  seats, notes, items). The RLS was loosened for the print worker. Before
  scaling, restrict SELECT to authenticated staff and give the worker a staff
  login or a security-definer RPC. `code` is correctly hidden.
- **Stripe secret key:** only in Netlify UI, value box, Secret on, **Functions
  scope only**. It once leaked by being pasted into the variable *name* field.
  Netlify's secrets scanner fails builds on secrets; only public keys are in
  `SECRETS_SCAN_OMIT_KEYS`. Netlify build-env (`VITE_*`) vars do NOT reach
  function runtime — the function has hardcoded public Supabase fallbacks.
- **Dietary/allergen tags are liability-sensitive.** Current tags are
  conservative placeholders (Vegetarian only where obvious; GF/DF/Vegan only on
  bottled drinks; nothing Nut Free). Confirm with Pam before claiming more.
- **Seat contract** must stay identical in 4 places: fan/runner/KDS
  `src/lib/seat.ts` (verbatim copies) + printer `label.py:_seat_str`.
- **Tooling:** Node at `~/.local/node-v24.16.0-darwin-arm64/bin` (not on PATH).
  `gh` at `~/.local/bin/gh`. macOS `sed` lacks `\s`; use Python for parsing.
  Vite reloads the page once on first visit (dependency optimization).
- **Reproducible bundles:** to tell which commit is live, build it with the
  `VITE_*` values from that commit's `netlify.toml` (not local `.env`) and
  compare the `index-*.js` hash to the live page's — one 1 KB fetch of `/`.
- **DNS (Cloudflare):** rowrunner.app also carries live email (Google Workspace
  MX/SPF, Resend DKIM). Only ever touch A/CNAME; never change nameservers or
  MX/TXT. Site records are "DNS only" (grey cloud).
- **Print hardware:** QL-820NWB wired Ethernet only gets DHCP with its WLAN
  turned off; the worker auto-discovers the printer by scanning the /24 for
  port 9100. Mac launchd service runs only while the Mac is awake + logged in.
- **Not in git:** `~/rowrunner-outreach` (live Resend key in `.env`, contact
  data, send logs) and `~/rowrunner-edge`. Losing this Mac loses them.
- **Outreach tool:** sends Mon–Thu 5–10am ET via launchd; fails if the MacBook
  lid is closed (sleep). Never guess contact emails; templates are fixed text.

---

## 9. External accounts and integrations to reconnect

- **GitHub** — account `chrisatrowrunner` (repos: `rowrunnermvpv2`,
  `rowrunner-runner`, `rowrunner-kds`, `rowrunner-print`, `rowrunner-site`,
  `RowRunner`; others are unrelated/old). `gh` CLI must be authenticated
  (`gh auth login`). Creating repos via `gh` gets blocked in auto mode — founder
  creates them; plain `git push` works.
- **Netlify** — sites `rowrunner` (fan), `rowrunner-runner`, `rowrunnerkds`,
  `rowrunnersite` (custom domain rowrunner.app). Founder's login.
- **Supabase** — project `rowrunnermvpv2` (ref `kboevpucqjoftgmhrkzq`). SQL
  Editor is how migrations are applied. Staff test accounts exist (founder has them).
- **Stripe** — live mode; Connect connected account for Pam's Grill; Apple Pay
  domain registered; Google Pay pending (§7.5).
- **Cloudflare** — DNS for rowrunner.app.
- **Google Workspace** — rowrunner.app email (founder's inbox; demo/contact
  form notifications go there).
- **Resend** — sending domain rowrunner.app (site notify function + outreach).
- **Claude Design** — source of the UI designs (fan app handoff; marketing
  redesign project).
- **Claude in Chrome extension** — used for outreach contact research.
- **Claude Code memory** — detailed notes live in
  `~/.claude/projects/-Users-cdos/memory/` on this Mac (copy them if useful).

---

## 10. Working with the founder — preferences and corrections

- **Act, don't ask** for routine work. The founder repeatedly says "do what you
  think is best" and doesn't want to approve every step. Ask only for real
  decisions, anything outward-facing/irreversible, or pushes (below).
- **Protect Netlify credits** (corrected firmly: "stop you are draining my
  netlify credits"): batch changes, **ask before pushing**, one push per repo,
  `[skip netlify]` for docs, never poll live sites.
- **Keep old versions retrievable** — when re-theming for a new event, branch +
  tag the previous version first and document how to restore it.
- **Never break the live pilot:** verify locally first (build + offline mode),
  migrations before deploys, backward-compatible changes across the shared table.
- **Don't invent business facts** — menu items, prices, allergen claims, pilot
  claims in outreach. Use only what the founder provides; flag assumptions
  (e.g., a price read from handwriting).
- **Verify before claiming done**, and say plainly what was verified and how.
- **Explain in plain language**, short and concrete; lead with what the founder
  needs to do. The founder communicates tersely, with screenshots/photos.
- **Secrets:** never put secret values in files or chat output; public keys in
  `netlify.toml` are fine.
- **Code style:** match the existing code — React function components, inline
  styles, CSS variables from `index.css`, explanatory comments at the top of
  each file, TypeScript strict. Commit messages: `feat:` / `fix:` / `chore:`
  prefix, a short summary line, then a body explaining why.
