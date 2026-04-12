'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SliderOptions {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  infinite?: boolean;
}

export function useSlider(options: SliderOptions = {}) {
  const {
    autoPlay = false,
    autoPlayInterval = 5000,
    showDots = true,
    showArrows = true,
    infinite = true,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = useRef(0);

  const goTo = useCallback((index: number) => {
    if (totalSlides.current === 0) return;
    if (infinite) {
      const normalizedIndex = ((index % totalSlides.current) + totalSlides.current) % totalSlides.current;
      setCurrentIndex(normalizedIndex);
    } else {
      setCurrentIndex(Math.max(0, Math.min(index, totalSlides.current - 1)));
    }
  }, [infinite]);

  const next = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const prev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (isPlaying && autoPlay && totalSlides.current > 1) {
      intervalRef.current = setInterval(() => {
        next();
      }, autoPlayInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, autoPlay, autoPlayInterval, next]);

  return {
    currentIndex,
    isPlaying,
    goTo,
    next,
    prev,
    play,
    pause,
    showDots,
    showArrows,
    containerRef,
    setTotalSlides: (count: number) => { totalSlides.current = count; },
  };
}
