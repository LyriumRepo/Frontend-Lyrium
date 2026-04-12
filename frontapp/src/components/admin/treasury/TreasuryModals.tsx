import React from 'react';
import { CashInPayment, CashOutPayment, PaymentDirection, CashInStatus, CashOutStatus } from '@/lib/types/admin/treasury';
import BaseButton from '@/components/ui/BaseButton';
import { X, CheckCircle, CheckCircle2, XCircle, AlertTriangle, AlertOctagon, Link as LinkIcon, DollarSign, Wallet, ShieldCheck, Download } from 'lucide-react';

export const PaymentModal: React.FC<{
    payment: CashInPayment | CashOutPayment;
    onClose: () => void;
    onProcessIn: (id: string, action: 'VALIDATE' | 'REJECT') => void;
    onProcessOut: (id: string, action: 'PAY' | 'FAIL' | 'RESCHEDULE') => void;
}> = ({ payment, onClose, onProcessIn, onProcessOut }) => {

    const isCashIn = payment.direction === PaymentDirection.IN;

    if (isCashIn) {
        const p = payment as CashInPayment;
        return (
            <div className="bg-[var(--bg-card)] w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-modalIn flex flex-col font-industrial max-h-[90vh]">
                <div className="px-8 py-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-secondary)]/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--bg-card)] border border-emerald-500/20 rounded-2xl shadow-sm text-emerald-500">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-none uppercase">Validación Cash-In #{p.id}</h3>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Order Ref: {p.referenceId}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2">Datos Transaccionales</h4>
                        <div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Cliente Responsable</p>
                            <p className="text-sm font-black text-[var(--text-primary)] uppercase leading-none">{p.customer.name}</p>
                            <p className="text-[10px] text-indigo-500 font-black mt-1 uppercase">DNI/RUC: {p.customer.taxId || '----'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 mt-4">Monto Reportado</p>
                            <p className="text-3xl font-black text-emerald-500 uppercase tracking-tighter">S/ {p.amount.amount.toLocaleString()}</p>
                        </div>

                        {p.voucherUrl ? (
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] mt-6 cursor-pointer hover:bg-emerald-500/10 transition-colors group">
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-2">Comprobante de Pago Subido</p>
                                <p className="text-[10px] font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase">
                                    <LinkIcon className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400" />
                                    <span>{p.voucherUrl.split('/').pop()}</span>
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 font-bold text-xs flex items-center gap-2">
                                <AlertOctagon className="w-6 h-6" /> Voucher no adjuntado
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                        <div>
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2 mb-4">Jerarquía Lógica (Orden)</h4>
                            <div className="space-y-2 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                                <p className="text-[9px] font-black text-[var(--text-primary)] uppercase flex justify-between"><span className="text-[var(--text-muted)]">Emisor:</span> {p.orderHierarchy.company}</p>
                                <p className="text-[9px] font-black text-[var(--text-primary)] uppercase flex justify-between"><span className="text-[var(--text-muted)]">Vendedor:</span> {p.orderHierarchy.seller}</p>
                                <p className="text-[9px] font-black text-[var(--text-primary)] uppercase flex justify-between"><span className="text-[var(--text-muted)]">Beneficiario:</span> {p.orderHierarchy.customer}</p>
                            </div>
                        </div>

                        {p.status === CashInStatus.PENDING_VALIDATION && (
                            <div className="space-y-3 mt-4 flex flex-col pt-4 border-t border-[var(--border-subtle)]">
                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-center animate-pulse mb-2"> Requiere Auditoría Humana/Bancaria</p>
                                <BaseButton
                                    onClick={() => onProcessIn(p.id, 'VALIDATE')}
                                    variant="secondary"
                                    leftIcon="CheckCircle"
                                    size="md"
                                    fullWidth
                                >
                                    Validar y Emitir Rapifac
                                </BaseButton>
                                <BaseButton
                                    onClick={() => onProcessIn(p.id, 'REJECT')}
                                    variant="danger"
                                    leftIcon="XCircle"
                                    size="md"
                                    fullWidth
                                >
                                    Rechazar Voucher
                                </BaseButton>
                            </div>
                        )}
                        {p.status === CashInStatus.VALIDATED && (
                            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 font-bold text-[10px] uppercase text-center flex flex-col items-center">
                                <ShieldCheck className="w-8 h-8 mb-2 opacity-80" /> Validado Sistemáticamente
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-8 py-4 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] text-right flex-shrink-0">
                    <button onClick={onClose} aria-label="Cerrar inspección de cash-in" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors">Cerrar Inspección</button>
                </div>
            </div>
        );
    } else {
        const p = payment as CashOutPayment;
        return (
            <div className="bg-[var(--bg-card)] w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-modalIn flex flex-col font-industrial max-h-[90vh]">
                <div className="px-8 py-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-secondary)]/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--bg-card)] border border-indigo-500/20 rounded-2xl shadow-sm text-indigo-500">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-none uppercase">Liquidación Cash-Out #{p.id}</h3>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Batch Lote Ref: {p.referenceId}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2">Destinatario Bancario</h4>
                        <div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Vendedor Beneficiario</p>
                            <p className="text-sm font-black text-[var(--text-primary)] uppercase leading-none">{p.seller.name}</p>
                            <p className="text-[10px] text-indigo-500 font-black mt-1 uppercase">Banco: {p.seller.bankName}</p>
                            <span className="px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[9px] font-black rounded uppercase block mt-2 text-center border border-[var(--border-subtle)]">
                                CTA: {p.seller.accountNumber} <br /> CCI: {p.seller.cci || 'NA'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                        <div>
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2 mb-4">Estructura Matemática del Desembolso</h4>
                            <div className="space-y-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase flex justify-between items-end">
                                    <span>Monto Bruto de Ventas:</span>
                                    <span className="text-sm text-[var(--text-secondary)]">S/ {p.amount.amount.toLocaleString()}</span>
                                </p>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase flex justify-between items-end">
                                    <span>Fee Lyrium (Retención):</span>
                                    <span className="text-sm text-emerald-500">- S/ {p.commission.amount.toLocaleString()}</span>
                                </p>
                                <div className="border-t border-dashed border-[var(--border-subtle)] my-2 pt-2"></div>
                                <p className="text-[10px] font-black justify-between items-end flex uppercase">
                                    <span className="text-[var(--text-primary)] tracking-widest">Neto de Transferencia:</span>
                                    <span className="text-2xl text-[var(--text-primary)] tracking-tighter">S/ {p.netAmount.amount.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {p.status === CashOutStatus.SCHEDULED && (
                    <div className="px-8 py-5 bg-indigo-500/10 border-t border-indigo-500/20 flex gap-4">
                        <button
                            onClick={() => onProcessOut(p.id, 'PAY')}
                            className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Wallet className="w-4 h-4" /> Desembolsar Manualmente
                        </button>
                        <button
                            onClick={() => onProcessOut(p.id, 'FAIL')}
                            className="px-6 py-3 bg-[var(--bg-card)] border border-red-500/20 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-4 h-4" /> Suspender
                        </button>
                    </div>
                )}
                {p.status === CashOutStatus.PAID && (
                    <div className="px-8 py-4 bg-emerald-500/10 border-t border-emerald-500/20 text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Pagado y Conciliado
                    </div>
                )}
                {p.status === CashOutStatus.DISPUTED && (
                    <div className="px-8 py-4 bg-red-500/10 border-t border-red-500/20 flex flex-col items-center">
                        <p className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse mb-3">
                            <AlertTriangle className="w-5 h-5" /> Disputa Abierta por el Vendedor
                        </p>
                        <button
                            onClick={() => onProcessOut(p.id, 'PAY')}
                            className="px-6 py-3 bg-[var(--bg-card)] border border-red-500/20 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all w-full flex justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Resolver a favor y Forzar Pago
                        </button>
                    </div>
                )}

                <div className="px-8 py-4 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] text-right flex-shrink-0">
                    <button onClick={onClose} aria-label="Cerrar inspección de cash-out" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors">Cerrar Inspección</button>
                </div>
            </div>
        );
    }
};
