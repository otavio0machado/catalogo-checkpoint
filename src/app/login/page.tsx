'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Erro ao fazer login');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#111] px-5 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-xl font-black uppercase">
            Check<span className="text-navy-300">point</span> Games
          </Link>
          <p className="mt-2 text-sm text-warm-500">Acesso administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="block">
            <span className="mb-1 block text-sm text-warm-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-white outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
              placeholder="admin@checkpointgames.com.br"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-warm-300">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-white outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-center text-sm text-red-300">{error}</p>}

          <button disabled={loading} className="w-full rounded-xl bg-navy-400 px-5 py-3.5 text-base font-black text-[#111] transition hover:bg-navy-300 disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
