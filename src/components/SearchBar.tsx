'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TYPES = ['Todos', 'Jogo', 'Console', 'Acessório', 'Colecionável', 'Gift Card', 'Outro'];
const PLATFORMS = ['Todas', 'PS5', 'PS4', 'PS5 / PS4', 'Xbox Series / Xbox One / PC', 'Nintendo Switch', 'PlayStation', 'Multiplataforma', 'Colecionáveis'];
const GENRES = ['Todos', 'Ação', 'Ação e aventura', 'Aventura', 'Corrida', 'Controle', 'Console', 'Cabo', 'Crédito digital', 'Decoração'];
const CONDITIONS = ['Todas', 'Novo', 'Usado'];

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (type) params.set('type', type);
      if (platform) params.set('platform', platform);
      if (genre) params.set('genre', genre);
      if (condition) params.set('condition', condition);
      const query = params.toString();
      router.push(query ? `/loja?${query}` : '/loja');
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, type, platform, genre, condition, router]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar jogo, plataforma, marca ou SKU..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-warm-500 focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <FilterSelect label="Tipo" value={type} onChange={setType} options={TYPES} emptyLabel="Todos" />
        <FilterSelect label="Plataforma" value={platform} onChange={setPlatform} options={PLATFORMS} emptyLabel="Todas" />
        <FilterSelect label="Gênero" value={genre} onChange={setGenre} options={GENRES} emptyLabel="Todos" />
        <FilterSelect label="Condição" value={condition} onChange={setCondition} options={CONDITIONS} emptyLabel="Todas" />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  emptyLabel: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-xl border border-white/10 bg-[#181818] px-3 py-2.5 text-xs text-warm-100 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
      >
        {options.map((option) => (
          <option key={option} value={option === emptyLabel ? '' : option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
