import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import BaseModal from '@/components/ui/BaseModal';
import FinanceChart from './FinanceChart';

interface CardProxPagoProps {
  data: {
    labels: string[];
    data: number[];
  };
  formatCurrency: (val: number) => string;
}

export default function CardProxPago({
  data,
  formatCurrency,
}: CardProxPagoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recaudado = data.data[0] ?? 0;
  const restante = data.data[1] ?? 0;
  const total = recaudado + restante;
  const progress = total > 0 ? (recaudado / total) * 100 : 0;

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="group w-full text-left">
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-sky-100/50 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-700 group-hover:scale-150"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Icon name="CalendarCheck" className="text-2xl w-6 h-6" />
              </div>
              <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter leading-none">
                {formatCurrency(recaudado)}
              </h3>
              <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Próximo Pago
              </p>
            </div>

            <div className="relative flex items-center justify-center h-[200px] mt-6">
              <FinanceChart
                type="doughnut"
                labels={data.labels}
                data={data.data}
                color="#0ea5e9"
                cutout="75%"
              />
              <div className="absolute text-center mt-6">
                <span className="text-sm font-black text-[var(--text-primary)]">
                  {formatCurrency(recaudado)}
                </span>
              </div>
            </div>

            <p className="text-[9px] text-center text-[var(--text-secondary)] mt-4 font-black uppercase tracking-widest italic leading-none">
              Corte: Lunes a Miércoles
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
              <Icon name="ArrowRight" className="w-3 h-3" />
              Ver detalle de próximo pago
            </span>
          </div>
        </div>
      </button>

      <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title="Próximo Pago" subtitle="Progreso de recaudación del período" size="md">
        <div className="space-y-8">
          <div className="bg-gray-900 dark:bg-gray-800 p-6 rounded-[2rem] text-center">
            <p className="text-sm font-black text-white/60 uppercase tracking-widest mb-1">Recaudado</p>
            <p className="text-5xl font-black text-white">{formatCurrency(recaudado)}</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold text-[var(--text-secondary)]">
              <span>Progreso de recaudación</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden bg-sky-500/20">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4]"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-emerald-500/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Recaudado</p>
                <p className="text-xl font-black text-emerald-500">{formatCurrency(recaudado)}</p>
              </div>
              <div className="p-4 rounded-xl bg-sky-500/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500">Restante</p>
                <p className="text-xl font-black text-sky-500">{formatCurrency(restante)}</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] text-center">
            Los pagos se procesan semanalmente con corte los días lunes a miércoles. El monto mostrado corresponde al acumulado del período en curso.
          </p>
        </div>
      </BaseModal>
    </>
  );
}
