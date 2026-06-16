'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatCurrency, formatPriceLabel, hasKnownPrice } from '@/lib/price';
import { useCart } from './CartProvider';

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.id);
  const hasDiscount =
    hasKnownPrice(product.price_cents) &&
    !!product.compare_at_price_cents &&
    product.compare_at_price_cents > product.price_cents;
  const discount = hasDiscount
    ? Math.round(100 - (product.price_cents / product.compare_at_price_cents!) * 100)
    : 0;

  function handleAdd(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      platform: product.platform,
      price_cents: product.price_cents,
      photo_url: product.photo_url,
      condition_detail: product.condition_detail,
      type: product.type,
    });
  }

  return (
    <Link href={`/produto/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#181818] transition hover:-translate-y-0.5 hover:border-brand-400/70 hover:shadow-[0_16px_48px_rgba(255,138,18,.12)]">
        <div className="relative aspect-square bg-[#101010]">
          {product.photo_url ? (
            <Image
              src={product.photo_url}
              alt={product.title}
              fill
              priority={priority}
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="grid h-full place-items-center text-brand-300">Checkpoint</div>
          )}
          {hasDiscount && (
            <span className="absolute left-2 top-2 rounded-lg bg-brand-400 px-2 py-0.5 text-[10px] font-black text-[#111]">
              -{discount}%
            </span>
          )}
        </div>

        <div className="space-y-2 p-3">
          <div>
            <h3 className="min-h-[2.6em] text-[13px] font-semibold leading-snug text-white line-clamp-2">
              {product.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-warm-400">{product.platform}</p>
          </div>

          <div className="flex flex-wrap gap-1">
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-warm-300">{product.type}</span>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-warm-300">{product.condition}</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              {hasDiscount && (
                <p className="text-[10px] text-warm-500 line-through">
                  R$ {formatCurrency(product.compare_at_price_cents!)}
                </p>
              )}
              <p className="whitespace-nowrap text-sm font-black text-brand-300">{formatPriceLabel(product.price_cents)}</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={inCart}
              className={`min-h-8 rounded-lg px-2 text-[11px] font-bold transition ${
                inCart
                  ? 'bg-white/10 text-warm-400'
                  : 'bg-brand-400 text-[#111] hover:bg-brand-300 active:scale-95'
              }`}
            >
              {inCart ? 'no carrinho' : '+ adicionar'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
