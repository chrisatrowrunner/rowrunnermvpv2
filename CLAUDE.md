> **Start here: read [HANDOFF.md](HANDOFF.md)** — full project context, current state, next steps, and the founder's working preferences.

# RowRunner — fan ordering app (Claude instructions)

In-seat food ordering for live events. This repo is the **fan-facing web app**;
it shares one Supabase `orders` table with the runner app, KDS, and label-print
worker (sibling folders `~/rowrunner-runner`, `~/rowrunner-kds`, `~/rowrunner-print`).

## Conventions
- React 18 + TypeScript (strict) + Vite. **Inline `style={{}}` + CSS variables**
  from `src/index.css`; no UI library. Brand navy `#072E48`, ice `#5BB8D4`,
  Plus Jakarta Sans. Match surrounding code; short header comment per file.
- Per-event content (venue, map zones, restaurant, menu, dietary tags) lives in
  `src/data/menu.ts`. After menu changes: `npm run menu:sql > supabase/menu-prices.sql`,
  founder runs that SQL in Supabase **before** the app deploys.
- `src/lib/seat.ts` is copied verbatim into runner + KDS and mirrored in the
  printer's `label.py` — change all four together.
- Node is not on PATH: `export PATH="$HOME/.local/node-v24.16.0-darwin-arm64/bin:$PATH"`.
- Verify with `npm run build` and the offline preview (`vite --mode offline`,
  config `fan-offline`), which never touches the live database.

## Rules
- **Every push to `main` deploys to Netlify and costs credits.** Ask before
  pushing, batch changes, use `[skip netlify]` for docs-only commits, never
  poll the live site.
- Never commit secrets (Stripe secret key is Netlify-UI only; the pre-commit
  hook in `.githooks/` blocks `sk_` keys — `git config core.hooksPath .githooks`).
- Schema changes: write idempotent SQL for the founder to run; migrate before deploy.
- Don't invent menu items, prices, or allergen claims.
- Before re-theming for a new event, branch + tag the current version.
