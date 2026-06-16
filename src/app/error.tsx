'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#111] px-5 text-center text-white">
      <div>
        <p className="text-lg font-black">Algo deu errado</p>
        <p className="mt-1 text-sm text-warm-400">
          Tivemos um problema ao carregar esta página. Tente novamente.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-black text-[#111] transition hover:bg-brand-300"
          >
            Tentar de novo
          </button>
          <Link href="/loja" className="text-sm font-bold text-brand-300 hover:underline">
            Ir ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
