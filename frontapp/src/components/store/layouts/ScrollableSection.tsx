'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';

interface ScrollableSectionProps {
  children: ReactNode;
  visibleRows: number;
  className?: string;
}

export default function ScrollableSection({ children, visibleRows, className = '' }: ScrollableSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const calc = () => {
      const grid = el.firstElementChild;
      if (!grid || grid.children.length === 0) {
        setMaxH(undefined);
        return;
      }

      const firstItem = grid.children[0] as HTMLElement;
      if (!firstItem) {
        setMaxH(undefined);
        return;
      }

      const rowHeight = firstItem.getBoundingClientRect().height;
      const gap = 16;
      setMaxH(visibleRows * rowHeight + (visibleRows - 1) * gap);
    };

    calc();

    const observer = new ResizeObserver(calc);
    observer.observe(el);
    if (el.firstElementChild) {
      observer.observe(el.firstElementChild);
    }

    return () => observer.disconnect();
  }, [visibleRows]);

  return (
    <div
      ref={ref}
      className={`custom-scrollbar ${className}`}
      style={{
        maxHeight: maxH !== undefined ? `${maxH}px` : undefined,
        overflowY: maxH !== undefined ? 'auto' : undefined,
      }}
    >
      {children}
    </div>
  );
}
