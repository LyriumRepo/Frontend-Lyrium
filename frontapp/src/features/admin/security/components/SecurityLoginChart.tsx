'use client';

import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { ChartDataPoint } from '@/shared/lib/api/adminSecurityRepository';

interface Props {
  data: ChartDataPoint[];
  loading: boolean;
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(d)}/${parseInt(m)}`;
}

function formatDateFull(iso: string): string {
  const [y, m, d] = iso.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1E3028] border border-gray-200 dark:border-[#2A4A3E] rounded-2xl shadow-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-800 dark:text-gray-100 mb-2">
        {formatDateFull(label ?? '')}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-gray-400">{entry.name}</span>
          </span>
          <span className="font-bold text-gray-800 dark:text-gray-100">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function SecurityLoginChart({ data, loading }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
              Intentos de Login (30 días)
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
              Exitosos vs Fallidos por día
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Ver gráfico ampliado"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
            Cargando...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-sm text-[var(--text-secondary)]">
            Sin datos
          </div>
        ) : (
          <div className="cursor-pointer" onClick={() => setModalOpen(true)}>
            <ResponsiveContainer width="100%" height={250}>
<BarChart data={data} barGap={2}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
    <XAxis
      dataKey="date"
      tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
      tickFormatter={(v: string) => {
        const [, m, d] = v.split('-');
        return `${parseInt(d)}/${parseInt(m)}`;
      }}
    />
    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
    <Legend
      wrapperStyle={{ fontSize: '11px', fontWeight: 700 }}
    />
    <defs>
      <filter id="bar-shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000020" />
      </filter>
    </defs>
    <Bar dataKey="success" name="Exitosos" fill="#34d399" radius={[4, 4, 0, 0]} activeBar={{ fill: '#2bae7a', filter: 'url(#bar-shadow)' }} isAnimationActive={true} animationDuration={400} />
    <Bar dataKey="failed" name="Fallidos" fill="#14b8a6" radius={[4, 4, 0, 0]} activeBar={{ fill: '#0e9484', filter: 'url(#bar-shadow)' }} isAnimationActive={true} animationDuration={400} />
  </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">
                    Intentos de Login (30 días)
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] font-semibold">
                    Exitosos vs Fallidos por día — vista ampliada
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={data} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      tickFormatter={(v: string) => {
                        const [y, m, d] = v.split('-');
                        return `${parseInt(d)}/${parseInt(m)}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', fontWeight: 700, paddingTop: '8px' }}
                    />
                    <Bar dataKey="success" name="Exitosos" fill="#34d399" radius={[6, 6, 0, 0]} activeBar={{ fill: '#2bae7a', filter: 'url(#bar-shadow)' }} isAnimationActive={true} animationDuration={400} />
                    <Bar dataKey="failed" name="Fallidos" fill="#14b8a6" radius={[6, 6, 0, 0]} activeBar={{ fill: '#0e9484', filter: 'url(#bar-shadow)' }} isAnimationActive={true} animationDuration={400} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="px-6 py-3 border-t border-[var(--border-subtle)] flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#34d399]" /> Exitosos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#14b8a6]" /> Fallidos
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
