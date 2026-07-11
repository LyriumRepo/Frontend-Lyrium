'use client';

import { useRef, useEffect, useCallback, useState, type KeyboardEvent, type PointerEvent } from 'react';

const SPEED = 0.5;
const CARD_STEP = 340;
const RESUME_DELAY = 2500;

export function useAutoScrollCarousel(isDuplicated = true) {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pausa manual (botón/tecla) — a diferencia de pausedRef (pausa temporal por
  // hover/interacción), esta no se reanuda sola hasta que el usuario lo pida.
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      pausedRef.current = next;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      return next;
    });
  }, []);

  const getLimit = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.scrollWidth === 0) return 0;
    return isDuplicated ? track.scrollWidth / 2 : track.scrollWidth;
  }, [isDuplicated]);

  const pauseTemporarily = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      // No reanudar si el usuario lo pausó manualmente con el botón/tecla.
      setIsPaused((manuallyPaused) => {
        if (!manuallyPaused) pausedRef.current = false;
        return manuallyPaused;
      });
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

  // Arrastre con mouse/touch — permite deslizar el carrusel además de la
  // rueda del mouse y los botones de flecha.
  const dragRef = useRef<{ startX: number; startPos: number; dragging: boolean }>({
    startX: 0,
    startPos: 0,
    dragging: false,
  });

  const handlePointerDown = useCallback((e: PointerEvent) => {
    dragRef.current = { startX: e.clientX, startPos: posRef.current, dragging: true };
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const limit = getLimit();
    if (limit === 0) return;
    const delta = e.clientX - dragRef.current.startX;
    let current = dragRef.current.startPos - delta;
    current = ((current % limit) + limit) % limit;
    posRef.current = current;
    track.style.transform = `translateX(-${current}px)`;
  }, [getLimit]);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    pauseTemporarily();
  }, [pauseTemporarily]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        shift('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        shift('right');
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        togglePause();
      }
    },
    [shift, togglePause],
  );

  return {
    shift,
    trackRef,
    pausedRef,
    posRef,
    resumeTimerRef,
    pauseTemporarily,
    isPaused,
    togglePause,
    handleKeyDown,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}