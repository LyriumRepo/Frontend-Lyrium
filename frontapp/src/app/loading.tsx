import Image from 'next/image';

const SEGMENTS = Array.from({ length: 12 });

export default function RootLoading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
    >
      <div className="flex items-center gap-12 md:gap-24">
        {/* Left lines */}
        <div className="hidden md:flex flex-col items-end gap-3">
          <div className="relative w-[134px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div className="absolute inset-0 animate-line-sweep" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--brand-sky) 25%, var(--brand-sky) 75%, transparent 100%)' }} />
          </div>
          <div className="relative w-[78px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div className="absolute inset-0 animate-line-sweep-delayed" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--brand-green) 25%, var(--brand-green) 75%, transparent 100%)' }} />
          </div>
        </div>

        {/* Circle loader with segments */}
        <div className="relative w-[180px] h-[180px] md:w-[210px] md:h-[210px] flex items-center justify-center animate-loader-heartbeat">
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

        {/* Right lines */}
        <div className="hidden md:flex flex-col items-start gap-3">
          <div className="relative w-[134px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div className="absolute inset-0 animate-line-sweep" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--brand-sky) 25%, var(--brand-sky) 75%, transparent 100%)' }} />
          </div>
          <div className="relative w-[78px] h-[4px] rounded-full overflow-hidden bg-white/15 dark:bg-white/8">
            <div className="absolute inset-0 animate-line-sweep-slow" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--brand-green) 25%, var(--brand-green) 75%, transparent 100%)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
