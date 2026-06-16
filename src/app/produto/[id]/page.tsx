import Link from 'next/link';
import type { MediaItem, Product } from '@/types';
import AddToCartButton from './AddToCartButton';
import MediaGallery from '@/components/MediaGallery';
import { getSupabaseAdmin } from '@/lib/supabase';
import { formatCurrency, formatPriceLabel, hasKnownPrice } from '@/lib/price';
import { parseMedia, parseStoreStock, STORES } from '@/lib/products';

function mediaItems(product: Product): MediaItem[] {
  if (Array.isArray(product.media) && product.media.length > 0) return product.media;
  if (product.photo_url) return [{ url: product.photo_url, type: 'image', path: '' }];
  return [];
}

async function getProduct(id: string): Promise<(Product & { mediaItems: MediaItem[] }) | null> {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) return null;

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
    return { ...parsed, mediaItems: mediaItems(parsed) };
  } catch {
    return null;
  }
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#111] px-5 text-center text-white">
        <div>
          <p className="text-lg font-black">Produto não encontrado</p>
          <Link href="/loja" className="mt-3 inline-block text-sm font-bold text-navy-300 hover:underline">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount =
    hasKnownPrice(product.price_cents) &&
    !!product.compare_at_price_cents &&
    product.compare_at_price_cents > product.price_cents;

  const storeStock = parseStoreStock(product.store_stock);
  const availableStores = STORES.filter((store) => storeStock[store] > 0);

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Link href="/loja" className="text-sm font-bold text-warm-300 hover:text-navy-200">
            voltar
          </Link>
          <Link href="/carrinho" className="text-sm font-bold text-warm-300 hover:text-navy-200">
            Carrinho
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-7 px-5 py-6 sm:grid-cols-[.9fr_1.1fr]">
        <MediaGallery items={product.mediaItems} />

        <section className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-navy-300">{product.platform}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-white">{product.title}</h1>
            <p className="mt-2 text-sm text-warm-400">{product.publisher || product.brand}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasDiscount && (
              <span className="text-base text-warm-500 line-through">
                R$ {formatCurrency(product.compare_at_price_cents!)}
              </span>
            )}
            <span className="text-3xl font-black text-navy-300">{formatPriceLabel(product.price_cents)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[product.type, product.condition_detail, product.genre, product.media_format].filter(Boolean).map((badge) => (
              <span key={badge} className="rounded-lg bg-white/[0.07] px-3 py-1 text-xs font-bold text-warm-200">
                {badge}
              </span>
            ))}
          </div>

          {product.condition_notes && (
            <div className="rounded-xl border border-navy-400/20 bg-navy-400/10 p-4 text-sm text-warm-200">
              <span className="font-black text-navy-300">Observação: </span>{product.condition_notes}
            </div>
          )}

          <p className="text-sm leading-relaxed text-warm-300">{product.description}</p>

          {availableStores.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-navy-300">Disponível nas lojas</p>
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
              ['Estoque', `${product.stock}`],
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
