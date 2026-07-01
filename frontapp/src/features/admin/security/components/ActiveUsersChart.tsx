'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { DailyActiveUser } from '@/shared/lib/api/adminSecurityRepository';

interface Props {
  users: DailyActiveUser[];
  sessions: { date: string; total: number }[];
  loading: boolean;
}

export function ActiveUsersChart({ users, sessions, loading }: Props) {
  const merged = users.map((u) => {
    const s = sessions.find((x) => x.date === u.date);
    return {
      date: u.date,
      active_users: u.active_users,
      sessions: s?.total ?? 0,
    };
  });

  return (
    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
          Usuarios Activos y Sesiones
        </h3>
        <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
          Tendencia diaria (30 días)
        </p>
      </div>
      {loading ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
          Cargando...
        </div>
      ) : merged.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
          Sin datos
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="active_users"
              name="Usuarios Activos"
              stroke="#34d399"
              fill="#34d399"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              name="Sesiones"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
