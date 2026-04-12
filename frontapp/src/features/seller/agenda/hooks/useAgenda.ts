'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgendaEvent } from '../types';
import { MOCK_ORDERS, MOCK_APPOINTMENTS, MOCK_SPECIALISTS, buildUnifiedEvents } from '../mock';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export function generateCalendarDays(currentMonth: Date) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const calendarCells: { day: number; date: Date; isOtherMonth: boolean }[] = [];

    for (let i = firstDay; i > 0; i--) {
        calendarCells.push({ day: prevMonthDays - i + 1, date: new Date(year, month - 1, prevMonthDays - i + 1), isOtherMonth: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        calendarCells.push({ day: i, date: new Date(year, month, i), isOtherMonth: false });
    }

    const remaining = 42 - calendarCells.length;
    for (let i = 1; i <= remaining; i++) {
        calendarCells.push({ day: i, date: new Date(year, month + 1, i), isOtherMonth: true });
    }

    return calendarCells;
}

export function useAgenda() {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 1, 1));

    const { data: events = [], isLoading } = useQuery({
        queryKey: ['seller', 'agenda'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return buildUnifiedEvents(MOCK_ORDERS, MOCK_APPOINTMENTS, MOCK_SPECIALISTS) as AgendaEvent[];
            }
            try {
                return buildUnifiedEvents(MOCK_ORDERS, MOCK_APPOINTMENTS, MOCK_SPECIALISTS) as AgendaEvent[];
            } catch (e) {
                console.warn('FALLBACK: Agenda events pendiente');
                return buildUnifiedEvents(MOCK_ORDERS, MOCK_APPOINTMENTS, MOCK_SPECIALISTS) as AgendaEvent[];
            }
        },
        staleTime: 10 * 60 * 1000,
    });

    const nextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        setCurrentMonth(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(prev.getMonth() - 1);
        setCurrentMonth(prev);
    };

    return {
        events,
        currentMonth,
        isLoading,
        nextMonth,
        prevMonth
    };
}
