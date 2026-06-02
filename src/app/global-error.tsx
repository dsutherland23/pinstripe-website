'use client';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f0f',
          fontFamily: "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
          color: '#f5f5f5',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          {/* Party icon */}
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>
            🎪
          </div>

          {/* Section label */}
          <p
            style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#D4AF37',
              marginBottom: '0.75rem',
            }}
          >
            ★ &nbsp;Something Went Wrong&nbsp; ★
          </p>

          {/* Heading */}
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: '#D4AF37',
              margin: '0 0 0.75rem 0',
            }}
          >
            The Show Must Go On!
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: '#aaaaaa',
              margin: '0 auto 2rem',
              maxWidth: '360px',
            }}
          >
            An unexpected error occurred at the root level.
            Let&apos;s try getting the party back on track.
          </p>

          {/* Error digest */}
          {error.digest && (
            <p
              style={{
                display: 'inline-block',
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                marginBottom: '2rem',
                fontSize: '0.7rem',
                color: 'rgba(212,175,55,0.6)',
                fontFamily: 'monospace',
                letterSpacing: '0.03em',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap' as const,
            }}
          >
            {/* Try Again */}
            <button
              onClick={() => unstable_retry()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#D4AF37',
                color: '#0f0f0f',
                padding: '0.875rem 2rem',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 16px rgba(212,175,55,0.35)',
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
            >
              🔄 Try Again
            </button>

            {/* Reload page */}
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'transparent',
                color: '#ffffff',
                padding: '0.875rem 2rem',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.2)',
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
            >
              🏠 Go Home
            </button>
          </div>

          {/* Gold divider */}
          <div
            style={{
              marginTop: '2.5rem',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)',
            }}
          />

          {/* Brand */}
          <p
            style={{
              marginTop: '1.25rem',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            Pinstripes Party &amp; Event Rentals
          </p>
        </div>
      </body>
    </html>
  );
}
