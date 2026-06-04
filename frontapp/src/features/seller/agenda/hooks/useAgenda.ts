'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AgendaEvent, AgendaResponse, AgendaFilterType } from '../types';

const API_BASE = '/backend/api';

function getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('laravel_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

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
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [filterType, setFilterType] = useState<AgendaFilterType>('all');

    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();

    const queryKey = ['seller', 'agenda', month, year, filterType];

    const { data: response, isLoading, isFetching } = useQuery<AgendaResponse>({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams({
                month: String(month),
                year: String(year),
                type: filterType,
                per_page: '500',
            });
            const res = await fetch(`${API_BASE}/seller/agenda?${params}`, {
                headers: { ...getAuthHeaders(), Accept: 'application/json' },
            });
            if (!res.ok) {
                throw new Error(`Error al cargar agenda: ${res.status}`);
            }
            const json = await res.json();
            if (!json.success || !json.data) {
                throw new Error('Respuesta inválida del servidor');
            }
            return json.data as AgendaResponse;
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const events = useMemo<AgendaEvent[]>(() => response?.data ?? [], [response]);

    const nextMonth = useCallback(() => {
        setCurrentMonth(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    }, []);

    const prevMonth = useCallback(() => {
        setCurrentMonth(prev => {
            const prevDate = new Date(prev);
            prevDate.setMonth(prevDate.getMonth() - 1);
            return prevDate;
        });
    }, []);

    return {
        events,
        currentMonth,
        isLoading: isLoading || (isFetching && events.length === 0),
        isFetching,
        filterType,
        setFilterType,
        nextMonth,
        prevMonth,
    };
}
