import { Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase';
import { parseMedia, sanitizeSearchTerm } from '@/lib/products';

async function getProducts(searchParams: Record<string, string>): Promise<Product[]> {
  const filters = {
    search: sanitizeSearchTerm(searchParams.search || ''),
    type: searchParams.type || '',
    platform: searchParams.platform || '',
    genre: searchParams.genre || '',
    condition: searchParams.condition || '',
  };

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.platform) query = query.eq('platform', filters.platform);
    if (filters.genre) query = query.eq('genre', filters.genre);
    if (filters.condition) query = query.eq('condition', filters.condition);
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,platform.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,publisher.ilike.%${filters.search}%,genre.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) return [];
    return (data || []).map((row) => parseMedia(row)) as Product[];
  } catch {
    return [];
  }
}

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <Link href="/carrinho" className="text-sm font-bold text-warm-300 transition hover:text-navy-200">
            Carrinho
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-normal text-white">Catalogo</h1>
            <p className="mt-1 text-sm text-warm-400">
              {products.length} {products.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
            </p>
          </div>
          <p className="max-w-sm text-sm text-warm-500">
            Selecione os itens e finalize pelo WhatsApp para confirmar disponibilidade.
          </p>
        </div>

        <Suspense>
          <SearchBar />
        </Suspense>

        <div className="mt-6">
          <ProductGrid products={products} />
        </div>
      </main>
    </div>
  );
}
