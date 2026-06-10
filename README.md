# Checkpoint Games Catalogo

Sistema de catálogo para jogos, consoles, acessórios, gift cards e colecionáveis. O fluxo é simples: o cliente navega no catálogo, adiciona produtos ao carrinho e finaliza pelo WhatsApp.

No painel administrativo, novos produtos entram pelo fluxo: tirar/enviar foto, analisar com IA, revisar os campos sugeridos e publicar.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Rotas

- `/`: home curta da Checkpoint Games.
- `/loja`: vitrine pública com busca e filtros.
- `/produto/[id]`: detalhe público do produto.
- `/carrinho`: carrinho local e checkout via WhatsApp.
- `/login`: login administrativo.
- `/admin`: inventário protegido.
- `/admin/novo`: cadastro de produto.
- `/admin/editar/[id]`: edição de produto.
- `/api/analyze-product`: análise de foto por IA para o cadastro admin.

## Variáveis

O admin falha fechado se `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` não estiverem configurados.

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase público.
- `SUPABASE_SERVICE_ROLE_KEY`: CRUD e uploads server-side.
- `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: autenticação do painel.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número usado no checkout por WhatsApp.
- `GEMINI_API_KEY`: análise de fotos no cadastro de novos produtos.

## Supabase

O schema base está em `supabase/schema.sql`. Ele cria a tabela `products`, índices principais, trigger de `updated_at` e bucket público `product-media`.

O catálogo público lê os produtos reais da tabela `products`. Sem Supabase configurado, `/loja` fica vazia e `/api/products` retorna erro em vez de exibir anúncios de exemplo. O fluxo admin completo precisa das variáveis de Supabase, autenticação e `GEMINI_API_KEY`.

## Deploy

O passo a passo completo para Supabase + Vercel está em `docs/DEPLOY_SUPABASE_VERCEL.md`.

## Verificação

```bash
npm run lint
npm run build
```
