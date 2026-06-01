"use client";

import React, { useRef, useEffect, useState } from "react";

// --- RADIAL GLOW CARD ---
interface RadialGlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function RadialGlowCard({
  children,
  className = "",
  glowColor = "rgba(212, 175, 55, 0.15)",
  style,
  ...props
}: RadialGlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* Glow Layer */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          zIndex: 1,
        }}
      />
      
      {/* Inner border highlighting glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] border border-transparent transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(212, 175, 55, 0.3), transparent 60%)`,
          maskImage: 'linear-gradient(#fff, #fff) exclude, linear-gradient(#fff, #fff)',
          WebkitMaskImage: 'linear-gradient(#fff, #fff) exclude, linear-gradient(#fff, #fff)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'destination-out',
          zIndex: 2,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

// --- MAGNETIC WRAPPER ---
interface MagneticProps {
  children: React.ReactElement<any>;
  range?: number;
  strength?: number;
}

export function Magnetic({ children, range = 50, strength = 0.25 }: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < range) {
        // Attract element to mouse position slightly
        setPosition({ x: dx * strength, y: dy * strength });
      } else {
        // Reset to original
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [range, strength]);

  // Clone active children and append dynamic translate transform style
  return React.cloneElement(children, {
    ref,
    style: {
      ...children.props.style,
      transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      transition: position.x !== 0 ? "transform 0.1s ease-out" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  } as any);
}

