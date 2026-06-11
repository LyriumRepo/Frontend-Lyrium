'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPopoverProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  rangeStart?: string | null;
  rangeEnd?: string | null;
}

const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPopover({ value, onChange, onClose, triggerRef, rangeStart, rangeEnd }: CalendarPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320 });

  const selectedDate = value ? new Date(value + 'T12:00:00') : null;
  const [currentMonth, setCurrentMonth] = useState(() => selectedDate || new Date());

  useEffect(() => {
    const updatePos = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(320, Math.min(360, rect.width)) });
    };
    updatePos();
    window.addEventListener('scroll', updatePos, { passive: true });
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
    };
  }, [triggerRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', (e) => {
        if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
          onClose();
        }
      });
      document.addEventListener('keydown', handleKeyDown);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const today = new Date();
  const todayStr = getDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const handleDayClick = (day: number) => {
    onChange(getDateStr(year, month, day));
    onClose();
  };

  const goToToday = () => { onChange(todayStr); onClose(); };
  const clearDate = () => { onChange(''); onClose(); };

  const isBetween = (ds: string) => rangeStart && rangeEnd && ds > rangeStart && ds < rangeEnd;

  const navCls = 'w-8 h-8 rounded-xl hover:bg-blue-100 dark:hover:bg-[#66D6A8]/10 text-[#69BEEB] dark:text-[#66D6A8] flex items-center justify-center transition-colors';
  const weekCls = 'text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase py-1 select-none';
  const hoyCls = 'text-[11px] font-bold text-[#5AAFE6] dark:text-[#4EC7B8] hover:text-[#69BEEB] dark:hover:text-[#66D6A8] transition-colors px-3 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-[#66D6A8]/10';

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[99999] bg-white dark:bg-[#182420] rounded-2xl shadow-lg border border-[#69BEEB]/20 dark:border-[#66D6A8]/10 overflow-hidden"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className={navCls}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 select-none">
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className={navCls}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 px-4 pb-1">
        {WEEKDAYS.map(d => <div key={d} className={weekCls}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 px-4 pb-3">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const ds = getDateStr(year, month, day);
          const selected = value && ds === value;
          const todayMatch = ds === todayStr;
          const edge = ds === rangeStart || ds === rangeEnd;
          const between = isBetween(ds);

          return (
            <button
              key={ds}
              onClick={() => handleDayClick(day)}
              className={`relative w-full aspect-square rounded-xl text-xs font-bold transition-all ${
                selected
                  ? 'bg-gradient-to-br from-[#69BEEB] to-[#5AAFE6] dark:from-[#66D6A8] dark:to-[#4EC7B8] text-white shadow-md'
                  : edge
                    ? 'bg-[#69BEEB]/70 dark:bg-[#66D6A8]/70 text-white'
                    : between
                      ? 'bg-[#69BEEB]/15 dark:bg-[#66D6A8]/15 text-[#5AAFE6] dark:text-[#66D6A8]'
                      : todayMatch
                        ? 'text-[#69BEEB] dark:text-[#66D6A8] ring-1 ring-[#69BEEB]/40 dark:ring-[#66D6A8]/40'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
        <button onClick={goToToday} className={hoyCls}>Hoy</button>
        <button onClick={clearDate} className="text-[11px] font-bold text-gray-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10">Borrar</button>
      </div>
    </div>,
    document.body
  );
}
