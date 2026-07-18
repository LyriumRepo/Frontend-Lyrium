'use client';

import { useRef, useEffect, useCallback } from 'react';

const SPEED = 0.5;
const CARD_STEP = 340;
const RESUME_DELAY = 2500;

export function useAutoScrollCarousel(isDuplicated = true) {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getLimit = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.scrollWidth === 0) return 0;
    return isDuplicated ? track.scrollWidth / 2 : track.scrollWidth;
  }, [isDuplicated]);

  const pauseTemporarily = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY);
  }, []);

  const shift = useCallback((direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track || track.scrollWidth === 0) return;
    pauseTemporarily();
    const limit = getLimit();
    if (limit === 0) return;
    let next = posRef.current + (direction === 'right' ? CARD_STEP : -CARD_STEP);
    if (next < 0) next += limit;
    if (next >= limit) next -= limit;
    const start = posRef.current;
    const diff = next - start;
    const adjustedDiff = Math.abs(diff) > limit / 2 ? (diff > 0 ? diff - limit : diff + limit) : diff;
    const duration = 300;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      let current = start + adjustedDiff * ease;
      if (current < 0) current += limit;
      if (current >= limit) current -= limit;
      posRef.current = current;
      track.style.transform = `translateX(-${current}px)`;
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [pauseTemporarily, getLimit]);

  useEffect(() => {
    const step = () => {
      const track = trackRef.current;
      if (track && track.scrollWidth > 0) {
        if (!pausedRef.current && isDuplicated) {
          posRef.current += SPEED;
          const limit = getLimit();
          if (limit > 0 && posRef.current >= limit) posRef.current = 0;
          track.style.transform = `translateX(-${posRef.current}px)`;
        }
      } else {
        posRef.current = 0;
      }
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [getLimit, isDuplicated]);

  return { shift, trackRef, pausedRef, posRef, resumeTimerRef, pauseTemporarily };
}