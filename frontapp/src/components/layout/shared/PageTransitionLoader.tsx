'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const SEGMENTS = Array.from({ length: 12 });

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
      {/* Cloud drift — persists, outside key */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90 dark:opacity-65" style={{ zIndex: -1 }}>
        <div className="relative w-[200px] h-[200px] md:w-[230px] md:h-[230px] flex items-center justify-center">
          {/* Layer 1: inner cloud bands (forward) */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full"
            style={{ animation: 'cloud-drift-a 6s ease-in-out infinite' }}
          >
            <defs>
              <filter id="blurCloud">
                <feGaussianBlur stdDeviation="3.5" />
              </filter>
              <filter id="blurCloudWide">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* Inner bands — 8 cloud puffs, fanned 45° apart around the center */}
            {[0,45,90,135,180,225,270,315].map(angle => (
              <g key={angle} transform={`rotate(${angle} 100 100)`}>
                <path
                  d="M100,100 C108,88 124,76 142,72 C156,68 168,76 168,90 C168,104 156,114 140,116 C126,118 112,110 100,100 Z"
                  className="fill-gray-200 dark:fill-gray-500" filter="url(#blurCloud)" opacity="0.6"
                />
              </g>
            ))}

            {/* Middle bands — 6, rotated 60°, offset 22.5° from inner */}
            {[22.5,82.5,142.5,202.5,262.5,322.5].map(angle => (
              <g key={angle} transform={`rotate(${angle} 100 100)`}>
                <path
                  d="M100,100 C112,82 138,64 162,58 C178,54 190,68 190,88 C190,108 176,122 158,124 C138,126 116,114 100,100 Z"
                  className="fill-gray-200 dark:fill-gray-500" filter="url(#blurCloud)" opacity="0.45"
                />
              </g>
            ))}
          </svg>

          {/* Layer 2: outer cloud bands (reverse, more diffuse) */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full scale-110"
            style={{ animation: 'cloud-drift-b 9s ease-in-out infinite' }}
          >
            {/* Outer bands — 5, rotated 72°, wider and more blurred */}
            {[0,72,144,216,288].map(angle => (
              <g key={angle} transform={`rotate(${angle} 100 100)`}>
                <path
                  d="M100,100 C118,68 155,44 182,38 C200,34 210,58 208,86 C206,114 185,134 158,136 C130,138 110,118 100,100 Z"
                  className="fill-gray-200 dark:fill-gray-500" filter="url(#blurCloudWide)" opacity="0.35"
                />
              </g>
            ))}
          </svg>

          {/* Soft glow center */}
          <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(229,231,235,0) 25%, rgba(229,231,235,0.4) 65%)' }} />
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
