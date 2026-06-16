'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import WhatsAppCheckout from '@/components/WhatsAppCheckout';
import { formatCartTotalLabel, formatPriceLabel } from '@/lib/price';

export default function CarrinhoPage() {
  const { items, removeItem, totalPrice } = useCart();
  const hasPendingPrices = items.some((item) => item.price_cents <= 0);

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-5">
          <Link href="/loja" className="text-sm font-bold text-warm-300 hover:text-brand-200">
            continuar olhando
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        <h1 className="text-2xl font-black uppercase tracking-normal">Seu carrinho</h1>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-warm-300">Seu carrinho está vazio</p>
            <Link href="/loja" className="mt-3 inline-block text-sm font-black text-brand-300 hover:underline">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {item.photo_url && <Image src={item.photo_url} alt={item.title} fill className="object-cover" sizes="64px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-sm font-black text-white">{item.title}</h2>
                    <p className="truncate text-xs text-warm-400">{item.platform} · {item.condition_detail}</p>
                    <p className="mt-1 text-sm font-black text-brand-300">{formatPriceLabel(item.price_cents)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-warm-400 transition hover:bg-red-500/10 hover:text-red-300"
                    aria-label="Remover item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-warm-400">Total ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
              <span className="text-xl font-black text-white">{formatCartTotalLabel(totalPrice, hasPendingPrices)}</span>
            </div>

            <WhatsAppCheckout />

            <p className="text-center text-xs leading-relaxed text-warm-500">
              Ao clicar, uma mensagem com os produtos será enviada para o WhatsApp da Checkpoint Games.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
