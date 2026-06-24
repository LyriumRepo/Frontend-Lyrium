import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import BaseModal from '@/components/ui/BaseModal';
import { companyColors } from '../colors';

interface CardProxPagoProps {
    data: {
        labels: string[];
        data: number[];
    };
    formatCurrency: (val: number) => string;
}

export default function CardProxPago({ data, formatCurrency }: CardProxPagoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const recaudado = data.data[0] ?? 0;
    const restante = data.data[1] ?? 0;
    const total = recaudado + restante;
    const progress = total > 0 ? (recaudado / total) * 100 : 0;

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group w-full text-left">
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group active:scale-[0.98]" style={{ borderColor: `${companyColors.celeste}40` }}>
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
                    <div className="bg-[var(--bg-secondary)] dark:bg-gray-900 p-6 rounded-[2rem] text-center border border-[var(--border-subtle)]">
                        <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Recaudado</p>
                        <p className="text-5xl font-black text-[var(--text-primary)]">{formatCurrency(recaudado)}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-bold text-[var(--text-secondary)]">
                            <span>Progreso de recaudación</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: `${companyColors.celeste}33` }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(progress, 100)}%`, background: `linear-gradient(to right, ${companyColors.turquesa}, ${companyColors.celeste})` }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-4 rounded-xl" style={{ backgroundColor: `${companyColors.verde}1A` }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: companyColors.verde }}>Recaudado</p>
                                <p className="text-xl font-black" style={{ color: companyColors.verde }}>{formatCurrency(recaudado)}</p>
                            </div>
                            <div className="p-4 rounded-xl" style={{ backgroundColor: `${companyColors.celeste}1A` }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: companyColors.celeste }}>Restante</p>
                                <p className="text-xl font-black" style={{ color: companyColors.celeste }}>{formatCurrency(restante)}</p>
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
