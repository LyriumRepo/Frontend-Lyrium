import React from 'react';
import Icon from '@/components/ui/Icon';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import FinanceChart from './FinanceChart';

interface CardProxPagoProps {
    data: {
        labels: string[];
        data: number[];
    };
    formatCurrency: (val: number) => string;
}

export default function CardProxPago({ data, formatCurrency }: CardProxPagoProps) {
    return (
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-sky-100/50 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-700 group-hover:scale-150"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <Icon name="CalendarCheck" className="text-2xl w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter leading-none">Recaudado</h3>
                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Próximo Pago</p>
                </div>

                <div className="relative flex items-center justify-center h-[200px] mt-6">
                    <FinanceChart type="doughnut" labels={data.labels} data={data.data} color="#0EA5E9" cutout="75%" />
                    <div className="absolute text-center mt-6">
                        <span className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(data.data[0])}</span>
                    </div>
                </div>
                <p className="text-[9px] text-center text-[var(--text-secondary)] mt-4 font-black uppercase tracking-widest italic leading-none">Corte: Lunes a Miércoles</p>
            </div>
        </div>
    );
}
