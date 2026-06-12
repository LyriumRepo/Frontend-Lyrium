'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BaseDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
  placeholder?: string;
}

export default function BaseDatePicker({ label, value, onChange, name, className, placeholder }: BaseDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value + 'T12:00:00') : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T12:00:00') : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-none rounded-2xl text-xs font-mono cursor-pointer outline-none flex items-center gap-2.5 transition-all hover:brightness-95"
        style={value ? { color: '#059669' } : { color: 'var(--text-muted)' }}
      >
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{value ? formatDisplay(value) : (placeholder || 'Seleccionar fecha')}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-[var(--border-subtle)] p-4 w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
              <svg className="w-4 h-4" style={{ color: '#065F46' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold" style={{ color: '#065F46' }}>{monthNames[month]} {year}</span>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
              <svg className="w-4 h-4" style={{ color: '#065F46' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider py-1" style={{ color: '#047857' }}>{d}</div>
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
                        ? 'text-white shadow-md'
                        : isToday(day)
                          ? 'hover:brightness-95'
                          : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                    style={{
                      backgroundColor: isSelected(day) ? '#065F46' : isToday(day) ? '#d1fae5' : 'transparent',
                      color: isSelected(day) ? '#fff' : isToday(day) ? '#065F46' : 'var(--text-primary)',
                    }}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-9 h-9" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-subtle)]">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[10px] font-bold transition-colors cursor-pointer"
                style={{ color: '#f87171' }}
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={selectToday}
              className="text-[10px] font-bold transition-colors cursor-pointer ml-auto"
              style={{ color: '#059669' }}
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
