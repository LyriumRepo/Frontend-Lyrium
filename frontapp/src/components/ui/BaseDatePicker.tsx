'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface BaseDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
  placeholder?: string;
  buttonClassName?: string;
}

export default function BaseDatePicker({ label, value, onChange, name, className, placeholder, buttonClassName }: BaseDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value + 'T12:00:00') : new Date());
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const selectedDate = value ? new Date(value + 'T12:00:00') : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  /** Calcula la posición usando una altura de calendario dada (estimada o medida). */
  const computePosition = useCallback((calH: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const gap = 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const calW = Math.min(280, vw - 16);
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const opensAbove = spaceBelow < calH + gap && spaceAbove > spaceBelow;
    const top = opensAbove
      ? Math.max(8, rect.top - calH - gap)
      : Math.min(rect.bottom + gap, Math.max(8, vh - calH - 8));
    let left = rect.left + (rect.width - calW) / 2;
    left = Math.max(8, Math.min(left, vw - calW - 8));
    setDropdownPos({ top, left, width: calW });
  }, []);

  // Estimación inicial (sin medir aún el calendario real) — se corrige con
  // la altura real en el useLayoutEffect de abajo antes del primer paint,
  // evitando el flash en top:0/left:0 que causaba el bug de desalineación.
  const updatePosition = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    computePosition(340);
  }, [computePosition]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (calendarRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, updatePosition]);

  // Corrige la posición con la altura REAL del calendario ya montado, antes
  // de que el navegador pinte — la estimación de 340px podía quedar corta
  // (mes con 6 filas de días) y hacer que el calendario se saliera del
  // viewport por arriba cuando se abría "hacia arriba".
  useLayoutEffect(() => {
    if (!isOpen || !calendarRef.current) return;
    computePosition(calendarRef.current.getBoundingClientRect().height);
  }, [isOpen, viewDate, computePosition]);

  useEffect(() => {
    if (value) setViewDate(new Date(value + 'T12:00:00'));
  }, [value]);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfWeek = (y: number, m: number) => {
    const d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDay = (day: number) => {
    onChange(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    setIsOpen(false);
  };

  const selectToday = () => {
    const d = new Date();
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setIsOpen(false);
  };

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isSelected = (day: number) =>
    selectedDate?.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfWeek(year, month);
  const days: (number | null)[] = Array(startOffset).fill(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none transition-all duration-300 cursor-pointer flex items-center gap-2 ${
          buttonClassName || ''
        }`}
      >
        <svg className="w-4 h-4 flex-shrink-0 text-sky-500 dark:text-[var(--icons-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{value ? formatDisplay(value) : (placeholder || 'Seleccionar fecha')}</span>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={calendarRef}
          className="fixed z-[300] bg-sky-50 dark:bg-[#1A3A32] rounded-2xl shadow-2xl border border-gray-200 dark:border-[var(--border-subtle)] p-4"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-sky-200 dark:hover:bg-white/10 rounded-lg transition-colors text-sky-500 dark:text-[var(--icons-green)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-sky-500 dark:text-[var(--icons-green)]">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-sky-200 dark:hover:bg-white/10 rounded-lg transition-colors text-sky-500 dark:text-[var(--icons-green)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider py-1 text-sky-500 dark:text-[var(--icons-green)]">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => (
              <div key={i}>
                {day ? (
                  <button
                    type="button"
                    onClick={() => selectDay(day)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected(day)
                        ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-md'
                        : isToday(day)
                          ? 'bg-sky-100 dark:bg-[var(--brand-green)]/20 text-sky-500 dark:text-[var(--icons-green)] hover:bg-sky-200 dark:hover:bg-[var(--brand-green)]/30'
                          : 'text-gray-700 dark:text-[var(--text-primary)] hover:bg-sky-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-9 h-9" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-[var(--border-subtle)]">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={selectToday}
              className="text-[10px] font-bold text-sky-500 dark:text-[var(--icons-green)] hover:underline transition-colors cursor-pointer ml-auto"
            >
              Hoy
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
