import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#111] px-5 text-center text-white">
      <div>
        <p className="text-3xl font-black text-brand-300">404</p>
        <p className="mt-2 text-lg font-black">Página não encontrada</p>
        <p className="mt-1 text-sm text-warm-400">O endereço que você tentou abrir não existe.</p>
        <Link href="/loja" className="mt-4 inline-block text-sm font-bold text-brand-300 hover:underline">
          Ir ao catálogo
        </Link>
      </div>
    </div>
  );
}
