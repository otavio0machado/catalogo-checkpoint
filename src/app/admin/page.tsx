'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductStatus } from '@/types';
import { formatPriceLabel } from '@/lib/price';

const STATUS_LABELS: Record<ProductStatus, { label: string; color: string }> = {
  available: { label: 'Disponível', color: 'bg-green-500/12 text-green-300' },
  reserved: { label: 'Reservado', color: 'bg-yellow-500/12 text-yellow-200' },
  sold: { label: 'Vendido', color: 'bg-white/10 text-warm-400' },
  hidden: { label: 'Oculto', color: 'bg-red-500/12 text-red-300' },
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setErrorMessage('');
      const res = await fetch('/api/admin/products?status=');
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Erro ao carregar produtos');
      }
      setProducts(await res.json());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: ProductStatus) {
    try {
      setErrorMessage('');
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, status } : product)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao atualizar status');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      setErrorMessage('');
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir produto');
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao excluir produto');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-400 border-t-transparent" />
      </div>
    );
  }

  const available = products.filter((product) => product.status === 'available').length;
  const reserved = products.filter((product) => product.status === 'reserved').length;
  const sold = products.filter((product) => product.status === 'sold').length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Produtos" value={products.length} />
        <Stat label="Disponiveis" value={available} tone="text-green-300" />
        <Stat label="Reservados" value={reserved} tone="text-yellow-200" />
        <Stat label="Vendidos" value={sold} tone="text-warm-400" />
      </div>

      {errorMessage && (
        <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </p>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-normal">Produtos</h1>
          <p className="text-sm text-warm-500">Inventário da Checkpoint Games.</p>
        </div>
        <Link href="/admin/novo" className="inline-flex items-center justify-center rounded-xl bg-navy-400 px-4 py-2.5 text-sm font-black text-[#111] hover:bg-navy-300">
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-warm-300">Nenhum produto cadastrado ainda.</p>
          <Link href="/admin/novo" className="mt-2 inline-block text-sm font-black text-navy-300 hover:underline">
            Adicionar primeiro produto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const statusInfo = STATUS_LABELS[product.status] || STATUS_LABELS.available;
            return (
              <div key={product.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {product.photo_url && <Image src={product.photo_url} alt={product.title} fill className="object-cover" sizes="64px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-black text-white">{product.title}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-warm-500">{product.platform} · {product.type} · {product.sku}</p>
                    <p className="mt-1 text-sm font-black text-navy-300">{formatPriceLabel(product.price_cents)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => updateStatus(product.id, 'available')} className="AdminIconButton" title="Marcar disponível">D</button>
                    <button onClick={() => updateStatus(product.id, 'reserved')} className="AdminIconButton" title="Marcar reservado">R</button>
                    <button onClick={() => updateStatus(product.id, 'sold')} className="AdminIconButton" title="Marcar vendido">V</button>
                    <Link href={`/admin/editar/${product.id}`} className="AdminIconButton" title="Editar">E</Link>
                    <button onClick={() => handleDelete(product.id)} className="AdminIconButton text-red-300" title="Excluir">×</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = 'text-white' }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className={`text-2xl font-black ${tone}`}>{value}</p>
      <p className="text-xs text-warm-500">{label}</p>
    </div>
  );
}
