-- menu-prices.sql — server-side source of truth for charging (Option A).
-- The Netlify create-payment-intent function totals an order from THESE prices
-- (never the amount the client sends), so a tampered client can't underpay.
-- Run once in Supabase: SQL Editor ▸ New query ▸ paste ▸ Run.
--
-- Prices are in CENTS. Keep in sync with src/data/menu.ts (Pam's Grill). If you
-- change a price here, no app redeploy is needed — the charge follows this table.

create table if not exists public.menu_prices (
  item_id    text primary key,
  base_cents int  not null,
  -- option name → price delta in cents, e.g. {"Double": 300}
  options    jsonb not null default '{}',
  -- addon name → price delta in cents, e.g. {"Bacon": 200}
  addons     jsonb not null default '{}'
);

alter table public.menu_prices enable row level security;
drop policy if exists "anyone can read prices" on public.menu_prices;
create policy "anyone can read prices" on public.menu_prices for select using (true);

insert into public.menu_prices (item_id, base_cents, options, addons) values
  ('cheeseburger', 1000,
    '{"Single":0,"Double":300}',
    '{"Bacon":200,"Extra Cheese":100,"Grilled Onions":50}'),
  ('veggie-burger', 1000,
    '{}',
    '{"Add Cheese":100,"Avocado":150}'),
  ('chicken-sandwich', 1050,
    '{"Classic":0,"Spicy":0,"Buffalo":0}',
    '{"Bacon":200,"Add Cheese":100}'),
  ('hot-dog', 600,
    '{"Plain":0,"Chili Dog":150,"Chili Cheese Dog":200}',
    '{"Grilled Onions":50,"Sauerkraut":50}'),
  ('chicken-tenders', 950,
    '{"Honey Mustard":0,"BBQ":0,"Buffalo":0,"Ranch":0}',
    '{"Extra Sauce":75,"Add Fries":300}'),
  ('fries', 450,
    '{"Regular":0,"Large":200}',
    '{"Cheese Sauce":150,"Cajun Seasoning":50}'),
  ('onion-rings', 550,
    '{}',
    '{"Ranch":75}'),
  ('mozzarella-sticks', 700,
    '{}',
    '{"Extra Marinara":75}')
on conflict (item_id) do update
  set base_cents = excluded.base_cents,
      options    = excluded.options,
      addons     = excluded.addons;

-- Stripe PaymentIntent id, stored on the order once payment succeeds.
alter table public.orders add column if not exists payment_ref text;
grant select (payment_ref) on public.orders to anon, authenticated;
