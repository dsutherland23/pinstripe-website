import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Pinstripes Party & Event Rentals',
  description:
    'The page you are looking for could not be found. Browse our premium party and event rental inventory instead!',
};

export default function NotFound() {
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
      {/* CSS-only confetti pieces */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes confettiFall {
              0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            @keyframes confettiSway {
              0%, 100% { transform: translateX(0); }
              25%      { transform: translateX(15px); }
              75%      { transform: translateX(-15px); }
            }
            .confetti-piece {
              position: absolute;
              top: -5%;
              width: 8px;
              height: 8px;
              border-radius: 1px;
              opacity: 0;
              animation: confettiFall linear infinite;
            }
            .confetti-piece:nth-child(1)  { left: 5%;  background: #D4AF37; animation-duration: 5.2s; animation-delay: 0s; width: 10px; height: 6px; }
            .confetti-piece:nth-child(2)  { left: 12%; background: #f5e8a0; animation-duration: 4.8s; animation-delay: 0.8s; width: 6px; height: 10px; }
            .confetti-piece:nth-child(3)  { left: 22%; background: #D4AF37; animation-duration: 6.1s; animation-delay: 1.5s; border-radius: 50%; }
            .confetti-piece:nth-child(4)  { left: 30%; background: #bda030; animation-duration: 5.5s; animation-delay: 0.3s; width: 12px; height: 5px; }
            .confetti-piece:nth-child(5)  { left: 38%; background: #f5e9b0; animation-duration: 4.5s; animation-delay: 2.0s; border-radius: 50%; width: 6px; height: 6px; }
            .confetti-piece:nth-child(6)  { left: 48%; background: #D4AF37; animation-duration: 5.8s; animation-delay: 0.6s; width: 8px; height: 12px; }
            .confetti-piece:nth-child(7)  { left: 55%; background: #f5e8a0; animation-duration: 6.4s; animation-delay: 1.2s; }
            .confetti-piece:nth-child(8)  { left: 65%; background: #bda030; animation-duration: 5.0s; animation-delay: 1.8s; width: 10px; height: 4px; }
            .confetti-piece:nth-child(9)  { left: 75%; background: #D4AF37; animation-duration: 5.6s; animation-delay: 0.4s; border-radius: 50%; width: 7px; height: 7px; }
            .confetti-piece:nth-child(10) { left: 85%; background: #f5e9b0; animation-duration: 4.9s; animation-delay: 2.5s; width: 10px; height: 6px; }
            .confetti-piece:nth-child(11) { left: 92%; background: #D4AF37; animation-duration: 5.3s; animation-delay: 1.0s; width: 5px; height: 10px; }
            .confetti-piece:nth-child(12) { left: 18%; background: #bda030; animation-duration: 6.0s; animation-delay: 3.0s; border-radius: 50%; }
          `,
        }}
      />

      {/* Confetti elements */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="confetti-piece" />
        ))}
      </div>

      {/* Ambient gold glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-up"
        style={{
          position: 'relative',
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Large 404 behind */}
        <div
          style={{
            position: 'absolute',
            top: '-2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
            fontSize: 'clamp(6rem, 20vw, 12rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(212,175,55,0.12)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          404
        </div>

        {/* Party icon */}
        <div
          className="animate-float"
          style={{
            position: 'relative',
            fontSize: '4.5rem',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 4px 24px rgba(212,175,55,0.25))',
          }}
        >
          🎉
        </div>

        {/* Label */}
        <p
          style={{
            position: 'relative',
            fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#D4AF37',
            marginBottom: '0.75rem',
          }}
        >
          ★ &nbsp;Page Not Found&nbsp; ★
        </p>

        {/* Heading */}
        <h1
          className="text-gradient"
          style={{
            position: 'relative',
            fontFamily: "var(--font-heading), 'Montserrat', system-ui, sans-serif",
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          The Party Moved!
        </h1>

        {/* Subtitle */}
        <p
          style={{
            position: 'relative',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: '#cccccc',
            marginBottom: '2.5rem',
            maxWidth: '420px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Looks like this page packed up and left the venue.
          Let&apos;s get you back to where the celebration is happening!
        </p>

        {/* Actions */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Go Home — primary CTA */}
          <Link
            href="/"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            🏠 Back to the Party
          </Link>

          {/* Browse inventory */}
          <Link
            href="/#rentals"
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
              textTransform: 'uppercase',
              border: '2px solid rgba(255,255,255,0.2)',
              textDecoration: 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            🎪 Browse Rentals
          </Link>
        </div>

        {/* Helpful links */}
        <div
          style={{
            position: 'relative',
            marginTop: '3rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Bounce Houses', href: '/#rentals' },
            { label: 'Packages', href: '/#packages' },
            { label: 'Contact Us', href: '/#contact' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontSize: '0.75rem',
                color: 'rgba(212,175,55,0.6)',
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: '0.05em',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Decorative gold line */}
        <div
          style={{
            position: 'relative',
            marginTop: '2.5rem',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
          }}
        />

        {/* Brand footer */}
        <p
          style={{
            position: 'relative',
            marginTop: '1.5rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
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
