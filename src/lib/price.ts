export function hasKnownPrice(cents: number): boolean {
  return cents > 0;
}

const BRL_DECIMAL = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(cents: number): string {
  return BRL_DECIMAL.format(cents / 100);
}

export function formatPriceLabel(cents: number): string {
  return hasKnownPrice(cents) ? `R$ ${formatCurrency(cents)}` : 'A combinar';
}

export function formatCartTotalLabel(totalCents: number, hasPendingPrices: boolean): string {
  if (!hasPendingPrices) return formatPriceLabel(totalCents);
  if (totalCents <= 0) return 'A combinar';
  return `${formatPriceLabel(totalCents)} + itens a combinar`;
}
