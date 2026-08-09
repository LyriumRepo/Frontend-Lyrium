'use client';

import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

// El dropdown se renderiza vía portal a #modal-root (mismo nodo que usa
// BaseModal), no como hijo del trigger. Ningún ancestro entre el trigger y la
// raíz del documento puede recortarlo (overflow-hidden, overflow-auto con
// scroll interno, stacking contexts creados por transform/filter, etc.) —
// exactamente la clase de bug que antes lo cortaba dentro de tablas/paneles
// con su propio scroll. Se posiciona con `position: fixed` calculado desde
// el bounding rect del trigger, así que solo compite contra el viewport.

interface LyriumOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface LyriumSelectProps {
  label?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: LyriumOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  className?: string;
}

export default function LyriumSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  error,
  searchable = false,
  className = '',
}: LyriumSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [openUpward, setOpenUpward] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('modal-root') ?? document.body); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, searchable, search]);

  const highlightUp = useCallback(() => {
    setHighlightedIndex((prev) => {
      const enabled = filteredOptions
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => !o.disabled);
      if (enabled.length === 0) return -1;
      const currentRank = enabled.findIndex((e) => e.i === prev);
      if (currentRank <= 0) return enabled[enabled.length - 1].i;
      return enabled[currentRank - 1].i;
    });
  }, [filteredOptions]);

  const highlightDown = useCallback(() => {
    setHighlightedIndex((prev) => {
      const enabled = filteredOptions
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => !o.disabled);
      if (enabled.length === 0) return -1;
      const currentRank = enabled.findIndex((e) => e.i === prev);
      if (currentRank >= enabled.length - 1) return enabled[0].i;
      return enabled[currentRank + 1].i;
    });
  }, [filteredOptions]);

  const selectHighlighted = useCallback(() => {
    if (highlightedIndex >= 0 && !filteredOptions[highlightedIndex]?.disabled) {
      onChange(filteredOptions[highlightedIndex].value);
      setOpen(false);
      setSearch('');
    }
  }, [highlightedIndex, filteredOptions, onChange]);

  // Posiciona el dropdown (portal a #modal-root, `position: fixed`) contra el
  // trigger, y decide si abre hacia abajo o arriba según espacio de viewport.
  // Como vive fuera del árbol del trigger, el único límite real es la pantalla
  // — ya no hay overflow-hidden/scroll de ningún ancestro que pueda cortarlo.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = containerRef.current;
    if (!trigger) return;

    const raf = requestAnimationFrame(() => {
      const triggerRect = trigger.getBoundingClientRect();
      // dropdownRef.current es SIEMPRE null en la primera apertura: el
      // dropdown solo existe en el DOM una vez que `coords` está seteado, y
      // `coords` es justo lo que este efecto calcula (dependencia circular).
      // Medir con offsetHeight ahí da 0 -> spaceBelow < 0 nunca es cierto ->
      // "flip" nunca se activa la primera vez, el dropdown abre siempre hacia
      // abajo aunque no entre, y queda cortado contra el borde del viewport
      // sin forma de hacer scroll para verlo. Se estima el alto real a partir
      // del contenido (determinístico, no depende de haber montado antes) y
      // se usa esa estimación — nunca la medición del ref — para decidir.
      const SEARCH_BOX_H = 54;
      const OPTION_ROW_H = 38;
      const EMPTY_ROW_H = 72;
      const CHROME_H = 10;
      const listHeight = filteredOptions.length === 0
        ? EMPTY_ROW_H
        : Math.min(filteredOptions.length * OPTION_ROW_H, 240);
      const dropdownHeight = (searchable ? SEARCH_BOX_H : 0) + listHeight + CHROME_H;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const flip = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      // El trigger puede vivir en columnas angostas (grids de 3, modales
      // divididos en 2 columnas). Si el dropdown hereda ese mismo ancho,
      // las etiquetas de las opciones (ej. nombres de departamentos) se
      // truncan y el popup se ve roto. Se le da un ancho mínimo legible y
      // se ancla al trigger, recortando contra el viewport si no entra.
      const viewportMargin = 8;
      const width = Math.max(triggerRect.width, 220);
      let left = triggerRect.left;
      if (left + width > window.innerWidth - viewportMargin) {
        left = window.innerWidth - width - viewportMargin;
      }
      if (left < viewportMargin) left = viewportMargin;

      // Clamp final contra el viewport: cubre el caso extremo en que ni
      // arriba ni abajo hay espacio suficiente para el alto estimado (ej.
      // viewport muy bajo) — nunca debe quedar con top negativo ni empujado
      // más allá del borde inferior.
      let top = flip ? triggerRect.top - dropdownHeight - 6 : triggerRect.bottom + 6;
      top = Math.max(viewportMargin, Math.min(top, window.innerHeight - viewportMargin - dropdownHeight));

      setOpenUpward(flip);
      setCoords({
        top,
        left,
        width,
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [open, filteredOptions.length, searchable]);

  // El scroll de CUALQUIER ancestro (o el propio viewport) puede desplazar al
  // trigger sin que este componente se entere directamente. Como el dropdown
  // ahora es `position: fixed` fuera del flujo, cerrarlo en scroll evita que
  // quede "flotando" desconectado del trigger — mismo comportamiento que un
  // <select> nativo.
  useEffect(() => {
    if (!open) return;
    const lastScrollY = window.scrollY;
    const onScroll = () => {
      if (window.scrollY !== lastScrollY) {
        setOpen(false);
        setSearch('');
      }
    };
    const onResize = () => { setOpen(false); setSearch(''); };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // Close on click outside (el dropdown vive en un portal, fuera de
  // containerRef, así que también hay que comprobar dentro de dropdownRef)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search input when opened in searchable mode
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  // Reset highlight when opening
  useEffect(() => {
    if (open) {
      const idx = filteredOptions.findIndex((o) => o.value === value);
      setHighlightedIndex(idx >= 0 ? idx : -1);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'Escape':
        setOpen(false);
        setSearch('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          highlightDown();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) highlightUp();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open) {
          selectHighlighted();
        } else {
          setOpen(true);
        }
        break;
      case 'Tab':
        setOpen(false);
        setSearch('');
        break;
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) setOpen((v) => !v);
          }}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2 px-4 py-3
            bg-[var(--bg-secondary)] border rounded-2xl
            text-sm font-bold outline-none transition-all duration-200
            ${
              error
                ? 'border-red-500 ring-2 ring-red-500/10'
                : 'border-[var(--border-subtle)] focus:border-[var(--brand-sky)]/30 dark:focus:border-[var(--icons-green)]/30 focus:ring-2 focus:ring-[var(--brand-sky)]/10 dark:focus:ring-[var(--icons-green)]/10'
            }
            ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:border-[var(--brand-sky)]/40 dark:hover:border-[var(--icons-green)]/40'
            }
          `}
        >
          <span
            className={`truncate ${
              selectedOption
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown — portal a #modal-root, fuera del flujo/overflow del trigger */}
        {open && !disabled && portalNode && coords && createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width }}
            className={`
              z-[100010]
              bg-[var(--bg-card)] border border-[var(--border-subtle)]
              rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)]
              dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]
              overflow-hidden
              ${openUpward ? 'animate-[slideUp_150ms_ease-out]' : 'animate-[slideDown_150ms_ease-out]'}
            `}
          >
            {/* Search input */}
            {searchable && (
              <div className="px-3 pt-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar..."
                    className="
                      w-full pl-8 pr-7 py-2 text-sm
                      bg-[var(--bg-secondary)] border border-[var(--border-subtle)]
                      rounded-xl outline-none
                      text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                      focus:border-[var(--brand-sky)]/30 dark:focus:border-[var(--icons-green)]/30
                      transition-colors
                    "
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options list */}
            <div ref={listRef} className="max-h-[240px] overflow-y-auto scrollbar-none py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-sm text-[var(--text-muted)] text-center">
                  Sin resultados
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = filteredOptions.indexOf(opt) === highlightedIndex;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        if (!opt.disabled) {
                          onChange(opt.value);
                          setOpen(false);
                          setSearch('');
                        }
                      }}
                      onMouseEnter={() => setHighlightedIndex(filteredOptions.indexOf(opt))}
                      className={`
                        w-full px-4 py-2.5 text-sm text-left transition-colors
                        flex items-center gap-2
                        ${
                          opt.disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer'
                        }
                        ${
                          isSelected
                            ? 'font-semibold text-[var(--brand-sky)] dark:text-[var(--icons-green)] bg-[var(--brand-sky)]/5 dark:bg-[var(--icons-green)]/8'
                            : isHighlighted
                              ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                        }
                      `}
                    >
                      <span className="truncate flex-1">{opt.label}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-sky)] dark:bg-[var(--icons-green)] shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          portalNode,
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{error}</p>
      )}
    </div>
  );
}
