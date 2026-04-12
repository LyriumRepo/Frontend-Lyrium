'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useAdminInvoices } from '@/features/admin/invoices/hooks/useAdminInvoices';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { Receipt, Search, RefreshCw, Download, CheckCircle, Clock, XCircle, AlertCircle, User, TrendingUp, FileText } from 'lucide-react';
import BaseButton from '@/components/ui/BaseButton';
import BaseStatCard from '@/components/ui/BaseStatCard';
import Skeleton, { SkeletonRow } from '@/components/ui/Skeleton';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ACCEPTED: { label: 'Aceptado', color: 'emerald', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    SENT_WAIT_CDR: { label: 'Pendiente CDR', color: 'amber', icon: <Clock className="w-3.5 h-3.5" /> },
    REJECTED: { label: 'Rechazado', color: 'rose', icon: <XCircle className="w-3.5 h-3.5" /> },
    OBSERVED: { label: 'Observado', color: 'orange', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    DRAFT: { label: 'Borrador', color: 'gray', icon: <FileText className="w-3.5 h-3.5" /> },
};

const statusColorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border border-rose-100',
    orange: 'bg-orange-50 text-orange-600 border border-orange-100',
    gray: 'bg-gray-50 text-gray-600 border border-gray-100',
};

const kpiColorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
    const colorClasses = statusColorClasses[cfg.color] || statusColorClasses.gray;
    return (<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClasses}`}>{cfg.icon} {cfg.label}</span>);
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RapifacPageClientProps { }
export function RapifacPageClient(_props: RapifacPageClientProps) {
    const { invoices, kpis, isLoading, error, search, setSearch, refresh } = useAdminInvoices();

    const handleExportCSV = () => {
        const headers = ['ID', 'Vendedor', 'Tipo', 'Serie', 'Número', 'Cliente', 'RUC', 'Monto', 'Estado', 'Fecha'];
        const rows = (invoices || []).map(i => [i.id, i.seller_name, i.type, i.series, i.number, i.customer_name, i.customer_ruc, i.amount.toFixed(2), i.sunat_status, new Date(i.emission_date).toLocaleDateString('es-PE')]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `comprobantes-rapifac-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
    };

    const kpiCards = kpis ? [
        { label: 'Total Facturado (SUNAT)', value: formatCurrency(kpis.totalFacturado), icon: <TrendingUp className="w-5 h-5" />, color: 'emerald' },
        { label: 'Comprobantes Emitidos', value: kpis.totalComprobantes.toString(), icon: <Receipt className="w-5 h-5" />, color: 'indigo' },
        { label: 'Pendientes CDR', value: kpis.pendingCount.toString(), icon: <Clock className="w-5 h-5" />, color: 'amber' },
        { label: 'Rechazados / Observados', value: kpis.rejectedCount.toString(), icon: <XCircle className="w-5 h-5" />, color: 'rose' },
    ] : [];

    return (
        <main className="p-8 space-y-8 animate-fadeIn">
            <ModuleHeader title="Trazabilidad Rapifac" subtitle="Registro centralizado de comprobantes electrónicos nacionales" icon="Receipt" />
            {error && <div className="bg-rose-50 border border-rose-200 p-6 rounded-[2rem] flex items-center gap-4 text-rose-700 font-bold shadow-sm"><AlertCircle className="w-6 h-6" /><div><p className="text-xs uppercase tracking-widest text-rose-500 mb-1">Error de Sincronización</p><p>{error}</p></div></div>}
            {isLoading ? (
                <div className="space-y-8"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[1, 2, 3, 4].map((i) => <Skeleton key={`rapifac-skel-${i}`} className="h-28 rounded-[2rem]" />)}</div></div>
            ) : (
                <>
                    <div className="flex justify-end items-center gap-3">
                        <BaseButton onClick={() => refresh()} variant="ghost" leftIcon="RefreshCw" size="md">Sincronizar</BaseButton>
                        <BaseButton onClick={handleExportCSV} variant="primary" leftIcon="Download" size="md">Exportar Reporte</BaseButton>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpiCards.map((card) => (<div key={card.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${kpiColorClasses[card.color] || 'bg-gray-50'}`}>{card.icon}</div><div className="min-w-0"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{card.label}</p><p className="text-xl font-black text-gray-900 tracking-tighter mt-0.5">{card.value}</p></div></div></div>))}
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
                            <div><h3 className="text-xl font-black text-gray-900 tracking-tight">Comprobantes Recientes</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Sincronizado con Rapifac Cloud Nodes</p></div>
                            <div className="relative w-full md:w-96"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Buscar..." className="w-full pl-14 pr-6 py-4 bg-white border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                        </div>
                        <div className="overflow-x-auto"><table className="w-full text-left border-collapse" aria-label="Tabla de comprobantes"><thead><tr className="bg-gray-50/50"><th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Documento</th><th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Serie-Nro</th><th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Cliente</th><th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Monto</th><th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Estado</th><th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Fecha</th></tr></thead><tbody>{(invoices || []).map((invoice) => (<tr key={invoice.id} className="hover:bg-blue-50/30 transition-colors group"><td className="px-8 py-6 border-b border-gray-50"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-500 transition-all"><User className="w-5 h-5" /></div><div><div className="text-[11px] font-black text-blue-500 uppercase tracking-tight">{invoice.type}</div><div className="text-[13px] font-black text-gray-900 mt-0.5">{invoice.seller_name}</div></div></div></td><td className="px-8 py-6 border-b border-gray-50 font-black text-gray-600 font-mono text-sm">{invoice.series}-{invoice.number}</td><td className="px-8 py-6 border-b border-gray-50"><div className="text-[13px] font-black text-gray-900 uppercase truncate max-w-xs">{invoice.customer_name}</div><div className="text-[10px] font-bold text-gray-400 mt-0.5 font-mono">{invoice.customer_ruc}</div></td><td className="px-8 py-6 border-b border-gray-50"><div className="text-sm font-black text-gray-900 tracking-tighter">{formatCurrency(invoice.amount)}</div></td><td className="px-8 py-6 border-b border-gray-50 text-center"><StatusBadge status={invoice.sunat_status} /></td><td className="px-8 py-6 border-b border-gray-50 text-right"><div className="text-[11px] font-bold text-gray-400 uppercase">{new Date(invoice.emission_date).toLocaleDateString('es-PE')}</div></td></tr>))}</tbody></table></div>
                    </div>
                </>
            )}
        </main>
    );
}
