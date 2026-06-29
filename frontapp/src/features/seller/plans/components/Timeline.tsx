'use client';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { availableIcons } from '@/features/seller/plans/lib/icons';
import type { PlansMap } from '@/features/seller/plans/types';

interface Props {
  planOrder: string[]; plansData: PlansMap; activePlan: string;
  suffix: 'MyPlan' | 'Plans'; onPointClick: (plan: string) => void;
}

const TL_VISIBLE = 3;

export default function Timeline({ planOrder, plansData, activePlan, suffix, onPointClick }: Props) {
  const offsetRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const leftBtnRef = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);
  const onClickRef  = useRef(onPointClick);
  onClickRef.current = onPointClick;

  const n = planOrder.length;
  const idx = planOrder.indexOf(activePlan);

  const applyScroll = useCallback(() => {
    const track = trackRef.current; if (!track) return;
    track.style.transform = `translateX(${-(offsetRef.current / n) * 100}%)`;
  }, [n]);

  const updateArrows = useCallback(() => {
    const max = Math.max(0, n - TL_VISIBLE);
    const leftBtn = leftBtnRef.current;
    const rightBtn = rightBtnRef.current;
    if (n <= TL_VISIBLE) {
      leftBtn?.classList.add('opacity-0', 'pointer-events-none');
      rightBtn?.classList.add('opacity-0', 'pointer-events-none');
      return;
    }
    leftBtn?.classList.toggle('opacity-0', offsetRef.current <= 0);
    leftBtn?.classList.toggle('pointer-events-none', offsetRef.current <= 0);
    rightBtn?.classList.toggle('opacity-0', offsetRef.current >= max);
    rightBtn?.classList.toggle('pointer-events-none', offsetRef.current >= max);
  }, [n]);

  useEffect(() => {
    const track = trackRef.current; if (!track) return;
    track.style.width = `${(n / TL_VISIBLE) * 100}%`;
    const halfStep = (100 / n) / 2;
    const line = track.querySelector<HTMLElement>('.timeline-line');
    if (line) { line.style.left = `${halfStep}%`; line.style.right = `${halfStep}%`; }
    updateArrows();
  }, [n, updateArrows]);

  useEffect(() => {
    if (idx === -1) return;
    const max = Math.max(0, n - TL_VISIBLE);
    offsetRef.current = Math.max(0, Math.min(max, idx - Math.floor(TL_VISIBLE / 2)));
    applyScroll();
    updateArrows();
  }, [activePlan, planOrder, idx, n, applyScroll, updateArrows]);

  useEffect(() => {
    const el = progressRef.current; if (!el || n <= 1) return;
    const halfStep = (1 / (2 * n)) * 100;
    const trackRange = 100 - 2 * halfStep;
    const progress = idx < 0 ? 0 : (idx / (n - 1));
    const firstColor = plansData[planOrder[0]]?.cssColor ?? '#14b8a6';
    const thisColor = plansData[activePlan]?.cssColor ?? firstColor;
    el.style.left = `${halfStep}%`;
    el.style.width = `${progress * trackRange}%`;
    el.style.background = `linear-gradient(90deg, ${firstColor}, ${thisColor})`;
  }, [activePlan, planOrder, plansData, n, idx]);

  const scrollTimeline = (dir: number) => {
    const max = Math.max(0, n - TL_VISIBLE);
    offsetRef.current = Math.max(0, Math.min(max, offsetRef.current + dir));
    applyScroll(); updateArrows();
  };

  const points = useMemo(() => planOrder.map(key => {
    const data = plansData[key];
    const iconKey = (data?.timelineIcon && availableIcons[data.timelineIcon]) ? data.timelineIcon : 'star';
    return { key, data, iconKey };
  }), [planOrder, plansData]);

  return (
    <div className="flex items-center gap-2 my-5 px-1 relative">
      <button ref={leftBtnRef} className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700 opacity-0 pointer-events-none z-10"
        onClick={() => scrollTimeline(-1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div className="flex-1 overflow-hidden min-w-0 py-3">
        <div ref={trackRef} className="flex items-start relative transition-transform duration-300 cubic-bezier(0.4,0,0.2,1)">
          <div className="absolute top-[30px] h-[3px] bg-gray-200 dark:bg-gray-700 rounded-full pointer-events-none timeline-line" style={{ left: '0', right: '0' }} />
          <div ref={progressRef} className="absolute top-[30px] h-[3px] rounded-full pointer-events-none transition-all duration-300 cubic-bezier(0.4,0,0.2,1)" style={{ width: '0%', left: '0%' }} />
          <div className="flex relative z-10 w-full">
            {points.map(({ key, data, iconKey }) => {
              const isActive = key === activePlan;
              const color = plansData[key]?.cssColor ?? '#14b8a6';
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={key}
                  className="flex flex-col items-center gap-2.5 cursor-pointer transition-all flex-1"
                  data-plan={key}
                  onClick={() => onClickRef.current(key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClickRef.current(key); }}
                >
                  <div
                    className="w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-all duration-300"
                    style={isActive
                      ? { background: color, borderColor: color, color: '#fff', boxShadow: `0 0 0 4px ${color}22` }
                      : { background: 'white', borderColor: '#e5e7eb', color: '#9ca3af' }
                    }
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      dangerouslySetInnerHTML={{ __html: availableIcons[iconKey] }} />
                  </div>
                  <span className={`text-[11px] font-semibold text-center max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap ${isActive ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{data?.name ?? key}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button ref={rightBtnRef} className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700 opacity-0 pointer-events-none z-10"
        onClick={() => scrollTimeline(1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}
