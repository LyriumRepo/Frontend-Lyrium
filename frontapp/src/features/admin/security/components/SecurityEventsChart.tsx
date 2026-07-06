'use client';

import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { EventTypeCount } from '@/shared/lib/api/adminSecurityRepository';

const COLORS = ['#14b8a6', '#38bdf8', '#34d399', '#2dd4bf', '#22d3ee', '#a7f3d0'];

const eventLabels: Record<string, string> = {
  blocked_ip: 'IP Bloqueada',
  session_revoked: 'Sesión Revocada',
  suspicious_activity: 'Actividad Sospechosa',
  user_banned: 'Usuario Suspendido',
};

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white dark:bg-[#1E3028] border border-gray-200 dark:border-[#2A4A3E] rounded-2xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-800 dark:text-gray-100">{entry.name}</p>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{entry.value} evento{entry.value !== 1 ? 's' : ''}</p>
    </div>
  );
}

interface Props {
  data: EventTypeCount[];
  loading: boolean;
}

export function SecurityEventsChart({ data, loading }: Props) {
  const mapped = data.map((d) => ({
    ...d,
    name: eventLabels[d.event_type] || d.event_type,
  }));

  return (
    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
          Eventos de Seguridad
        </h3>
        <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
          Distribución por tipo (30 días)
        </p>
      </div>
      {loading ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
          Cargando...
        </div>
      ) : mapped.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
          Sin datos
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={mapped}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={3}
            >
              {mapped.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontWeight: 700 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
