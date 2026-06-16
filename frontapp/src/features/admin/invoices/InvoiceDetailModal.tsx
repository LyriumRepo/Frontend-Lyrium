'use client';

import React from 'react';
import { Voucher } from '@/features/seller/invoices/types';
import { 
  X, 
  FileText, 
  Building2, 
  User, 
  Receipt, 
  Calendar, 
  Activity, 
  Download, 
  ExternalLink, 
  ShoppingBag,
  Store
} from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Voucher;
  onClose: () => void;
  storeName: string;
}

const labelClass = "text-[9px] font-black text-[var(--text-muted)] uppercase ml-1";
const valueClass = "w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-xs font-black text-[var(--text-primary)] transition-all outline-none flex items-center gap-2";
const sectionClass = "bg-[var(--bg-secondary)]/40 rounded-2xl p-5 border border-[var(--border-subtle)] space-y-4";
const sectionTitleClass = "flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 mb-4";

export function InvoiceDetailModal({ invoice, onClose, storeName }: InvoiceDetailModalProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return { label: 'Aceptado SUNAT', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'SENT_WAIT_CDR':
        return { label: 'Pendiente CDR', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'REJECTED':
        return { label: 'Rechazado SUNAT', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      case 'OBSERVED':
        return { label: 'Observado SUNAT', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
      default:
        return { label: 'Borrador', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' };
    }
  };

  const statusCfg = getStatusConfig(invoice.sunat_status);

  return (
    <div className="bg-[var(--bg-card)] w-full max-w-3xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col font-industrial animate-scaleUp text-left border border-[var(--border-subtle)]">
      <div className="px-10 py-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-gradient-to-r from-sky-950/20 to-zinc-900/10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex items-center justify-center text-sky-500 shrink-0">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-none">
              Detalle de Comprobante
            </h3>
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] mt-2">
              Serie-Nro: {invoice.series}-{invoice.number}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-10 overflow-y-auto custom-scrollbar max-h-[65vh] space-y-8">
        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <Store className="w-4 h-4 text-sky-500" />
            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
              Origen y Emisor
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Tienda / Comercio Emisor</label>
              <div className={valueClass}>
                <Store className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{storeName}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>ID Tienda</label>
              <div className={valueClass}>
                <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{invoice.store_id || 'Soporte / Central'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <User className="w-4 h-4 text-sky-500" />
            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
              Datos del Cliente
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Cliente / Razón Social</label>
              <div className={valueClass}>
                <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="truncate">{invoice.customer_name}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>RUC / DNI del Cliente</label>
              <div className={`${valueClass} font-mono`}>
                <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{invoice.customer_ruc}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <Receipt className="w-4 h-4 text-sky-500" />
            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
              Información de Comprobante
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Tipo Comprobante</label>
              <div className={valueClass}>
                <Receipt className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{invoice.type}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Monto Total</label>
              <div className={`${valueClass} text-sky-500 dark:text-icons-green`}>
                <span className="text-[10px] font-black bg-sky-500/10 dark:bg-icons-green/10 text-sky-500 dark:text-icons-green rounded px-1.5 py-0.5 select-none font-sans shrink-0 min-w-[20px] text-center">S/</span>
                <span>{invoice.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Fecha Emisión</label>
              <div className={valueClass}>
                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{new Date(invoice.emission_date).toLocaleString('es-PE')}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Pedido Relacionado</label>
              <div className={valueClass}>
                <ShoppingBag className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{invoice.order_id || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Estado de Envío SUNAT</label>
              <div className={`${valueClass} ${statusCfg.color} border`}>
                <Activity className="w-4 h-4" />
                <span>{statusCfg.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <div className={sectionTitleClass}>
            <Download className="w-4 h-4 text-sky-500" />
            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
              Archivos del Comprobante (Formatos SUNAT)
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <a
              href={invoice.pdf_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-sky-500/50 hover:bg-sky-500/5 rounded-2xl text-xs font-black text-[var(--text-primary)] transition active:scale-95 cursor-pointer ${!invoice.pdf_url ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                <span>PDF Comprobante</span>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
