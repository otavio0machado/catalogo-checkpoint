import Link from 'next/link';

export default function ProdutoNaoEncontrado() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#111] px-5 text-center text-white">
      <div>
        <p className="text-lg font-black">Produto não encontrado</p>
        <p className="mt-1 text-sm text-warm-400">Ele pode ter sido vendido ou removido do catálogo.</p>
        <Link href="/loja" className="mt-3 inline-block text-sm font-bold text-brand-300 hover:underline">
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}
