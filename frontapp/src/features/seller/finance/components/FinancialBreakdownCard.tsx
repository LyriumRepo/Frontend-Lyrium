'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import BaseModal from '@/components/ui/BaseModal';
import type { FinancialBreakdown } from '../types';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { companyColors } from '../colors';

interface FinancialBreakdownCardProps {
    data: FinancialBreakdown;
}

export default function FinancialBreakdownCard({ data }: FinancialBreakdownCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const items = [
        { label: 'Importe Venta (con IGV)', value: data.totalConIgv, icon: 'DollarSign', color: companyColors.lima },
        { label: 'IGV (18%)', value: data.totalIgv, icon: 'Receipt', color: companyColors.turquesaClaro },
        { label: 'Comisión Lyrium', value: data.totalCommission, icon: 'Percent', color: companyColors.turquesa },
        { label: 'Neto Vendedor', value: data.totalNeto, icon: 'Wallet', color: companyColors.verde },
    ];

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group w-full text-left">
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--border-subtle)]/30 hover:-translate-y-1 active:scale-[0.99]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white" style={{ backgroundColor: companyColors.azulCeleste }}>
                    <Icon name="PieChart" className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Desglose Financiero</h3>
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Base imponible SIN IGV: {formatCurrency(data.totalConIgv - data.totalIgv)}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item) => (
                    <div key={item.label} className="bg-[var(--bg-secondary)] p-5 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2" style={{ color: item.color }}>
                            <Icon name={item.icon} className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                        <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter">
                            {formatCurrency(item.value)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Estado de Pagos */}
            <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="CheckCircle" className="w-4 h-4" style={{ color: companyColors.verde }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Estado de Pagos</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${companyColors.verde}1A` }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: companyColors.verde }}>Completados</p>
                        <p className="text-lg font-black" style={{ color: companyColors.verde }}>{data.completedCount}</p>
                        <p className="text-[10px] font-bold" style={{ color: `${companyColors.verde}B3` }}>{formatCurrency(data.totalCompleted)}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${companyColors.celeste}1A` }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: companyColors.celeste }}>Pendientes</p>
                        <p className="text-lg font-black" style={{ color: companyColors.celeste }}>{data.pendingCount}</p>
                        <p className="text-[10px] font-bold" style={{ color: `${companyColors.celeste}B3` }}>{formatCurrency(data.totalPending)}</p>
                    </div>
                    <div className="rounded-xl md:col-span-2 flex items-center justify-between p-3" style={{ backgroundColor: `${companyColors.azulCeleste}1A` }}>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: companyColors.azulCeleste }}>Total Neto a Cobrar</p>
                            <p className="text-lg font-black" style={{ color: companyColors.azulCeleste }}>{formatCurrency(data.totalPending + data.totalCompleted)}</p>
                        </div>
                    </div>
                </div>
            </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
                        <Icon name="ArrowRight" className="w-3 h-3" />
                        Ver detalle completo
                    </span>
                </div>
            </div>
            </button>

            <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title="Desglose Financiero Completo" subtitle={`Base imponible SIN IGV: ${formatCurrency(data.totalConIgv - data.totalIgv)}`} size="lg">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {items.map((item) => (
                            <div key={item.label} className="bg-[var(--bg-secondary)] p-6 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2" style={{ color: item.color }}>
                                    <Icon name={item.icon} className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                                    {formatCurrency(item.value)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)]">
                        <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-4">Estado de Pagos</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl" style={{ backgroundColor: `${companyColors.verde}1A` }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: companyColors.verde }}>Completados</p>
                                <p className="text-2xl font-black" style={{ color: companyColors.verde }}>{data.completedCount}</p>
                                <p className="text-sm font-bold" style={{ color: `${companyColors.verde}B3` }}>{formatCurrency(data.totalCompleted)}</p>
                            </div>
                            <div className="p-4 rounded-xl" style={{ backgroundColor: `${companyColors.celeste}1A` }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: companyColors.celeste }}>Pendientes</p>
                                <p className="text-2xl font-black" style={{ color: companyColors.celeste }}>{data.pendingCount}</p>
                                <p className="text-sm font-bold" style={{ color: `${companyColors.celeste}B3` }}>{formatCurrency(data.totalPending)}</p>
                            </div>
                            <div className="p-4 rounded-xl" style={{ backgroundColor: `${companyColors.azulCeleste}1A` }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: companyColors.azulCeleste }}>Total Neto a Cobrar</p>
                                <p className="text-2xl font-black" style={{ color: companyColors.azulCeleste }}>{formatCurrency(data.totalPending + data.totalCompleted)}</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] text-center">
                        Los valores mostrados corresponden al período fiscal seleccionado. El IGV corresponde al 18% según legislación peruana vigente.
                    </p>
                </div>
            </BaseModal>
        </>
    );
}
