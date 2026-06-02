import React from 'react';
import Icon from '@/components/ui/Icon';
import { companyColors } from '../colors';

interface CardProxPagoProps {
    data: {
        labels: string[];
        data: number[];
    };
    formatCurrency: (val: number) => string;
}

export default function CardProxPago({ data, formatCurrency }: CardProxPagoProps) {
    const recaudado = data.data[0] ?? 0;
    const restante = data.data[1] ?? 0;
    const total = recaudado + restante;
    const progress = total > 0 ? (recaudado / total) * 100 : 0;

    return (
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group" style={{ borderColor: `${companyColors.celeste}40` }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-700 group-hover:scale-150" style={{ backgroundColor: `${companyColors.celeste}0D` }}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform" style={{ backgroundColor: companyColors.celeste }}>
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
                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Próximo Pago</p>
                </div>

                <div className="mt-8 space-y-3">
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${companyColors.celeste}33` }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(progress, 100)}%`, background: `linear-gradient(to right, ${companyColors.turquesa}, ${companyColors.celeste})` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                        <span>Recaudado: {formatCurrency(recaudado)}</span>
                        <span>Restante: {formatCurrency(restante)}</span>
                    </div>
                </div>

                <p className="text-[9px] text-center text-[var(--text-secondary)] mt-4 font-black uppercase tracking-widest italic leading-none">Corte: Lunes a Miércoles</p>
            </div>
        </div>
    );
}
