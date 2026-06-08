'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import type { Product } from '@/types';

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProduct(data);
      } catch {
        alert('Produto não encontrado');
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  async function handleSubmit(data: Partial<Product>) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Erro ao salvar');
      return;
    }

    router.push('/admin');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-navy-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black uppercase tracking-normal text-white">Editar produto</h1>
      <div className="max-w-3xl">
        <ProductForm initialData={product} onSubmit={handleSubmit} submitLabel="Salvar alterações" />
      </div>
    </div>
  );
}
