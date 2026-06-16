-- Remove os campos da antiga seção "Detalhes" do formulário de produto.
-- A descrição (description) é mantida por alimentar SEO e busca.
alter table public.products
  drop column if exists includes,
  drop column if exists players,
  drop column if exists online_support,
  drop column if exists warranty_notes;
