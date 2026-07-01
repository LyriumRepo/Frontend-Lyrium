'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShopConfig, TopMedal } from '@/features/seller/store/types';
import Icon from '@/components/ui/Icon';
import { medalApi } from '@/shared/lib/api/medalRepository';
import { Loader2 } from 'lucide-react';

interface StoreAwardsProps {
    config: ShopConfig;
}

export default function StoreAwards({ config }: StoreAwardsProps) {
    const { subscription, rating, totalSales, totalOrders, verifiedAt, status } = config;

    const [topMedals, setTopMedals] = useState<TopMedal[]>([]);
    const [medalsLoading, setMedalsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        medalApi.getSellerMedals()
            .then((res) => setTopMedals(res.data ?? []))
            .catch(() => {})
            .finally(() => setMedalsLoading(false));
    }, []);

    const handleToggle = async (id: string) => {
        setTogglingId(id);
        try {
            const res = await medalApi.toggleMedalVisibility(id);
            setTopMedals((prev) =>
                prev.map((m) => (m.id === id ? { ...m, visible: res.data.visible } : m)),
            );
        } catch {}
        finally { setTogglingId(null); }
    };

    const isVerified = !!verifiedAt;
    const isTopSeller = (rating ?? 0) >= 4.5 && (totalSales ?? 0) > 50;
    const isExpressShipping = false;

    const getStatusBadge = () => {
        switch (status) {
            case 'approved':  return { text: 'Aprobado',   color: 'bg-green-500' };
            case 'pending':   return { text: 'Pendiente',  color: 'bg-amber-500' };
            case 'rejected':  return { text: 'Rechazado',  color: 'bg-red-500'   };
            case 'banned':    return { text: 'Suspendido', color: 'bg-red-700'   };
            default:          return { text: 'Desconocido',color: 'bg-gray-500'  };
        }
    };

    const statusBadge = getStatusBadge();

    const approvedMedals = topMedals.filter((m) => m.status === 'approved');

    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-4 sm:mb-6 md:mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 md:p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-5 text-white relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner flex-shrink-0">
                        <Icon name="Medal" className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Estatus de Socio Lyrium</h3>
                        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Credenciales Oficiales de la Plataforma
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                {/* Title section */}
                <div className="text-center mb-6 sm:mb-8 md:mb-12">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                            Estatus de Socio Lyrium
                        </h3>
                        <div className="relative group/info">
                            <button type="button" className="text-[var(--text-secondary)] hover:text-sky-500 dark:hover:text-[var(--icons-green)] transition-colors">
                                <Icon name="Info" className="w-5 h-5" />
                            </button>
                            {/* Tooltip — oculto en mobile, visible en hover en desktop */}
                            <div className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-3 bg-[var(--bg-card)] p-4 rounded-2xl shadow-2xl border border-[var(--border-subtle)] w-56 sm:w-64 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-[100] cursor-default text-left pointer-events-none">
                                <p className="text-[10px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase tracking-widest mb-2">Acerca del Estatus</p>
                                <p className="text-[9px] text-[var(--text-secondary)] font-medium leading-relaxed">
                                    Las medallas son reconocimientos automáticos y manuales que validan la trayectoria y confianza de tu tienda en el ecosistema Lyrium.
                                </p>
                                <div className="absolute bottom-[-6px] left-6 sm:left-1/2 sm:-translate-x-1/2 w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                        Credenciales Oficiales de la Plataforma
                    </p>
                </div>

                {/* Insignia + Badges */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16">
                    {/* Insignia */}
                    <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-4 bg-sky-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-sky-500/20 dark:group-hover:bg-emerald-500/30 transition-all"></div>
                        <Image
                            src="/img/INSIGNIA PREMIUM.png"
                            alt="Insignia"
                            width={208}
                            height={208}
                            className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        />
                        <div className="mt-5 sm:mt-8 text-center space-y-2">
                            <span className="px-4 sm:px-6 py-2 bg-[var(--bg-card)] rounded-full shadow-xl border border-sky-500/20 dark:border-[var(--icons-green)] text-sky-500 dark:text-[var(--icons-green)] font-black text-sm uppercase tracking-tighter block">
                                {subscription?.plan?.name || 'Sin Plan'}
                            </span>
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusBadge.color} text-white`}>
                                {statusBadge.text}
                            </span>
                        </div>
                    </div>

                    {/* Badges + Stats */}
                    <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-sm md:max-w-none md:w-auto">
                        {/* Stats */}
                        <div className="text-xs text-[var(--text-secondary)] mb-2 space-y-1">
                            <p><span className="font-black">Rating:</span> {rating?.toFixed(1) || '0.0'} ⭐</p>
                            <p><span className="font-black">Ventas:</span> {totalSales || 0}</p>
                            <p><span className="font-black">Pedidos:</span> {totalOrders || 0}</p>
                        </div>

                        {/* Badge: Identidad Verificada */}
                        <div className="relative group/medal">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all cursor-help ${
                                isVerified
                                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-white'
                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                <Icon name="ShieldCheck" className={`group-hover/medal:text-white transition-colors w-4 h-4 ${isVerified ? 'text-sky-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {isVerified ? 'Identidad Verificada' : 'Sin Verificar'}
                                </span>
                            </div>
                            <div className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-3 bg-[var(--bg-card)] p-3 rounded-xl shadow-2xl border border-[var(--border-subtle)] w-56 opacity-0 invisible group-hover/medal:opacity-100 group-hover/medal:visible transition-all z-[100] cursor-default text-left pointer-events-none">
                                <p className="text-[9px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase mb-1">Requisito de Obtención</p>
                                <p className="text-[8px] text-[var(--text-secondary)] font-medium leading-tight">
                                    Otorgada al validar satisfactoriamente los documentos oficiales (RUC y DNI) del titular.
                                </p>
                                <div className="absolute top-full left-6 sm:left-1/2 sm:-translate-x-1/2 mt-[-6px] w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>

                        {/* Badge: Vendedor Top */}
                        <div className="relative group/medal">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all cursor-help ${
                                isTopSeller
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white'
                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                <Icon name="Star" className={`group-hover/medal:text-white transition-colors w-4 h-4 ${isTopSeller ? 'text-amber-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {isTopSeller ? 'Vendedor Top' : 'Vendedor Regular'}
                                </span>
                            </div>
                            <div className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-3 bg-[var(--bg-card)] p-3 rounded-xl shadow-2xl border border-[var(--border-subtle)] w-56 opacity-0 invisible group-hover/medal:opacity-100 group-hover/medal:visible transition-all z-[100] cursor-default text-left pointer-events-none">
                                <p className="text-[9px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase mb-1">Requisito de Obtención</p>
                                <p className="text-[8px] text-[var(--text-secondary)] font-medium leading-tight">
                                    Requiere un promedio superior a 4.5 estrellas y más de 50 ventas exitosas.
                                </p>
                                <div className="absolute top-full left-6 sm:left-1/2 sm:-translate-x-1/2 mt-[-6px] w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>

                        {/* Badge: Envío Express */}
                        <div className="relative group/medal">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all cursor-help ${
                                isExpressShipping
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                <Icon name="Zap" className={`group-hover/medal:text-white transition-colors w-4 h-4 ${isExpressShipping ? 'text-emerald-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {isExpressShipping ? 'Envío Express' : 'Sin Envío Express'}
                                </span>
                            </div>
                            <div className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-3 bg-[var(--bg-card)] p-3 rounded-xl shadow-2xl border border-[var(--border-subtle)] w-56 opacity-0 invisible group-hover/medal:opacity-100 group-hover/medal:visible transition-all z-[100] cursor-default text-left pointer-events-none">
                                <p className="text-[9px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase mb-1">Requisito de Obtención</p>
                                <p className="text-[8px] text-[var(--text-secondary)] font-medium leading-tight">
                                    Otorgada al vendedor que cumpla con despachos en menos de 12 horas por 20 pedidos consecutivos.
                                </p>
                                <div className="absolute top-full left-6 sm:left-1/2 sm:-translate-x-1/2 mt-[-6px] w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reconocimientos Top Lyrium */}
                <div className="mt-12 pt-12 border-t border-[var(--border-subtle)]">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-2">
                            <Icon name="Trophy" className="w-5 h-5 text-amber-500" />
                            Reconocimientos Top Lyrium
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">
                            Medallas por posicionamiento en rankings de la plataforma
                        </p>
                    </div>

                    {medalsLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                        </div>
                    ) : approvedMedals.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                <Icon name="Trophy" className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">Aún no tienes medallas Top 100</p>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-1 opacity-70">
                            Sigue mejorando tu rating para aparecer en el ranking de la plataforma.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {approvedMedals.map((medal) => (
                                <div key={medal.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-all">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                                        <Image src="/img/INSIGNIA PREMIUM.png" alt="Medalla Top 100" width={56} height={56} className="w-full h-full object-contain p-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-[var(--text-primary)] truncate">
                                            {medal.entity?.name ?? medal.entity?.id ?? 'Sin nombre'}
                                        </p>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                                            {medal.entity_type === 'store' ? 'Tienda' : medal.entity_type === 'product' ? 'Producto' : 'Servicio'}
                                            <span> &middot; EN RANKING</span>
                                        </p>
                                        <p className="text-[9px] text-[var(--text-secondary)] mt-1">
                                            Ingresos al Top: {medal.times_entered}
                                            {medal.times_exited > 0 && ` · Salidas: ${medal.times_exited}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleToggle(medal.id)}
                                            disabled={togglingId === medal.id || medal.status === 'suspended'}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                                medal.visible ? 'bg-emerald-500' : 'bg-gray-300'
                                            } ${medal.status === 'suspended' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                            title={medal.visible ? 'Visible al público' : 'Oculta al público'}
                                        >
                                            {togglingId === medal.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin text-white mx-auto" />
                                            ) : (
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${medal.visible ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                                            )}
                                        </button>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 min-w-[28px]">
                                            {medal.visible ? 'Público' : 'Oculto'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading state for medals */}
                {medalsLoading && (
                    <div className="mt-8 text-center">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
                    </div>
                )}
            </div>
        </div>
    );
}