'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="pt-BR">
      <body style={{ background: '#111111', color: '#eeeeea', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '20px', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '1.125rem', fontWeight: 900 }}>Algo deu errado</p>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#929188' }}>
              Recarregue a página para tentar novamente.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: '1rem',
                borderRadius: '0.75rem',
                background: '#ffa51f',
                color: '#111111',
                padding: '0.625rem 1rem',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Tentar de novo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
