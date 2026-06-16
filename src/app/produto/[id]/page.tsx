import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { MediaItem, Product } from '@/types';
import AddToCartButton from './AddToCartButton';
import MediaGallery from '@/components/MediaGallery';
import { getSupabaseAdmin } from '@/lib/supabase';
import { formatCurrency, formatPriceLabel, hasKnownPrice } from '@/lib/price';
import {
  extractMediaItems,
  parseMedia,
  parseProductId,
  parseStoreStock,
  STORES,
  totalStoreStock,
} from '@/lib/products';

async function getProduct(id: string): Promise<(Product & { mediaItems: MediaItem[] }) | null> {
  const productId = parseProductId(id);
  if (!productId) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('status', 'available')
      .single();

    if (error || !data) return null;

    const parsed = parseMedia(data) as Product;
    return { ...parsed, mediaItems: extractMediaItems(parsed) };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: { absolute: 'Produto não encontrado — Checkpoint Games' } };
  }

  // Título da aba usa o template do layout (sufixo "| Checkpoint Games");
  // o título completo é usado em OG/Twitter, que não aplicam o template.
  const title = `${product.title}${product.platform ? ` — ${product.platform}` : ''}`;
  const fullTitle = `${title} | Checkpoint Games`;
  const description =
    product.description?.slice(0, 160) ||
    `${product.title} disponível na Checkpoint Games. Reserve pelo WhatsApp.`;
  const image = product.photo_url || undefined;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const hasDiscount =
    hasKnownPrice(product.price_cents) &&
    !!product.compare_at_price_cents &&
    product.compare_at_price_cents > product.price_cents;

  const storeStock = parseStoreStock(product.store_stock);
  const availableStores = STORES.filter((store) => storeStock[store] > 0);
  // Estoque exibido: prioriza a soma por loja; cai para o campo legado `stock`.
  const totalStock = totalStoreStock(storeStock) || product.stock;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: product.mediaItems.filter((m) => m.type === 'image').map((m) => m.url),
    sku: product.sku || undefined,
    brand: product.brand || product.publisher || undefined,
    category: product.type,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: hasKnownPrice(product.price_cents) ? (product.price_cents / 100).toFixed(2) : undefined,
      availability:
        totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Link href="/loja" className="text-sm font-bold text-warm-300 hover:text-brand-200">
            voltar
          </Link>
          <Link href="/carrinho" className="text-sm font-bold text-warm-300 hover:text-brand-200">
            Carrinho
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-7 px-5 py-6 sm:grid-cols-[.9fr_1.1fr]">
        <MediaGallery items={product.mediaItems} />

        <section className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-300">{product.platform}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-white">{product.title}</h1>
            <p className="mt-2 text-sm text-warm-400">{product.publisher || product.brand}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasDiscount && (
              <span className="text-base text-warm-500 line-through">
                R$ {formatCurrency(product.compare_at_price_cents!)}
              </span>
            )}
            <span className="text-3xl font-black text-brand-300">{formatPriceLabel(product.price_cents)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[product.type, product.condition_detail, product.genre, product.media_format].filter(Boolean).map((badge) => (
              <span key={badge} className="rounded-lg bg-white/[0.07] px-3 py-1 text-xs font-bold text-warm-200">
                {badge}
              </span>
            ))}
          </div>

          {product.condition_notes && (
            <div className="rounded-xl border border-brand-400/20 bg-brand-400/10 p-4 text-sm text-warm-200">
              <span className="font-black text-brand-300">Observação: </span>{product.condition_notes}
            </div>
          )}

          <p className="text-sm leading-relaxed text-warm-300">{product.description}</p>

          {availableStores.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-brand-300">Disponível nas lojas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableStores.map((store) => (
                  <span key={store} className="rounded-lg bg-white/[0.07] px-3 py-1 text-xs font-bold text-warm-200">
                    {store} · {storeStock[store]}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm">
            {[
              ['Região', product.region],
              ['SKU', product.sku],
              ['Estoque', totalStock > 0 ? `${totalStock}` : ''],
              ['Classificação', product.age_rating],
              ['Jogadores', product.players],
              ['Online', product.online_support],
              ['Incluso', product.includes],
              ['Garantia', product.warranty_notes],
            ].map(([label, value]) => (
              value ? (
                <div key={label}>
                  <p className="text-xs text-warm-500">{label}</p>
                  <p className="mt-0.5 text-warm-100">{value}</p>
                </div>
              ) : null
            ))}
          </div>

          <AddToCartButton product={product} />
        </section>
      </main>
    </div>
  );
}
