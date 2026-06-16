-- Garante integridade do `type` (antes texto livre) e acelera o filtro por
-- condição usado no catálogo.

-- Normaliza valores fora do conjunto esperado antes de aplicar a constraint.
update public.products
  set type = 'Outro'
  where type not in ('Jogo', 'Console', 'Acessório', 'Colecionável', 'Gift Card', 'Outro');

alter table public.products
  drop constraint if exists products_type_check;

alter table public.products
  add constraint products_type_check
  check (type in ('Jogo', 'Console', 'Acessório', 'Colecionável', 'Gift Card', 'Outro'));

create index if not exists products_condition_idx on public.products (condition);
