'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';

interface ScrollableSectionProps {
  children: ReactNode;
  visibleRows: number;
  className?: string;
  /** Se llama con el alto real (px) de una fila de la grilla, cada vez que se recalcula. */
  onRowHeight?: (rowHeight: number) => void;
  /** Se llama con el alto real total (px) del contenido de la grilla (todas las filas, sin el cap de visibleRows). */
  onContentHeight?: (contentHeight: number) => void;
}

export default function ScrollableSection({ children, visibleRows, className = '', onRowHeight, onContentHeight }: ScrollableSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<number | undefined>(undefined);
  const onRowHeightRef = useRef(onRowHeight);
  onRowHeightRef.current = onRowHeight;
  const onContentHeightRef = useRef(onContentHeight);
  onContentHeightRef.current = onContentHeight;

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

      // Solo reportar la altura de fila cuando el hijo medido es realmente
      // la grilla de tarjetas (clase `grid` de Tailwind) y no el estado vacío
      // (EmptyStoreState), que no tiene esa clase.
      if (rowHeight > 0 && grid.classList.contains('grid')) {
        onRowHeightRef.current?.(rowHeight);
        onContentHeightRef.current?.((grid as HTMLElement).scrollHeight);
      }
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
      className={`green-scrollbar ${className}`}
      style={{
        maxHeight: maxH !== undefined ? `${maxH}px` : undefined,
        overflowY: maxH !== undefined ? 'auto' : undefined,
      }}
    >
      {children}
    </div>
  );
}
