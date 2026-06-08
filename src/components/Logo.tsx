import Link from 'next/link';

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2.5c-5.8 0-10.5 4.7-10.5 10.5C5.5 21.8 16 30 16 30s10.5-8.2 10.5-17C26.5 7.2 21.8 2.5 16 2.5Zm0 15.2a4.8 4.8 0 1 1 0-9.6 4.8 4.8 0 0 1 0 9.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Logo({ size = 'default' }: { size?: 'default' | 'large' }) {
  const iconSize = size === 'large' ? 'w-9 h-9' : 'w-6 h-6';
  const textSize = size === 'large' ? 'text-2xl' : 'text-lg';

  return (
    <Link href="/" className="flex items-center gap-2 text-white hover:text-navy-200 transition-colors">
      <span className="grid place-items-center rounded-xl bg-gradient-to-b from-navy-200 to-navy-700 text-warm-900 shadow-[0_8px_24px_rgba(255,138,18,.25)]">
        <PinIcon className={iconSize} />
      </span>
      <span className={`font-black uppercase tracking-[0.04em] ${textSize}`}>
        Check<span className="text-navy-300">point</span>
      </span>
    </Link>
  );
}
