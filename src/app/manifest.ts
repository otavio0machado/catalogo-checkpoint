import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Checkpoint Games',
    short_name: 'Checkpoint',
    description:
      'Jogos, consoles e acessórios selecionados para reservar pelo WhatsApp na Checkpoint Games.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111111',
    theme_color: '#ffa51f',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
