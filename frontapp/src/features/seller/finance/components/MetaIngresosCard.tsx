import React from 'react';
import Icon from '@/components/ui/Icon';
import { companyColors } from '../colors';
import type { MetaIngresos } from '../types';

interface MetaIngresosCardProps {
    data: MetaIngresos;
    formatCurrency: (val: number) => string;
}

export default function MetaIngresosCard({ data, formatCurrency }: MetaIngresosCardProps) {
    const { ingresoMesAnterior, ingresoMesActual, metaMensual, faltanteSoles, ticketPromedio, ventasFaltantes, metaAlcanzada } = data;

    const sinHistorial = ingresoMesAnterior <= 0;
    const progress = metaMensual > 0 ? Math.min((ingresoMesActual / metaMensual) * 100, 100) : 0;

    return (
        <div
            className="bg-[var(--bg-card)] p-6 md:p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden animate-section-reveal"
            style={{ borderColor: `${companyColors.lima}40` }}
        >
            <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-16 -mt-16 blur-2xl"
                style={{ backgroundColor: `${companyColors.lima}14` }}
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div
                    className="w-14 h-14 flex-shrink-0 text-white rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: metaAlcanzada ? companyColors.verde : companyColors.lima }}
                >
                    <Icon name={metaAlcanzada ? 'Trophy' : 'Zap'} className="text-2xl w-7 h-7" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1">
                        Meta de Ingresos del Mes
                    </p>

                    {sinHistorial ? (
                        <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                            Aún no tenemos ventas del mes anterior para calcular tu meta. En cuanto registres tu primera
                            venta, aquí verás cuánto te falta para tu próximo objetivo de ingresos.
                        </p>
                    ) : metaAlcanzada ? (
                        <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                            ¡Meta superada! Llevas <span className="font-black">{formatCurrency(ingresoMesActual)}</span> este
                            mes, por encima de tu objetivo de {formatCurrency(metaMensual)} (+20% vs. tu mes anterior).
                        </p>
                    ) : (
                        <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                            Te faltan <span className="font-black">{ventasFaltantes} venta{ventasFaltantes === 1 ? '' : 's'}</span> más
                            {ticketPromedio > 0 && (
                                <> (a tu ticket promedio de {formatCurrency(ticketPromedio)})</>
                            )} para llegar a <span className="font-black">{formatCurrency(metaMensual)}</span> este mes
                            — un 20% más que tu mes anterior ({formatCurrency(ingresoMesAnterior)}).
                        </p>
                    )}

                    {!sinHistorial && (
                        <div className="mt-4 space-y-2">
                            <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${companyColors.lima}33` }}>
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${progress}%`,
                                        background: `linear-gradient(to right, ${companyColors.verde}, ${companyColors.lima})`,
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                                <span>Vas: {formatCurrency(ingresoMesActual)}</span>
                                <span>Meta: {formatCurrency(metaMensual)}</span>
                            </div>
                            {!metaAlcanzada && faltanteSoles > 0 && (
                                <p className="text-[10px] font-bold text-[var(--text-secondary)]">
                                    Faltan {formatCurrency(faltanteSoles)} para alcanzarla.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
