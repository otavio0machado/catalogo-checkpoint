'use client';

import { formatCartTotalLabel, formatPriceLabel } from '@/lib/price';
import { useCart } from './CartProvider';

export default function WhatsAppCheckout() {
  const { items, totalPrice, clearCart } = useCart();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const hasPendingPrices = items.some((item) => item.price_cents <= 0);

  function buildMessage(): string {
    let message = 'Oi! Tenho interesse nesses produtos da Checkpoint Games:\n\n';

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.title} - ${item.platform} - ${item.condition_detail} - ${formatPriceLabel(item.price_cents)}\n`;
    });

    message += `\nTotal: ${formatCartTotalLabel(totalPrice, hasPendingPrices)}`;
    message += '\n\nPodemos combinar disponibilidade, pagamento e retirada/envio?';
    return message;
  }

  function handleCheckout() {
    if (!phone) return;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`;
    const opened = window.open(url, '_blank');
    // Só esvazia o carrinho se a aba do WhatsApp realmente abriu.
    if (opened) clearCart();
  }

  if (items.length === 0) return null;

  if (!phone) {
    return (
      <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-center text-sm text-yellow-200">
        Checkout pelo WhatsApp indisponível no momento. Tente novamente mais tarde.
      </p>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-4 text-base font-black text-white transition hover:bg-whatsapp-dark active:scale-[0.98]"
    >
      Finalizar pelo WhatsApp
    </button>
  );
}
