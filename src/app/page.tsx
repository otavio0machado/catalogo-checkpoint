import Link from 'next/link';
import Logo from '@/components/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <Link href="/loja" className="rounded-full bg-navy-400 px-4 py-2 text-sm font-black text-[#111] transition hover:bg-navy-300">
            Ver catalogo
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl gap-8 px-5 pb-10 pt-10 sm:grid-cols-[1.1fr_.9fr] sm:items-center sm:pb-20 sm:pt-20">
          <div>
            <h1 className="max-w-xl text-4xl font-black uppercase leading-[0.96] tracking-normal text-white sm:text-6xl">
              Check<span className="text-navy-300">point</span> Games
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-warm-300 sm:text-lg">
              Jogos, consoles e acessórios selecionados para você reservar pelo WhatsApp. Escolha os itens, monte o carrinho e combine retirada ou envio direto com a loja.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/loja" className="inline-flex items-center justify-center rounded-xl bg-navy-400 px-6 py-3.5 text-sm font-black uppercase text-[#111] transition hover:bg-navy-300 active:scale-[0.98]">
                Ver catalogo
              </Link>
              <Link href="/carrinho" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:border-navy-300 hover:text-navy-200">
                Carrinho
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-[0_20px_80px_rgba(0,0,0,.35)]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-navy-400/20 blur-3xl" />
            <div className="grid grid-cols-2 gap-3">
              {['PS5', 'Switch', 'Xbox', 'Acessórios'].map((item, index) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className={`mb-8 h-20 rounded-lg ${index % 2 ? 'bg-navy-400/20' : 'bg-white/10'}`} />
                  <p className="text-sm font-black">{item}</p>
                  <p className="mt-1 text-xs text-warm-400">Disponível no catálogo</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-5xl gap-5 px-5 py-8 sm:grid-cols-3">
            {[
              ['Escolha', 'Navegue por jogos, consoles, gift cards e acessórios.'],
              ['Adicione ao carrinho', 'Separe os itens sem cadastro e sem complicação.'],
              ['Finalize pelo WhatsApp', 'A loja confirma disponibilidade, pagamento e entrega.'],
            ].map(([title, text], index) => (
              <div key={title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-400 text-sm font-black text-[#111]">{index + 1}</span>
                <div>
                  <h2 className="font-black text-white">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-warm-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-warm-500 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-black text-white">Checkpoint Games</p>
        <p>Catálogo MVP para venda assistida pelo WhatsApp.</p>
      </footer>
    </div>
  );
}
