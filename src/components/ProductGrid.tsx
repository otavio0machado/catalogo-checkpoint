import type { Product } from '@/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center">
        <p className="text-lg font-semibold text-warm-100">Nenhum produto encontrado</p>
        <p className="mt-1 text-sm text-warm-400">Tente mudar a busca ou limpar os filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
