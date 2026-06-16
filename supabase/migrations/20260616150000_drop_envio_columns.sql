-- Remove os campos de envio (peso e dimensões) do formulário de produto.
-- O catálogo combina entrega pelo WhatsApp, então essas medidas não são usadas.
alter table public.products
  drop column if exists weight_kg,
  drop column if exists width_cm,
  drop column if exists length_cm,
  drop column if exists height_cm;
