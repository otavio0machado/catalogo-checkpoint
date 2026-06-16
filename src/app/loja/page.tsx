import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase';
import { applyProductFilters, sanitizePublicProduct, PUBLIC_PRODUCT_SELECT } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Jogos, consoles, acessórios e gift cards selecionados na Checkpoint Games. Monte o carrinho e reserve pelo WhatsApp.',
};

type SearchParams = Record<string, string>;

async function getProducts(searchParams: SearchParams): Promise<Product[]> {
  try {
    const supabase = getSupabaseAdmin();
    const query = applyProductFilters(
      supabase
        .from('products')
        // Só colunas públicas: como o produto é serializado como prop para o
        // client component ProductCard, evita expor stock/sku/dimensões.
        .select(PUBLIC_PRODUCT_SELECT)
        .eq('status', 'available')
        .order('created_at', { ascending: false }),
      {
        search: searchParams.search || '',
        type: searchParams.type || '',
        platform: searchParams.platform || '',
        genre: searchParams.genre || '',
        condition: searchParams.condition || '',
      }
    );

    const { data, error } = await query;
    if (error) return [];
    return (data || []).map((row) => sanitizePublicProduct(row as unknown as Record<string, unknown>)) as Product[];
  } catch {
    return [];
  }
}

async function CatalogResults({ searchParams }: { searchParams: SearchParams }) {
  const products = await getProducts(searchParams);

  return (
    <>
      <p className="mb-4 text-sm text-warm-400" aria-live="polite">
        {products.length} {products.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
      </p>
      <ProductGrid products={products} />
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-[#181818]">
          <div className="aspect-square animate-pulse bg-white/[0.04]" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  // Chave estável para reiniciar o Suspense (e o skeleton) a cada filtro novo.
  const suspenseKey = new URLSearchParams(params).toString();

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <Link href="/carrinho" className="text-sm font-bold text-warm-300 transition hover:text-brand-200">
            Carrinho
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-black uppercase tracking-normal text-white">Catálogo</h1>
          <p className="max-w-sm text-sm text-warm-500">
            Selecione os itens e finalize pelo WhatsApp para confirmar disponibilidade.
          </p>
        </div>

        <Suspense>
          <SearchBar />
        </Suspense>

        <div className="mt-6">
          <Suspense key={suspenseKey} fallback={<CatalogSkeleton />}>
            <CatalogResults searchParams={params} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
