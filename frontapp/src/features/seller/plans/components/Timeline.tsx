'use client';
// FIXED: botones usan useRef (no getElementById) → evita colisiones con 2 Timelines en la misma página
// FIXED: updateArrows() se llama al montar Y cuando cambia activePlan
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { availableIcons } from '@/features/seller/plans/lib/icons';
import type { PlansMap } from '@/features/seller/plans/types';

interface Props {
  planOrder: string[]; plansData: PlansMap; activePlan: string;
  suffix: 'MyPlan' | 'Plans'; onPointClick: (plan: string) => void;
}

const TL_VISIBLE = 3;

export default function Timeline({ planOrder, plansData, activePlan, suffix, onPointClick }: Props) {
  const offsetRef   = useRef(0);
  const trackRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const leftBtnRef  = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);
  const onClickRef  = useRef(onPointClick);
  onClickRef.current = onPointClick;

  const n   = planOrder.length;
  const idx = planOrder.indexOf(activePlan);

  // ── Helpers — siempre usan refs, nunca getElementById ──────────────────
  const applyScroll = useCallback(() => {
    const track = trackRef.current; if (!track) return;
    track.style.transform = `translateX(${-(offsetRef.current / n) * 100}%)`;
  }, [n]);

  const updateArrows = useCallback(() => {
    const max      = Math.max(0, n - TL_VISIBLE);
    const leftBtn  = leftBtnRef.current;
    const rightBtn = rightBtnRef.current;
    if (n <= TL_VISIBLE) {
      leftBtn?.classList.add('tl-hidden');
      rightBtn?.classList.add('tl-hidden');
      return;
    }
    leftBtn?.classList.toggle('tl-hidden',  offsetRef.current <= 0);
    rightBtn?.classList.toggle('tl-hidden', offsetRef.current >= max);
  }, [n]);

  // ── Track width + inicialización de flechas ─────────────────────────────
  useEffect(() => {
    const track = trackRef.current; if (!track) return;
    track.style.width = `${(n / TL_VISIBLE) * 100}%`;
    const halfStep = (100 / n) / 2;
    const line = track.querySelector<HTMLElement>('.timeline-line');
    if (line) { line.style.left = `${halfStep}%`; line.style.right = `${halfStep}%`; }
    updateArrows();
  }, [n, updateArrows]);

  // ── Centrar en plan activo ───────────────────────────────────────────────
  useEffect(() => {
    if (idx === -1) return;
    const max = Math.max(0, n - TL_VISIBLE);
    offsetRef.current = Math.max(0, Math.min(max, idx - Math.floor(TL_VISIBLE / 2)));
    applyScroll();
    updateArrows();
  }, [activePlan, planOrder, idx, n, applyScroll, updateArrows]);

  // ── Barra de progreso ────────────────────────────────────────────────────
  useEffect(() => {
    const el = progressRef.current; if (!el || n <= 1) return;
    // halfStep = el porcentaje del centro del primer/último punto dentro del track
    const halfStep   = (1 / (2 * n)) * 100;
    const trackRange = 100 - 2 * halfStep;           // rango entre primer y último centro
    const progress   = idx < 0 ? 0 : (idx / (n - 1));
    const firstColor = plansData[planOrder[0]]?.cssColor ?? '#cee86b';
    const thisColor  = plansData[activePlan]?.cssColor  ?? firstColor;
    el.style.left       = `${halfStep}%`;
    el.style.width      = `${progress * trackRange}%`;
    el.style.background = `linear-gradient(90deg, ${firstColor}, ${thisColor})`;
  }, [activePlan, planOrder, plansData, n, idx]);

  const scrollTimeline = (dir: number) => {
    const max = Math.max(0, n - TL_VISIBLE);
    offsetRef.current = Math.max(0, Math.min(max, offsetRef.current + dir));
    applyScroll(); updateArrows();
  };

  const points = useMemo(() => planOrder.map(key => {
    const data    = plansData[key];
    const iconKey = (data?.timelineIcon && availableIcons[data.timelineIcon]) ? data.timelineIcon : 'star';
    return { key, data, iconKey };
  }), [planOrder, plansData]);

  return (
    <div className="flex items-center gap-2 my-5 px-1 relative">
      <div className="flex-1 overflow-hidden min-w-0 py-2" id={`tlViewport${suffix}`}>
        <div className="flex items-start relative transition-transform duration-300" style={{ width: `${(n / TL_VISIBLE) * 100}%` }} ref={trackRef}>
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 dark:bg-[var(--border-subtle)] rounded-full pointer-events-none" id={`tlLine${suffix}`} />
          <div className="absolute top-8 left-0 h-1 rounded-full transition-all duration-300 pointer-events-none" id={`timelineProgress${suffix}`} ref={progressRef} style={{ width: '0%' }} />
          <div className="flex relative z-10 w-full" id={`timelinePoints${suffix}`}>
            {points.map(({ key, data, iconKey }) => {
              const isActive = key === activePlan;
              const color    = plansData[key]?.cssColor ?? '';
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={key}
                  className={`flex flex-col items-center gap-3 cursor-pointer transition-all flex-1 ${isActive ? '' : ''}`}
                  data-plan={key}
                  onClick={() => onClickRef.current(key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClickRef.current(key); }}
                >
                  <div
                    className={`w-16 h-16 rounded-full border-3 flex items-center justify-center transition-all duration-400 ${isActive ? '' : 'bg-white dark:bg-[var(--bg-card)] border-gray-300 dark:border-[var(--border-subtle)] text-gray-400 dark:text-[var(--text-muted)]'}`}
                    style={isActive ? { background: color, borderColor: color, color: '#fff' } : {}}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      // ✅ SEGURO: availableIcons mapea a SVG hardcoded interno
                      dangerouslySetInnerHTML={{ __html: availableIcons[iconKey] }} />
                  </div>
                  <span className={`text-xs font-semibold text-center max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap ${isActive ? 'text-gray-800 dark:text-[var(--text-primary)] font-bold' : 'text-gray-400 dark:text-[var(--text-muted)]'}`}>{data?.name ?? key}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <button ref={leftBtnRef} id={`tlArrowLeft${suffix}`} className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-gray-400 dark:text-[var(--text-muted)] flex items-center justify-center cursor-pointer transition-all duration-250 shadow-sm z-20 hover:border-blue-400 hover:text-blue-500 dark:hover:border-[var(--brand-sky)] dark:hover:text-[var(--brand-sky)] opacity-0 pointer-events-none" onClick={() => scrollTimeline(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button ref={rightBtnRef} id={`tlArrowRight${suffix}`} className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-gray-400 dark:text-[var(--text-muted)] flex items-center justify-center cursor-pointer transition-all duration-250 shadow-sm z-20 hover:border-blue-400 hover:text-blue-500 dark:hover:border-[var(--brand-sky)] dark:hover:text-[var(--brand-sky)] opacity-0 pointer-events-none" onClick={() => scrollTimeline(1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
