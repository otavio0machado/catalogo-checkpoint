# Prompt para Codex: Catálogo Checkpoint Games

Você é o Codex trabalhando em um projeto de freela para a loja Checkpoint Games. O objetivo é criar um sistema de catálogo de games semelhante ao projeto `app-livros` do GitHub:

https://github.com/otavio0machado/app-livros

Use também a vitrine publicada do MyShelf como referência de experiência:

https://myshelf.com.br

## Contexto

A Checkpoint Games precisa de um catálogo online para expor jogos, consoles, acessórios e itens colecionáveis. O sistema deve ser parecido com o MyShelf: vitrine pública, página de detalhe, carrinho simples e finalização pelo WhatsApp, além de painel administrativo para cadastrar, editar, reservar, vender e remover produtos.

Não transforme isso em marketplace completo. Não implemente pagamento online, cálculo de frete, login de cliente, nota fiscal, gateway, marketplace multi-loja ou integração fiscal, a menos que o usuário peça depois. O MVP deve resolver bem o fluxo real da loja: cadastrar produto, mostrar produto, montar pedido e chamar no WhatsApp.

## Referência do app-livros

Antes de implementar, leia o repositório `app-livros` e reaproveite a arquitetura quando fizer sentido:

- Next.js App Router, React, TypeScript e Tailwind.
- Rotas públicas parecidas com `/`, `/loja`, `/livro/[id]` e `/carrinho`.
- Rotas administrativas parecidas com `/login`, `/admin`, `/admin/novo`, `/admin/editar/[id]`.
- APIs públicas sanitizadas em `/api/books` e `/api/books/[id]`.
- APIs admin protegidas em `/api/admin/books` e `/api/admin/books/[id]`.
- Supabase para banco e storage.
- Autenticação admin por cookie JWT com `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
- Upload de imagens e vídeos para bucket público.
- Carrinho em estado local e checkout pelo WhatsApp.
- Fallback estático para o catálogo funcionar localmente mesmo sem env vars do Supabase.

Adapte o vocabulário de domínio. Troque `Book`, `books`, `livro`, `author`, `publisher`, `isbn` e campos literários por `Product`, `products`, `produto`, `platform`, `brand`, `publisher`, `genre`, `media_format`, `region`, `condition`, etc.

## Identidade visual

Use a marca Checkpoint Games. A logo enviada tem fundo preto, texto branco, destaque em amarelo/laranja e um pin/checkpoint laranja. A interface deve parecer loja gamer/local, confiável e direta, não uma landing page genérica.

Direção visual:

- Base escura ou neutra com bom contraste.
- Destaques em laranja/amarelo da marca.
- Cards de produtos compactos e fáceis de comparar.
- Visual mobile-first, pois muitos clientes vão abrir pelo WhatsApp/Instagram.
- Evite excesso de gradientes, cards decorativos e hero de marketing.
- A primeira tela deve dar acesso rápido ao catálogo e mostrar que é a Checkpoint Games.
- Se houver arquivo de logo no workspace, copie para `public/checkpoint-logo.png` e use no header. Se não houver, crie um fallback tipográfico com ícone simples de pin/checkpoint e texto `Checkpoint Games`.

## Funcionalidades públicas

Crie ou adapte estas rotas:

- `/`: home curta da Checkpoint Games com CTA para o catálogo, resumo do fluxo e diferenciais.
- `/loja`: catálogo público com busca, filtros e grade de produtos.
- `/produto/[id]`: detalhe do produto com galeria, preço, condição, especificações e botão de adicionar ao carrinho.
- `/carrinho`: lista de produtos escolhidos, total e botão de finalizar pelo WhatsApp.

Na `/loja`, implemente:

- Busca por título, plataforma, marca/publisher, gênero, SKU e descrição.
- Filtros por tipo de produto, plataforma, condição, gênero e status público.
- Contagem de itens disponíveis.
- Cards com imagem, título, plataforma, condição, tipo, preço e botão `+ adicionar`.
- Suporte a preço conhecido em centavos e preço `A combinar` quando `price_cents <= 0`.
- Indicação de desconto quando houver `compare_at_price_cents` maior que `price_cents`.
- Estado vazio útil quando a busca não retorna produtos.

Na página de detalhe, mostre:

- Galeria de imagens e vídeos.
- Título.
- Tipo: `Jogo`, `Console`, `Acessório`, `Colecionável`, `Gift Card` ou `Outro`.
- Plataforma: PS5, PS4, Xbox Series, Xbox One, Nintendo Switch, PC, Retro, Multiplataforma, etc.
- Condição: novo, usado excelente, usado com marcas, mídia com detalhes, caixa/manual inclusos ou ausentes.
- Preço ou `A combinar`.
- Estoque.
- Descrição.
- Especificações como região, mídia física/digital, gênero, classificação indicativa, número de jogadores, online/local, publisher/marca, SKU, garantia/observações.
- Botão para adicionar ao carrinho.

No carrinho:

- Persistir itens no navegador.
- Permitir remover item.
- Mostrar total em reais quando todos os preços forem conhecidos.
- Mostrar `A combinar` ou `R$ X + itens a combinar` quando houver item sem preço.
- Gerar mensagem de WhatsApp com produtos, plataformas, condições, preços e total.
- Usar env `NEXT_PUBLIC_WHATSAPP_NUMBER`, com fallback temporário documentado no `.env.example`.

## Painel administrativo

Crie ou adapte estas rotas:

- `/login`: login administrativo.
- `/admin`: dashboard com lista de produtos e estatísticas.
- `/admin/novo`: cadastro de produto.
- `/admin/editar/[id]`: edição de produto.

No admin, implemente:

- Autenticação por `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `JWT_SECRET`.
- Middleware/proxy protegendo `/admin`.
- Listagem com total, disponíveis, reservados e vendidos.
- Ações rápidas: editar, excluir, marcar como vendido, marcar como reservado, marcar como disponível.
- Upload de imagens e vídeos.
- Formulário completo de produto.
- Validação mínima de campos obrigatórios.
- Mensagens de erro claras.
- Exclusão removendo também mídias do bucket quando houver `path`.

Campos recomendados no formulário:

- `type`: Jogo, Console, Acessório, Colecionável, Gift Card, Outro.
- `title`.
- `platform`.
- `brand`.
- `publisher`.
- `genre`.
- `media_format`: Física, Digital, Código, Cartucho, Disco, Console, Acessório.
- `region`: Brasil, US, Europeu, Japonês, Livre de região, Outro.
- `condition_detail`.
- `condition_notes`.
- `includes`: caixa, manual, DLC, cabo, controle, fonte, etc.
- `description`.
- `price_cents`.
- `compare_at_price_cents`.
- `stock`.
- `sku`.
- `age_rating`.
- `players`.
- `online_support`.
- `warranty_notes`.
- `weight_kg`, `width_cm`, `length_cm`, `height_cm`.
- `photo_url`.
- `media`.
- `status`: available, reserved, sold, hidden.

## Banco de dados e Supabase

Crie ou adapte `supabase/schema.sql` para uma tabela `products`:

- `id bigint generated by default as identity primary key`
- `type text not null default 'Jogo'`
- `title text not null`
- `platform text not null default ''`
- `brand text not null default ''`
- `publisher text not null default ''`
- `genre text not null default ''`
- `media_format text not null default ''`
- `region text not null default ''`
- `condition text not null default 'Usado'`
- `condition_detail text not null default ''`
- `condition_notes text not null default ''`
- `includes text not null default ''`
- `description text not null default ''`
- `price_cents integer not null default 0`
- `compare_at_price_cents integer`
- `stock integer not null default 1`
- `sku text not null default ''`
- `age_rating text not null default ''`
- `players text not null default ''`
- `online_support text not null default ''`
- `warranty_notes text not null default ''`
- `weight_kg numeric(10, 3) not null default 0.2`
- `width_cm numeric(10, 2) not null default 14`
- `length_cm numeric(10, 2) not null default 17`
- `height_cm numeric(10, 2) not null default 2`
- `photo_url text not null default ''`
- `media jsonb not null default '[]'::jsonb`
- `status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'hidden'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Inclua índices para `status`, `platform`, `type`, `genre`, `sku` e `created_at`. Crie trigger de `updated_at`. Crie bucket público `product-media`.

## Fallback estático

Assim como no MyShelf, o catálogo público deve continuar funcionando sem Supabase configurado. Crie `src/data/listed-products.ts` com produtos de exemplo da Checkpoint Games e uma camada `src/lib/catalog.ts` que:

- Filtra os produtos estáticos por busca e filtros.
- Mescla produtos do Supabase com produtos estáticos sem duplicar por título/SKU.
- Retorna fallback quando `getSupabaseAdmin()` falhar por env ausente.

Inclua pelo menos 12 itens realistas de exemplo, como:

- The Last of Us Part II Remastered, PS5, Jogo, mídia física.
- God of War Ragnarok, PS5/PS4, Jogo.
- Spider-Man 2, PS5, Jogo.
- Zelda Tears of the Kingdom, Nintendo Switch, Jogo.
- Mario Kart 8 Deluxe, Nintendo Switch, Jogo.
- Controle DualSense, PS5, Acessório.
- Controle Xbox Series, Xbox, Acessório.
- Nintendo Switch OLED, Console.
- PlayStation 4 Slim, Console.
- Cabo HDMI, Acessório.
- Gift Card PlayStation, Gift Card.
- Funko/colecionável gamer, Colecionável.

Use imagens placeholder locais ou URLs seguras apenas se o projeto já tiver padrão para isso. O ideal é deixar o sistema pronto para upload pelo admin.

## APIs

Crie ou adapte:

- `GET /api/products`: público, retorna apenas produtos disponíveis e campos sanitizados.
- `GET /api/products/[id]`: público, retorna produto disponível e campos sanitizados.
- `GET /api/admin/products`: admin, retorna todos os produtos com filtros opcionais.
- `POST /api/admin/products`: admin, cria produto.
- `GET /api/admin/products/[id]`: admin, retorna produto completo.
- `PUT /api/admin/products/[id]`: admin, atualiza produto.
- `DELETE /api/admin/products/[id]`: admin, exclui produto e remove mídias.
- `POST /api/upload`: admin, envia arquivo para bucket `product-media`.
- `POST /api/auth/login` e `POST /api/auth/logout`.

Sanitize a API pública para não expor campos internos desnecessários. Trate erros de Supabase com fallback público quando possível.

## Env vars

Atualize `.env.example` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

JWT_SECRET=troque-por-um-segredo-longo-e-aleatorio
ADMIN_EMAIL=admin@checkpointgames.com.br
ADMIN_PASSWORD=troque-esta-senha

NEXT_PUBLIC_WHATSAPP_NUMBER=5551999999999
```

Se mantiver IA para análise de fotos, deixe opcional:

```env
GEMINI_API_KEY=sua-chave-gemini
```

Não deixe o login admin abrir quando as variáveis obrigatórias estiverem ausentes. Deve falhar fechado.

## IA opcional

Se o repo base já tiver análise com Gemini e isso for barato adaptar, mantenha como opcional para sugerir título, plataforma, tipo, condição aparente, descrição e preço aproximado a partir de foto. Se isso aumentar muito o escopo, não implemente IA agora; priorize o catálogo, admin, upload e WhatsApp.

## Textos e linguagem

Use português do Brasil.

Exemplos de copy:

- Home: `Checkpoint Games`
- Subtítulo: `Jogos, consoles e acessórios selecionados para você reservar pelo WhatsApp.`
- CTA: `Ver catálogo`
- Fluxo: `Escolha`, `Adicione ao carrinho`, `Finalize pelo WhatsApp`
- Card: `+ adicionar`
- Carrinho vazio: `Seu carrinho está vazio`
- Checkout: `Finalizar pelo WhatsApp`
- Admin: `Produtos`, `Disponíveis`, `Reservados`, `Vendidos`

Mensagem do WhatsApp:

```text
Oi! Tenho interesse nesses produtos da Checkpoint Games:

1. God of War Ragnarok - PS5 - Usado excelente - R$ 149,90
2. Controle DualSense - PS5 - Novo - A combinar

Total: R$ 149,90 + itens a combinar

Podemos combinar disponibilidade, pagamento e retirada/envio?
```

## Regras de implementação

- Leia o código existente antes de editar.
- Preserve padrões locais de componentes, rotas, Tailwind e helpers.
- Se o workspace estiver vazio, crie um projeto Next.js com TypeScript e Tailwind.
- Se estiver adaptando o `app-livros`, renomeie domínio com cuidado e remova textos de livros/apostilas onde não fizer sentido.
- Não quebre o fallback estático.
- Não exponha `SUPABASE_SERVICE_ROLE_KEY` no client.
- Use server routes para Supabase admin.
- Mantenha o carrinho client-side.
- Garanta responsividade mobile e desktop.
- Evite refatorações não relacionadas.

## Checklist de aceite

Ao terminar, verifique e reporte:

- `npm install` executado ou dependências já instaladas.
- `npm run lint` passando.
- `npm run build` passando.
- Dev server iniciado.
- `/` abre e identifica Checkpoint Games.
- `/loja` mostra produtos mesmo sem Supabase.
- Busca e filtros funcionam.
- Card adiciona produto ao carrinho.
- `/produto/[id]` mostra galeria, detalhes, preço e botão de carrinho.
- `/carrinho` calcula total e abre WhatsApp com mensagem correta.
- `/login` autentica com envs válidas.
- `/admin` fica protegido sem cookie.
- Admin lista, cria, edita, reserva, vende e exclui produto.
- Upload aceita JPG, PNG, WebP, MP4, MOV e WebM com limites razoáveis.
- API pública não expõe campos internos sensíveis.
- `.env.example` e `README.md` explicam como rodar e configurar Supabase/WhatsApp/admin.

## Entrega esperada

Entregue um sistema funcional de catálogo para a Checkpoint Games, inspirado no MyShelf, mas com domínio, textos, campos e identidade visual de loja de games. Ao final, informe os arquivos principais alterados, comandos executados, rotas disponíveis, variáveis de ambiente necessárias e qualquer limitação que ficou fora do MVP.
