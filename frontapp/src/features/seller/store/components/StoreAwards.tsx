'use client';

import React from 'react';
import Image from 'next/image';
import { ShopConfig } from '@/features/seller/store/types';
import Icon from '@/components/ui/Icon';

interface StoreAwardsProps {
    config: ShopConfig;
}

export default function StoreAwards({ config }: StoreAwardsProps) {
    const { subscription, rating, totalSales, totalOrders, verifiedAt, status } = config;
    
    const isVerified = !!verifiedAt;
    const isTopSeller = (rating ?? 0) >= 4.5 && (totalSales ?? 0) > 50;
    const isExpressShipping = false; // No hay datos de esto en backend aún
    
    const getStatusBadge = () => {
        switch (status) {
            case 'approved':
                return { text: 'Aprobado', color: 'bg-green-500' };
            case 'pending':
                return { text: 'Pendiente', color: 'bg-amber-500' };
            case 'rejected':
                return { text: 'Rechazado', color: 'bg-red-500' };
            case 'banned':
                return { text: 'Suspendido', color: 'bg-red-700' };
            default:
                return { text: 'Desconocido', color: 'bg-gray-500' };
        }
    };
    
    const statusBadge = getStatusBadge();
    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-8">
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-5 text-white relative z-10">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner">
                        <Icon name="Medal" className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none">Estatus de Socio Lyrium</h3>
                        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Credenciales Oficiales de la Plataforma
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-12">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Estatus de Socio Lyrium</h3>
                        <div className="relative group/info">
                            <button type="button" className="text-[var(--text-secondary)] hover:text-sky-500 transition-colors">
                                <Icon name="Info" className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[var(--bg-card)] p-4 rounded-2xl shadow-2xl border border-[var(--border-subtle)] w-64 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-[100] cursor-default text-left">
                                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2">Acerca del Estatus</p>
                                <p className="text-[9px] text-[var(--text-secondary)] font-medium leading-relaxed">
                                    Las medallas son reconocimientos automáticos y manuales que validan la trayectoria y confianza de tu tienda en el ecosistema Lyrium.
                                </p>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Credenciales Oficiales de la Plataforma</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                    <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-4 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all"></div>
                        <Image 
                            src="/img/INSIGNIA PREMIUM.png" 
                            alt="Insignia" 
                            width={208} 
                            height={208}
                            className="relative w-52 h-52 object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        />
                        <div className="mt-8 text-center space-y-2">
                            <span className="px-6 py-2 bg-[var(--bg-card)] rounded-full shadow-xl border border-sky-500/20 text-sky-500 font-black text-sm uppercase tracking-tighter block">
                                {subscription?.plan?.name || 'Sin Plan'}
                            </span>
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusBadge.color} text-white`}>
                                {statusBadge.text}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="text-xs text-[var(--text-secondary)] mb-4 space-y-1">
                            <p><span className="font-black">Rating:</span> {rating?.toFixed(1) || '0.0'} ⭐</p>
                            <p><span className="font-black">Ventas:</span> {totalSales || 0}</p>
                            <p><span className="font-black">Pedidos:</span> {totalOrders || 0}</p>
                        </div>

                        <div className="relative group/medal">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all cursor-help ${
                                isVerified 
                                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-white' 
                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                <Icon name="ShieldCheck" className={`group-hover/medal:text-white transition-colors w-4 h-4 ${isVerified ? 'text-sky-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{isVerified ? 'Identidad Verificada' : 'Sin Verificar'}</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[var(--bg-card)] p-3 rounded-xl shadow-2xl border border-[var(--border-subtle)] w-56 opacity-0 invisible group-hover/medal:opacity-100 group-hover/medal:visible transition-all z-[100] cursor-default text-left">
                                <p className="text-[9px] font-black text-sky-500 uppercase mb-1">Requisito de Obtención</p>
                                <p className="text-[8px] text-[var(--text-secondary)] font-medium leading-tight">Otorgada al validar satisfactoriamente los documentos oficiales (RUC y DNI) del titular.</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-6px] w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>

                        <div className="relative group/medal">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all cursor-help ${
                                isTopSeller 
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white' 
                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                <Icon name="Star" className={`group-hover/medal:text-white transition-colors w-4 h-4 ${isTopSeller ? 'text-amber-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{isTopSeller ? 'Vendedor Top' : 'Vendedor Regular'}</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[var(--bg-card)] p-3 rounded-xl shadow-2xl border border-[var(--border-subtle)] w-56 opacity-0 invisible group-hover/medal:opacity-100 group-hover/medal:visible transition-all z-[100] cursor-default text-left">
                                <p className="text-[9px] font-black text-amber-500 uppercase mb-1">Requisito de Obtención</p>
                                <p className="text-[8px] text-[var(--text-secondary)] font-medium leading-tight">Requiere un promedio superior a 4.5 estrellas y más de 50 ventas exitosas.</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-6px] w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>

                        <div className="relative group/medal">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all cursor-help ${
                                isExpressShipping 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                <Icon name="Zap" className={`group-hover/medal:text-white transition-colors w-4 h-4 ${isExpressShipping ? 'text-emerald-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{isExpressShipping ? 'Envío Express' : 'Sin Envío Express'}</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[var(--bg-card)] p-3 rounded-xl shadow-2xl border border-[var(--border-subtle)] w-56 opacity-0 invisible group-hover/medal:opacity-100 group-hover/medal:visible transition-all z-[100] cursor-default text-left">
                                <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Requisito de Obtención</p>
                                <p className="text-[8px] text-[var(--text-secondary)] font-medium leading-tight">Otorgada al vendedor que cumpla con despachos en menos de 12 horas por 20 pedidos consecutivos.</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-6px] w-3 h-3 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
