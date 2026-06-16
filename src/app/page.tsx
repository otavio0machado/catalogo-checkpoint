import Link from 'next/link';
import ConsoleCarousel from '@/components/ConsoleCarousel';
import Logo from '@/components/Logo';

export default function LandingPage() {
  return (
    <div className="LandingShell min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <Link href="/loja" className="MotionButton rounded-full bg-navy-400 px-4 py-2 text-sm font-black text-[#111] transition hover:bg-navy-300">
            <span>Ver catálogo</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl gap-8 px-5 pb-10 pt-10 sm:grid-cols-[1.1fr_.9fr] sm:items-center sm:pb-20 sm:pt-20">
          <div>
            <h1 className="LandingReveal max-w-xl text-4xl font-black uppercase leading-[0.96] tracking-normal text-white sm:text-6xl">
              Check<span className="text-navy-300">point</span> Games
            </h1>
            <p className="LandingReveal mt-5 max-w-lg text-base leading-relaxed text-warm-300 sm:text-lg [animation-delay:90ms]">
              Jogos, consoles e acessórios selecionados para você reservar pelo WhatsApp. Escolha os itens, monte o carrinho e combine retirada ou envio direto com a loja.
            </p>
            <div className="LandingReveal mt-7 flex flex-col gap-3 sm:flex-row [animation-delay:180ms]">
              <Link href="/loja" className="MotionButton inline-flex items-center justify-center rounded-xl bg-navy-400 px-6 py-3.5 text-sm font-black uppercase text-[#111] transition hover:bg-navy-300 active:scale-[0.98]">
                <span>Ver catálogo</span>
                <svg className="h-4 w-4 transition-transform" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/carrinho" className="MotionButton inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:border-navy-300 hover:text-navy-200">
                <span>Carrinho</span>
              </Link>
            </div>
            <div className="LandingReveal mt-5 grid max-w-lg gap-2 text-xs font-bold text-warm-300 sm:grid-cols-3 [animation-delay:270ms]">
              {['Atualização contínua', 'Reserva rápida', 'Retirada combinada'].map((item) => (
                <div key={item} className="LivePill flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 leading-tight">
                  <span className="h-2 w-2 rounded-full bg-navy-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <ConsoleCarousel />
        </section>

        <section className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-5xl gap-5 px-5 py-8 sm:grid-cols-3">
            {[
              ['Escolha', 'Navegue por jogos, consoles, gift cards e acessórios.'],
              ['Adicione ao carrinho', 'Separe os itens sem cadastro e sem complicação.'],
              ['Finalize pelo WhatsApp', 'A loja confirma disponibilidade, pagamento e entrega.'],
            ].map(([title, text], index) => (
              <div key={title} className="StepCard flex gap-4 rounded-xl p-2 transition">
                <span className="StepNumber grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-400 text-sm font-black text-[#111]">{index + 1}</span>
                <div>
                  <h2 className="font-black text-white">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-warm-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-5xl px-5 py-8 text-sm text-warm-500">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden h-5 w-px bg-white/15 sm:block" />
          <span className="font-black text-white">Games</span>
        </div>
      </footer>
    </div>
  );
}
