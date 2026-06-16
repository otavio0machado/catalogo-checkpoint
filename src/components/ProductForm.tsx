'use client';

import { useState } from 'react';
import type { MediaItem, Product, ProductAIAnalysis, StoreStock } from '@/types';
import { STORES, extractMediaItems, parseStoreStock, totalStoreStock } from '@/lib/products';
import MediaUploader from './MediaUploader';
import ConditionSelector from './ConditionSelector';

const TYPES: Product['type'][] = ['Jogo', 'Console', 'Acessório', 'Colecionável', 'Gift Card', 'Outro'];
const FORMATS = ['Disco', 'Cartucho', 'Digital', 'Código', 'Console', 'Acessório', 'Colecionável'];

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  submitLabel?: string;
}

export default function ProductForm({ initialData, onSubmit, submitLabel = 'Salvar produto' }: ProductFormProps) {
  const requiresAnalysis = !initialData?.id;
  const [media, setMedia] = useState<MediaItem[]>(extractMediaItems(initialData));
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAIAnalysis | null>(null);
  const [analysisApplied, setAnalysisApplied] = useState(Boolean(initialData?.id));
  const [analysisError, setAnalysisError] = useState('');
  const [formError, setFormError] = useState('');
  const [priceDisplay, setPriceDisplay] = useState(
    initialData?.price_cents ? (initialData.price_cents / 100).toFixed(2) : ''
  );
  const [form, setForm] = useState<Partial<Product>>({
    type: 'Jogo',
    title: '',
    platform: 'PS5',
    brand: '',
    publisher: '',
    genre: '',
    media_format: 'Disco',
    region: 'Brasil',
    condition: 'Usado',
    condition_detail: '',
    condition_notes: '',
    description: '',
    price_cents: 0,
    compare_at_price_cents: null,
    stock: 1,
    sku: '',
    age_rating: '',
    weight_kg: 0.2,
    width_cm: 14,
    length_cm: 17,
    height_cm: 2,
    status: 'available',
    ...initialData,
    store_stock: parseStoreStock(initialData?.store_stock),
  });

  function updateField(field: keyof Product, value: string | number | boolean | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateStoreStock(store: string, value: number) {
    setForm((prev) => {
      const next: StoreStock = { ...(prev.store_stock || {}), [store]: Math.max(0, Math.floor(value) || 0) };
      // Mantém o estoque total sincronizado com a soma das lojas.
      return { ...prev, store_stock: next, stock: totalStoreStock(next) };
    });
  }

  function handleMediaChange(items: MediaItem[]) {
    setMedia(items);
    if (!initialData?.id) {
      setAnalysis(null);
      setAnalysisApplied(false);
      setAnalysisError('');
    }
  }

  function handlePriceChange(value: string) {
    const cents = Math.round(Number(value.replace(',', '.') || '0') * 100);
    setPriceDisplay(value);
    updateField('price_cents', cents > 0 ? cents : 0);
  }

  async function imageToBase64(url: string): Promise<{ imageBase64: string; mimeType: string }> {
    const response = await fetch(url);
    const blob = await response.blob();
    const imageBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Erro ao ler imagem'));
      reader.readAsDataURL(blob);
    });
    return { imageBase64, mimeType: blob.type || 'image/jpeg' };
  }

  async function handleAnalyze() {
    const firstImage = media.find((item) => item.type === 'image');
    if (!firstImage) {
      setAnalysisError('Tire ou envie pelo menos uma foto antes de analisar.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError('');
    setAnalysis(null);
    setAnalysisApplied(false);

    try {
      const imagePayload = await imageToBase64(firstImage.url);
      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagePayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar com IA');
      setAnalysis(data as ProductAIAnalysis);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Erro ao analisar com IA');
    } finally {
      setAnalyzing(false);
    }
  }

  function applyAnalysis() {
    if (!analysis) return;
    const priceCents = analysis.suggested_price_cents || 0;

    setForm((prev) => ({
      ...prev,
      type: analysis.type || prev.type,
      title: analysis.title || prev.title,
      platform: analysis.platform || prev.platform,
      brand: analysis.brand || prev.brand,
      publisher: analysis.publisher || prev.publisher,
      genre: analysis.genre || prev.genre,
      media_format: analysis.media_format || prev.media_format,
      region: analysis.region || prev.region,
      condition: analysis.condition_detail.startsWith('Novo') ? 'Novo' : 'Usado',
      condition_detail: analysis.condition_detail || prev.condition_detail,
      condition_notes: analysis.condition_notes || prev.condition_notes,
      description: analysis.description || prev.description,
      price_cents: priceCents,
      sku: analysis.sku || prev.sku,
      age_rating: analysis.age_rating || prev.age_rating,
      weight_kg: analysis.weight_kg || prev.weight_kg,
      width_cm: analysis.width_cm || prev.width_cm,
      length_cm: analysis.length_cm || prev.length_cm,
      height_cm: analysis.height_cm || prev.height_cm,
    }));
    setPriceDisplay(priceCents ? (priceCents / 100).toFixed(2) : '');
    setAnalysisApplied(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!form.title || !form.platform || !form.condition_detail) {
      setFormError('Preencha título, plataforma e condição.');
      return;
    }
    if (requiresAnalysis && !analysisApplied) {
      setFormError('Analise a foto com IA e aplique a sugestão antes de publicar.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        media,
        photo_url: media[0]?.url || form.photo_url || '',
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Mídia">
        <MediaUploader items={media} onChange={handleMediaChange} />
        <div className="rounded-xl border border-brand-400/20 bg-brand-400/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-brand-300">1. Tire a foto  2. Analise com IA  3. Revise  4. Publique</p>
              <p className="mt-1 text-xs text-warm-400">
                A publicação de um novo produto exige análise aplicada antes do botão final.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !media.some((item) => item.type === 'image')}
              className="rounded-xl bg-brand-400 px-4 py-3 text-sm font-black text-[#111] transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? 'Analisando...' : 'Analisar com IA'}
            </button>
          </div>

          {analysisError && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{analysisError}</p>
          )}

          {analysis && (
            <AIReviewPanel analysis={analysis} applied={analysisApplied} onApply={applyAnalysis} />
          )}
        </div>
      </FormSection>

      <FormSection title="Informações principais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Título *" value={form.title || ''} onChange={(value) => updateField('title', value)} required />
          <Input label="SKU" value={form.sku || ''} onChange={(value) => updateField('sku', value)} placeholder="CHK-PS5-001" />
          <Select label="Tipo" value={form.type || 'Jogo'} onChange={(value) => updateField('type', value)} options={TYPES} />
          <Input label="Plataforma *" value={form.platform || ''} onChange={(value) => updateField('platform', value)} required placeholder="PS5, Nintendo Switch, Xbox..." />
          <Input label="Marca" value={form.brand || ''} onChange={(value) => updateField('brand', value)} />
          <Input label="Publisher" value={form.publisher || ''} onChange={(value) => updateField('publisher', value)} />
          <Input label="Gênero" value={form.genre || ''} onChange={(value) => updateField('genre', value)} />
          <Select label="Formato" value={form.media_format || ''} onChange={(value) => updateField('media_format', value)} options={FORMATS} />
          <Input label="Região" value={form.region || ''} onChange={(value) => updateField('region', value)} />
          <Input label="Classificação" value={form.age_rating || ''} onChange={(value) => updateField('age_rating', value)} />
        </div>
      </FormSection>

      <FormSection title="Condição">
        <ConditionSelector value={form.condition_detail || ''} onChange={(value) => updateField('condition_detail', value)} required />
        <Textarea label="Observações" value={form.condition_notes || ''} onChange={(value) => updateField('condition_notes', value)} rows={2} />
      </FormSection>

      <FormSection title="Venda">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Preço (R$)" value={priceDisplay} onChange={handlePriceChange} placeholder="149.90" />
        </div>
      </FormSection>

      <FormSection title="Estoque por loja">
        <div className="grid gap-4 sm:grid-cols-3">
          {STORES.map((store) => (
            <Input
              key={store}
              label={store}
              type="number"
              step="1"
              value={String(form.store_stock?.[store] ?? 0)}
              onChange={(value) => updateStoreStock(store, Number(value))}
            />
          ))}
        </div>
        <p className="text-sm text-warm-400">
          Estoque total: <span className="font-black text-white">{form.stock ?? 0}</span>
        </p>
      </FormSection>

      <FormSection title="Envio">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input label="Peso (kg)" type="number" value={String(form.weight_kg ?? 0)} onChange={(value) => updateField('weight_kg', Number(value) || 0)} step="0.01" />
          <Input label="Largura (cm)" type="number" value={String(form.width_cm ?? 0)} onChange={(value) => updateField('width_cm', Number(value) || 0)} step="0.1" />
          <Input label="Comprimento (cm)" type="number" value={String(form.length_cm ?? 0)} onChange={(value) => updateField('length_cm', Number(value) || 0)} step="0.1" />
          <Input label="Altura (cm)" type="number" value={String(form.height_cm ?? 0)} onChange={(value) => updateField('height_cm', Number(value) || 0)} step="0.1" />
        </div>
      </FormSection>

      {formError && (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {formError}
        </p>
      )}

      <button disabled={saving} className="w-full rounded-xl bg-brand-400 px-5 py-4 text-base font-black text-[#111] transition hover:bg-brand-300 disabled:opacity-50">
        {saving ? 'Salvando...' : submitLabel}
      </button>
    </form>
  );
}

function AIReviewPanel({
  analysis,
  applied,
  onApply,
}: {
  analysis: ProductAIAnalysis;
  applied: boolean;
  onApply: () => void;
}) {
  const confidence = Math.round(analysis.confidence * 100);
  const price = analysis.suggested_price_cents
    ? `R$ ${(analysis.suggested_price_cents / 100).toFixed(2).replace('.', ',')}`
    : 'A combinar';

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#151515] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-white">Sugestão da IA</p>
          <p className="mt-1 text-xs text-warm-500">Confiança estimada: {confidence}%</p>
        </div>
        <button
          type="button"
          onClick={onApply}
          className={`rounded-lg px-3 py-2 text-xs font-black transition ${
            applied
              ? 'bg-green-500/15 text-green-200'
              : 'bg-white text-[#111] hover:bg-warm-200'
          }`}
        >
          {applied ? 'Sugestão aplicada' : 'Aplicar e revisar'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Suggestion label="Título" value={analysis.title} />
        <Suggestion label="Tipo" value={analysis.type} />
        <Suggestion label="Plataforma" value={analysis.platform} />
        <Suggestion label="Formato" value={analysis.media_format} />
        <Suggestion label="Condição" value={analysis.condition_detail} />
        <Suggestion label="Preço sugerido" value={price} />
      </div>

      {analysis.description && (
        <div className="mt-3 rounded-lg bg-white/[0.04] p-3">
          <p className="text-xs text-warm-500">Descrição sugerida</p>
          <p className="mt-1 text-sm leading-relaxed text-warm-200">{analysis.description}</p>
        </div>
      )}

      {analysis.review_notes.length > 0 && (
        <div className="mt-3 rounded-lg bg-yellow-500/10 p-3">
          <p className="text-xs font-black text-yellow-200">Revisar antes de publicar</p>
          <ul className="mt-2 space-y-1 text-sm text-yellow-100/90">
            {analysis.review_notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Suggestion({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <p className="text-xs text-warm-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-warm-100">{value || 'Não identificado'}</p>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="text-sm font-black uppercase tracking-wide text-brand-300">{title}</h2>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-warm-300">{label}</span>
      <input
        type={type}
        value={value}
        step={step}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white outline-none transition placeholder:text-warm-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-warm-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-warm-300">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white outline-none transition placeholder:text-warm-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
      />
    </label>
  );
}
