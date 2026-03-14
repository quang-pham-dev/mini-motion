'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Critical Error
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {error.message || 'A critical error occurred in the application root.'}
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.5rem 1rem',
                background: '#000',
                color: '#fff',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
