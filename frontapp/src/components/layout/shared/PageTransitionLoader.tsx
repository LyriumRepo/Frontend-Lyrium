'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const SEGMENTS = Array.from({ length: 12 });

/**
 * Genera un contorno cerrado ondulado tipo flor en coordenadas polares:
 * r = R + a1·sin(n·θ + fase) + a2·sin(m·θ) — la segunda onda le da un
 * trazo orgánico, no perfectamente simétrico (como dibujado a mano).
 */
function flowerPath(
  cx: number,
  cy: number,
  baseR: number,
  petals: number,
  amp: number,
  wobbleAmp: number,
  phase = 0,
): string {
  const steps = 120;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r =
      baseR +
      amp * Math.sin(petals * t + phase) +
      wobbleAmp * Math.sin(3 * t + phase * 2);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}

const FLOWER_RINGS_A = [
  flowerPath(100, 100, 72, 7, 9, 3, 0),
  flowerPath(100, 100, 78, 7, 8, 4, 0.9),
  flowerPath(100, 100, 84, 7, 10, 3, 1.7),
];

const FLOWER_RINGS_B = [
  flowerPath(100, 100, 88, 6, 8, 4, 0.4),
  flowerPath(100, 100, 94, 6, 9, 5, 1.3),
];

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const prevPath = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (prevPath.current !== pathname) {
    prevPath.current = pathname;
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(false), 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Contorno floral ondulado — persists, outside key */}
      <style>{`
        @keyframes flower-spin-cw  { from { transform: rotate(0deg); }  to { transform: rotate(360deg); } }
        @keyframes flower-spin-ccw { from { transform: rotate(0deg); }  to { transform: rotate(-360deg); } }
        @keyframes flower-breathe  { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90 dark:opacity-70" style={{ zIndex: -1 }}>
        <div
          className="relative w-[250px] h-[250px] md:w-[290px] md:h-[290px] flex items-center justify-center"
          style={{ animation: 'flower-breathe 4s ease-in-out infinite' }}
        >
          {/* Capa 1: anillos internos girando en sentido horario */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full"
            style={{ animation: 'flower-spin-cw 24s linear infinite' }}
          >
            {FLOWER_RINGS_A.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={i % 2 === 0 ? 'var(--brand-sky)' : 'var(--brand-green)'}
                strokeWidth={1.4}
                strokeLinejoin="round"
                opacity={0.55 - i * 0.12}
              />
            ))}
          </svg>

          {/* Capa 2: anillos externos girando en sentido antihorario */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full"
            style={{ animation: 'flower-spin-ccw 36s linear infinite' }}
          >
            {FLOWER_RINGS_B.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={i % 2 === 0 ? 'var(--brand-green)' : 'var(--brand-sky)'}
                strokeWidth={1.2}
                strokeLinejoin="round"
                opacity={0.35 - i * 0.1}
              />
            ))}
          </svg>

          {/* Soft glow center */}
          <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(229,231,235,0) 30%, rgba(229,231,235,0.25) 70%)' }} />
        </div>
      </div>

      <div className="flex items-center gap-12 md:gap-24">
        {/* Left lines */}
        <div className="hidden md:flex flex-col items-end gap-3">
          <div className="relative w-[134px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div
              className="absolute inset-0 animate-line-sweep"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--brand-sky) 25%, var(--brand-sky) 75%, transparent 100%)',
              }}
            />
          </div>
          <div className="relative w-[78px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div
              className="absolute inset-0 animate-line-sweep-delayed"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--brand-green) 25%, var(--brand-green) 75%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {/* Circle loader with segments */}
        <div className="relative w-[180px] h-[180px] md:w-[210px] md:h-[210px] flex items-center justify-center animate-loader-heartbeat">
          {/* Segments + Logo — keyed, remounts on pathname change */}
          <div key={pathname} className="absolute inset-0 flex items-center justify-center">
            {SEGMENTS.map((_, i) => {
              const angle = i * 30;
              const delay = i * 0.1;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div
                    className="w-[6px] h-[21px] rounded-[3px]"
                    style={{
                      backgroundColor: isEven ? 'var(--brand-sky)' : 'var(--brand-green)',
                      marginLeft: '-3px',
                      marginTop: '-78px',
                      transform: 'rotate(90deg)',
                      animation: `segment-pulse 1.2s ease-in-out ${delay}s infinite`,
                    }}
                  />
                </div>
              );
            })}

            {/* Logo según el tema */}
            <div className="relative w-[115px] h-[115px] md:w-[134px] md:h-[134px] z-10">
              <Image
                src="/img/logolyrium2.png"
                alt="Cargando Lyrium..."
                fill
                className="object-contain block dark:hidden"
                priority
              />
              <Image
                src="/img/iconologo.png"
                alt="Cargando Lyrium..."
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right lines */}
        <div className="hidden md:flex flex-col items-start gap-3">
          <div className="relative w-[134px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div
              className="absolute inset-0 animate-line-sweep"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--brand-sky) 25%, var(--brand-sky) 75%, transparent 100%)',
              }}
            />
          </div>
          <div className="relative w-[78px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div
              className="absolute inset-0 animate-line-sweep-slow"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--brand-green) 25%, var(--brand-green) 75%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
