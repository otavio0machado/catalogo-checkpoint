'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const featuredConsoles = [
  {
    name: 'PlayStation 5',
    label: 'PS5',
    src: '/assets/consoles/ps5.webp',
    imageClassName: 'p-8 pb-24 sm:p-12 sm:pb-28',
  },
  {
    name: 'PlayStation 4',
    label: 'PS4',
    src: '/assets/consoles/ps4.webp',
    imageClassName: 'p-5 pb-24 sm:p-7 sm:pb-28',
  },
  {
    name: 'PlayStation 3',
    label: 'PS3',
    src: '/assets/consoles/ps3.webp',
    imageClassName: 'p-8 pb-24 sm:p-10 sm:pb-28',
  },
  {
    name: 'Xbox Series X',
    label: 'Xbox Series X',
    src: '/assets/consoles/xbox-series-x-microsoft-official.webp',
    imageClassName: 'p-8 pb-24 sm:p-10 sm:pb-28',
  },
  {
    name: 'Xbox Series X 1TB',
    label: 'Xbox Series X 1TB',
    src: '/assets/consoles/xbox-series-x-1tb.webp',
    imageClassName: 'p-8 pb-24 sm:p-10 sm:pb-28',
  },
  {
    name: 'Xbox One S',
    label: 'Xbox One S',
    src: '/assets/consoles/xbox-one-s.jpg',
    imageClassName: 'p-6 pb-24 sm:p-8 sm:pb-28',
  },
  {
    name: 'Xbox One com Kinect',
    label: 'Xbox One + Kinect',
    src: '/assets/consoles/xbox-one-kinect.jpg',
    imageClassName: 'p-5 pb-24 sm:p-7 sm:pb-28',
  },
  {
    name: 'Xbox 360',
    label: 'Xbox 360',
    src: '/assets/consoles/xbox-360.webp',
    imageClassName: 'p-8 pb-24 sm:p-10 sm:pb-28',
  },
  {
    name: 'Nintendo Switch 2',
    label: 'Nintendo Switch 2',
    src: '/assets/consoles/nintendo-switch-2.webp',
    imageClassName: 'p-8 pb-24 sm:p-10 sm:pb-28',
  },
  {
    name: 'Nintendo Switch',
    label: 'Nintendo Switch',
    src: '/assets/consoles/nintendo-switch.webp',
    imageClassName: 'p-5 pb-24 sm:p-7 sm:pb-28',
  },
  {
    name: 'Nintendo 3DS',
    label: 'Nintendo 3DS',
    src: '/assets/consoles/nintendo-3ds.jpg',
    imageClassName: 'p-5 pb-24 sm:p-7 sm:pb-28',
  },
] as const;

export default function ConsoleCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeConsole = featuredConsoles[activeIndex];

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const autoPlay = !paused && !reducedMotion;

  useEffect(() => {
    if (!autoPlay) return;
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % featuredConsoles.length);
    }, 2000);
    return () => window.clearInterval(interval);
  }, [autoPlay]);

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };

  return (
    <div className="LandingReveal w-full [animation-delay:260ms]">
      <article
        className="ConsoleFrame overflow-hidden rounded-xl border border-white/10 bg-[#181818] shadow-[0_20px_80px_rgba(0,0,0,.32)]"
        {...pauseHandlers}
      >
        <div className="relative aspect-[4/5] min-h-80 bg-white/[0.04] sm:aspect-[5/6] sm:min-h-[30rem]">
          {/* Todas as imagens ficam montadas e são reveladas por opacidade,
              evitando uma nova requisição de otimização a cada troca. */}
          {featuredConsoles.map((console, index) => (
            <Image
              key={console.name}
              src={console.src}
              alt={`${console.name} disponível na Checkpoint Games`}
              fill
              priority={index === 0}
              sizes="(min-width: 640px) 420px, 90vw"
              aria-hidden={index !== activeIndex}
              className={`object-contain transition-opacity duration-500 ${console.imageClassName} ${
                index === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#181818]/95 p-5">
            <p className="text-base font-black">{activeConsole.label}</p>
            <p className="mt-1 text-sm text-warm-400">Disponível no catálogo</p>
          </div>
        </div>
      </article>

      <div className="mt-3 flex justify-center gap-2" aria-label="Consoles em destaque">
        {featuredConsoles.map((console, index) => (
          <button
            key={console.name}
            type="button"
            aria-label={`Mostrar ${console.label}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            {...pauseHandlers}
            className={`relative h-2 overflow-hidden rounded-full transition-all ${
              index === activeIndex ? 'w-8 bg-white/20' : 'w-2 bg-white/25 hover:bg-white/45'
            }`}
          >
            {index === activeIndex && autoPlay ? (
              <span key={activeIndex} className="CarouselProgress absolute inset-y-0 left-0 rounded-full bg-brand-400" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
