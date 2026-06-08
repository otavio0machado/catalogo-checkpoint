'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const links = [
    { href: '/admin', label: 'Produtos' },
    { href: '/admin/novo', label: 'Novo produto' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link href="/admin" className="text-sm font-black uppercase tracking-wide text-white">
          Check<span className="text-navy-300">point</span> <span className="font-medium text-warm-500">admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/loja" className="text-xs font-bold text-warm-400 hover:text-navy-200">
            ver site
          </Link>
          <button onClick={handleLogout} className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/10">
            sair
          </button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-t-lg px-3 py-2 text-xs font-bold transition ${
              pathname === link.href
                ? 'bg-white/[0.08] text-navy-300'
                : 'text-warm-500 hover:text-warm-200'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
