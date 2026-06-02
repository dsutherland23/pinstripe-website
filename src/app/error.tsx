'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[Pinstripes Error]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(165deg, #0f0f0f 0%, #1a1a1a 40%, #0f0f0f 100%)',
        fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem',
      }}
    >
      {/* Ambient gold glow */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating party emoji decorations */}
      {['🎈', '🎉', '✨', '🎊', '🥳', '🎁'].map((emoji, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            fontSize: `${1.2 + (i % 3) * 0.6}rem`,
            opacity: 0.12 + (i % 3) * 0.06,
            top: `${10 + i * 14}%`,
            left: `${8 + ((i * 17) % 80)}%`,
            animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {emoji}
        </span>
      ))}

      <div
        style={{
          position: 'relative',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          animation: 'fadeInUp 0.6s ease-out both',
        }}
      >
        {/* Broken party icon */}
        <div
          style={{
            fontSize: '4.5rem',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 4px 24px rgba(212,175,55,0.25))',
            animation: 'float 5s ease-in-out infinite',
          }}
        >
          🎪
        </div>

        {/* Label */}
        <p
          style={{
            fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: '#D4AF37',
            marginBottom: '0.75rem',
          }}
        >
          ★ &nbsp;Oops! &nbsp;★
        </p>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #D4AF37 0%, #f5e8a0 50%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
          }}
        >
          The Party Hit a Snag!
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: '#cccccc',
            marginBottom: '2rem',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Something went wrong while setting up the fun.
          Don&apos;t worry — every great party needs a second take!
        </p>

        {/* Error digest (if available) */}
        {error.digest && (
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '0.75rem',
              padding: '0.5rem 1.25rem',
              marginBottom: '2rem',
              fontSize: '0.75rem',
              color: 'rgba(212,175,55,0.7)',
              fontFamily: 'monospace',
              letterSpacing: '0.03em',
            }}
          >
            Error ID: {error.digest}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap' as const,
          }}
        >
          {/* Try Again button */}
          <button
            onClick={() => unstable_retry()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: '#D4AF37',
              color: '#0f0f0f',
              padding: '0.875rem 2rem',
              borderRadius: '9999px',
              fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 16px rgba(212,175,55,0.35)',
              transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
              whiteSpace: 'nowrap' as const,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#bda030';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#D4AF37';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,175,55,0.35)';
            }}
          >
            🔄 Try Again
          </button>

          {/* Go Home link */}
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'transparent',
              color: '#ffffff',
              padding: '0.875rem 2rem',
              borderRadius: '9999px',
              fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
              textDecoration: 'none',
              whiteSpace: 'nowrap' as const,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
              e.currentTarget.style.color = '#D4AF37';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            🏠 Go Home
          </a>
        </div>

        {/* Decorative gold line */}
        <div
          style={{
            marginTop: '3rem',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
          }}
        />

        {/* Brand footer */}
        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.25)',
            fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
          }}
        >
          Pinstripes Party &amp; Event Rentals
        </p>
      </div>
    </div>
  );
}
