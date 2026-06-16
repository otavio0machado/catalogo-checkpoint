-- Per-store inventory: maps store name -> quantity, e.g.
-- {"Shopping Total": 2, "Shopping Wallig": 0, "Shopping Bourbon": 1}
alter table public.products
  add column if not exists store_stock jsonb not null default '{}'::jsonb;
