'use client';

import { formatCartTotalLabel, formatPriceLabel } from '@/lib/price';
import { useCart } from './CartProvider';

export default function WhatsAppCheckout() {
  const { items, totalPrice, clearCart } = useCart();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5551999999999';
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
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, '_blank');
    clearCart();
  }

  if (items.length === 0) return null;

  return (
    <button
      onClick={handleCheckout}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-4 text-base font-black text-white transition hover:bg-whatsapp-dark active:scale-[0.98]"
    >
      Finalizar pelo WhatsApp
    </button>
  );
}
