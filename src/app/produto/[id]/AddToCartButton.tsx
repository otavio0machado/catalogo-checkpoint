'use client';

import type { Product } from '@/types';
import { useCart } from '@/components/CartProvider';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  return (
    <button
      onClick={() =>
        addItem({
          productId: product.id,
          title: product.title,
          platform: product.platform,
          price_cents: product.price_cents,
          photo_url: product.photo_url,
          condition_detail: product.condition_detail,
          type: product.type,
        })
      }
      disabled={inCart}
      className={`w-full rounded-xl px-5 py-4 text-base font-black transition active:scale-[0.98] ${
        inCart
          ? 'bg-white/10 text-warm-400'
          : 'bg-navy-400 text-[#111] hover:bg-navy-300'
      }`}
    >
      {inCart ? 'Produto no carrinho' : 'Adicionar ao carrinho'}
    </button>
  );
}
