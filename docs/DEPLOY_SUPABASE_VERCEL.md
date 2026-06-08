# Deploy Supabase + Vercel

Este guia deixa o catálogo da Checkpoint Games pronto para produção: Supabase guarda produtos e mídias, Vercel roda o Next.js, Gemini analisa fotos no cadastro e WhatsApp fecha o pedido.

## 1. Criar o projeto no Supabase

Crie um projeto novo chamado `checkpoint-games-catalog`, de preferência na região `sa-east-1` se disponível para a sua conta.

Depois de criado, aplique o schema:

```bash
# Opcional, se o CLI estiver instalado e o projeto estiver linkado
supabase db push
```

Ou cole no SQL Editor do Supabase o conteúdo de:

```text
supabase/schema.sql
```

O schema cria:

- tabela `public.products`;
- índices de busca/filtro;
- trigger de `updated_at`;
- RLS ligada em `products`;
- policy pública só para produtos `available`;
- bucket público `product-media`;
- policy pública de leitura para mídia.

As rotas admin do app usam `SUPABASE_SERVICE_ROLE_KEY` somente no servidor. Nunca coloque essa chave no navegador, no código client-side, em `NEXT_PUBLIC_*` ou em prints.

## 2. Pegar as chaves do Supabase

No dashboard do Supabase, copie:

- Project URL;
- `anon public`;
- `service_role`.

Essas chaves viram:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

## 3. Gerar segredos do painel

Gere um segredo forte para o cookie JWT:

```bash
openssl rand -base64 48
```

Defina tambem:

```env
JWT_SECRET=SEGREDO_GERADO
ADMIN_EMAIL=admin@checkpointgames.com.br
ADMIN_PASSWORD=SENHA_FORTE_DO_ADMIN
NEXT_PUBLIC_WHATSAPP_NUMBER=5551999999999
GEMINI_API_KEY=SUA_CHAVE_GEMINI
```

Troque `NEXT_PUBLIC_WHATSAPP_NUMBER` pelo WhatsApp real da loja, com DDI e DDD, apenas números.

## 4. Linkar o projeto na Vercel

Na raiz do projeto:

```bash
npx vercel@latest link --yes --project checkpoint-games-catalog
```

Se preferir fazer interativo:

```bash
npx vercel@latest link
```

## 5. Enviar variaveis para a Vercel

Para cada variavel abaixo, rode o comando para `production` e `development`, colando o valor quando o CLI pedir:

```bash
npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL development

npx vercel@latest env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel@latest env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

npx vercel@latest env add SUPABASE_SERVICE_ROLE_KEY production
npx vercel@latest env add SUPABASE_SERVICE_ROLE_KEY development

npx vercel@latest env add JWT_SECRET production
npx vercel@latest env add JWT_SECRET development

npx vercel@latest env add ADMIN_EMAIL production
npx vercel@latest env add ADMIN_EMAIL development

npx vercel@latest env add ADMIN_PASSWORD production
npx vercel@latest env add ADMIN_PASSWORD development

npx vercel@latest env add NEXT_PUBLIC_WHATSAPP_NUMBER production
npx vercel@latest env add NEXT_PUBLIC_WHATSAPP_NUMBER development

npx vercel@latest env add GEMINI_API_KEY production
npx vercel@latest env add GEMINI_API_KEY development
```

Se o projeto estiver conectado a um repositorio Git na Vercel, repita as mesmas variaveis para `preview`. Sem Git conectado, o CLI exige branch de preview e a API recusa branch porque o projeto ainda nao tem repositorio vinculado.

Depois puxe as envs para testar localmente:

```bash
npx vercel@latest env pull .env.local
npm run build
```

## 6. Deploy

Preview:

```bash
npx vercel@latest deploy
```

Produção:

```bash
npx vercel@latest deploy --prod
```

## 7. Checklist de validacao

- `/loja` carrega produtos.
- `/produto/[id]` abre o detalhe.
- `/carrinho` monta a mensagem para o WhatsApp correto.
- `/login` aceita `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
- `/admin/novo` permite tirar/enviar foto.
- `Analisar com IA` preenche sugestoes quando `GEMINI_API_KEY` esta valida.
- `Publicar produto` cria linha em `public.products`.
- A primeira foto aparece no bucket `product-media`.
- Produto `available` aparece na vitrine publica.
- Produto `hidden`, `reserved` ou `sold` nao aparece como disponivel na vitrine.

## 8. Comandos uteis

Ver erros recentes da producao:

```bash
npx vercel@latest logs --environment production --level error --since 30m
```

Atualizar envs locais depois de mudar algo na Vercel:

```bash
npx vercel@latest env pull .env.local
```
