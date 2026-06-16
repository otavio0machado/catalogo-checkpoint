'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import type { Product } from '@/types';

export default function NovoProdutoPage() {
  const router = useRouter();

  async function handleSubmit(data: Partial<Product>) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || 'Erro ao salvar');
    }

    router.push('/admin');
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black uppercase tracking-normal text-white">Adicionar novo produto</h1>
      <div className="max-w-3xl">
        <ProductForm onSubmit={handleSubmit} submitLabel="Publicar produto" />
      </div>
    </div>
  );
}
