'use client';

import { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Store,
  Clock,
} from 'lucide-react';
import ModalsPortal from '@/components/layout/shared/ModalsPortal';
import type { ServiceStatus } from '@/features/admin/sellers/types';

interface Props {
  service: {
    id: number;
    name: string;
    seller: string;
    category: string;
    price: number;
    date: string;
    rejection_reason?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (serviceId: number, action: ServiceStatus, reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function ServiceModerationModal({
  service,
  isOpen,
  onClose,
  onAction,
  isSubmitting,
}: Props) {
  const [reason, setReason] = useState('');
  const [pendingAction, setPendingAction] = useState<ServiceStatus | null>(null);

  if (!isOpen || !service) return null;

  const handleConfirm = async () => {
    if (!pendingAction) return;
    if (pendingAction === 'REJECTED' && reason.trim().length < 10) return;
    try {
      await onAction(service.id, pendingAction, reason);
      onClose();
    } catch {
      // El error ya se muestra vía toast en el padre; el modal se mantiene abierto para reintentar.
    }
  };

  return (
    <ModalsPortal>
      <div
        className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden pointer-events-auto"
          style={{ borderRadius: '2rem' }}
        >
          <div
            className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5 border-b border-[var(--border-subtle)]"
            style={{
              background:
                'linear-gradient(90deg, rgba(14,165,233,.08), rgba(132,204,22,.06))',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--icons-green)]/10 rounded-xl">
                <Store className="w-5 h-5 text-[var(--icons-green)]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">
                  Revisión de Servicio
                </h2>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                  Aprobación de servicios
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                {service.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                <Store className="w-3.5 h-3.5 text-[var(--icons-green)]" />
                {service.seller}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                <Clock className="w-3.5 h-3.5" />
                {service.date}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                  {service.category}
                </span>
                <span className="font-black text-[var(--text-primary)]">
                  S/ {service.price.toFixed(2)}
                </span>
              </div>
            </div>

            {service.rejection_reason && (
              <div
                className="p-4 flex items-start gap-3"
                style={{
                  background: 'rgba(251,191,36,.08)',
                  border: '1px solid rgba(251,191,36,.25)',
                  borderRadius: '1rem',
                }}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">
                    Rechazo anterior
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {service.rejection_reason}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
              {!pendingAction && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingAction('APPROVED')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 hover:bg-[var(--color-success)] hover:text-white"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar servicio
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingAction('REJECTED')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 hover:bg-[var(--color-error)] hover:text-white"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar servicio
                  </button>
                </div>
              )}

              {pendingAction && (
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background:
                        pendingAction === 'APPROVED'
                          ? 'rgba(34,197,94,.1)'
                          : 'rgba(239,68,68,.1)',
                      border: `1px solid ${pendingAction === 'APPROVED' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                      color:
                        pendingAction === 'APPROVED'
                          ? 'rgb(34,197,94)'
                          : 'rgb(239,68,68)',
                    }}
                  >
                    {pendingAction === 'APPROVED' ? (
                      <><CheckCircle className="w-4 h-4" /> Confirmando aprobación</>
                    ) : (
                      <><XCircle className="w-4 h-4" /> Confirmando rechazo</>
                    )}
                  </div>

                  {(() => {
                    const minLen = 10;
                    const tooShort = pendingAction === 'REJECTED' && reason.trim().length > 0 && reason.trim().length < minLen;
                    return (
                      <div>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={3}
                          placeholder={
                            pendingAction === 'REJECTED'
                              ? 'Motivo de rechazo (obligatorio, mín. 10 caracteres)…'
                              : 'Notas de auditoría (opcional)…'
                          }
                          required={pendingAction === 'REJECTED'}
                          className={`w-full p-3 text-[12px] font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border rounded-xl resize-none focus:outline-none focus:ring-2 placeholder:text-[var(--text-secondary)] ${
                            tooShort
                              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
                              : 'border-[var(--border-subtle)] focus:ring-[var(--icons-green)]/20'
                          }`}
                        />
                        {pendingAction === 'REJECTED' && (
                          <p className={`text-[10px] font-bold mt-1.5 ${tooShort ? 'text-[var(--color-error)]' : 'text-[var(--text-secondary)]'}`}>
                            {tooShort
                              ? `Faltan ${minLen - reason.trim().length} caracteres para poder confirmar el rechazo.`
                              : `${reason.trim().length}/${minLen} caracteres mínimos`}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setPendingAction(null); setReason(''); }}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-all disabled:opacity-40"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={
                        isSubmitting ||
                        (pendingAction === 'REJECTED' && reason.trim().length < 10)
                      }
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        pendingAction === 'APPROVED'
                          ? 'bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white'
                          : 'bg-[var(--color-error)] hover:bg-[var(--color-error)] text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
                      ) : pendingAction === 'APPROVED' ? (
                        <><CheckCircle className="w-4 h-4" /> Confirmar aprobación</>
                      ) : (
                        <><XCircle className="w-4 h-4" /> Confirmar rechazo</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalsPortal>
  );
}
