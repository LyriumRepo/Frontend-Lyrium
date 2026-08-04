'use client';

/**
 * ProfileRequestReview.tsx
 * Revisión de solicitudes de cambio de datos del vendedor (StoreProfileRequest).
 * Conectado al backend via useControlVendedores (sellerApi.getAllProfileRequests
 * / approveProfileRequest / rejectProfileRequest).
 */

import React, { useState } from 'react';
import BaseButton from '@/components/ui/BaseButton';
import ModalsPortal from '@/components/layout/shared/ModalsPortal';
import { X } from 'lucide-react';
import { useToast } from '@/shared/lib/context/ToastContext';

interface ProfileRequestItem {
  id: number;
  store_id: number;
  store_name: string;
  seller_name: string | null;
  seller_email: string | null;
  status: string;
  attempts: number;
  data: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface ProfileRequestReviewProps {
  requests: ProfileRequestItem[];
  loading: boolean;
  error: string | null;
  onApprove: (id: number, notes?: string) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
}

const FIELD_LABELS: Record<string, string> = {
  ruc: 'RUC',
  razon_social: 'Razón Social',
  nombre_comercial: 'Nombre Comercial',
  cuenta_bcp: 'Cuenta BCP',
  cci: 'CCI',
  bank_secondary: 'Banco Secundario',
  rep_legal_nombre: 'Rep. Legal (Nombre)',
  rep_legal_dni: 'Rep. Legal (DNI)',
  rep_legal_foto: 'Rep. Legal (Foto)',
  direccion_fiscal: 'Dirección Fiscal',
  tax_condition: 'Condición Tributaria',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  website: 'Sitio Web',
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20' },
  approved: { label: 'Aprobada', cls: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' },
  rejected: { label: 'Rechazada', cls: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20' },
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export function ProfileRequestReview({
  requests,
  loading,
  error,
  onApprove,
  onReject,
}: ProfileRequestReviewProps) {
  const { showToast } = useToast();
  const [rejectTarget, setRejectTarget] = useState<ProfileRequestItem | null>(null);
  const [reason, setReason] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleApprove = async (req: ProfileRequestItem) => {
    if (busyId) return;
    setBusyId(req.id);
    try {
      await onApprove(req.id);
      showToast(`Solicitud #${req.id} aprobada`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo aprobar la solicitud', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || busyId) return;
    if (reason.trim().length < 10) {
      showToast('El motivo de rechazo debe tener al menos 10 caracteres', 'error');
      return;
    }
    setBusyId(rejectTarget.id);
    try {
      await onReject(rejectTarget.id, reason.trim());
      showToast(`Solicitud #${rejectTarget.id} rechazada`, 'success');
      setRejectTarget(null);
      setReason('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo rechazar la solicitud', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Solicitudes de Cambio de Datos
          </h2>
          <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
            Validación de actualizaciones de perfil del vendedor
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-2xl text-[var(--color-error)] font-bold text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 flex items-center justify-center text-[var(--text-secondary)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--icons-green)] mr-3" />
          Cargando solicitudes...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">
            <X className="w-6 h-6" />
          </div>
          <p className="text-sm font-black text-[var(--text-primary)]">
            Sin solicitudes de cambio de datos
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
            Cuando un vendedor solicite actualizar su perfil, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const cfg = STATUS_CONFIG[req.status] ?? {
              label: req.status,
              cls: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
            };
            const fields = Object.entries(req.data ?? {}).filter(([, v]) => v);
            return (
              <div
                key={req.id}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-black text-sm flex-shrink-0">
                      {req.store_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[var(--text-primary)] truncate">
                        {req.store_name}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {req.seller_name ?? 'Vendedor'}
                        {req.seller_email ? ` · ${req.seller_email}` : ''}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                        {formatFecha(req.created_at)} · Intento #{req.attempts}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </div>

                {fields.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fields.map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5"
                      >
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                          {FIELD_LABELS[key] ?? key}
                        </p>
                        <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 break-words">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <BaseButton
                      variant="primary"
                      size="sm"
                      isLoading={busyId === req.id}
                      disabled={busyId !== null}
                      onClick={() => handleApprove(req)}
                    >
                      Aprobar cambios
                    </BaseButton>
                    <BaseButton
                      variant="danger"
                      size="sm"
                      isLoading={busyId === req.id}
                      disabled={busyId !== null}
                      onClick={() => { setReason(''); setRejectTarget(req); }}
                    >
                      Rechazar
                    </BaseButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <ModalsPortal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div
              role="button"
              tabIndex={0}
              className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fadeIn"
              onClick={() => setRejectTarget(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setRejectTarget(null);
              }}
            />
            <div className="relative bg-[var(--bg-card)] w-full max-w-md max-h-[90vh] overflow-y-auto green-scrollbar rounded-[2.5rem] shadow-2xl p-6 sm:p-10 animate-scaleUp border border-[var(--border-subtle)] font-industrial">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-base sm:text-xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
                Rechazar solicitud
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 mb-6 font-medium leading-relaxed">
                Solicitud #{rejectTarget.id} — {rejectTarget.store_name}. Indica el motivo
                para que el vendedor pueda corregir y reintentar.
              </p>

              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 ml-2">
                Motivo del rechazo *
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detalla los motivos técnicos o de documentación..."
                className="w-full p-5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl font-medium text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--icons-green)]/10 focus:bg-[var(--bg-card)] transition-all resize-none text-[11px] placeholder:text-[var(--text-secondary)]"
              />

              <div className="flex gap-4 pt-6">
                <BaseButton
                  variant="secondary"
                  size="md"
                  onClick={() => setRejectTarget(null)}
                  className="flex-1"
                >
                  Cancelar
                </BaseButton>
                <BaseButton
                  variant="danger"
                  size="md"
                  isLoading={busyId === rejectTarget.id}
                  disabled={reason.trim().length < 10}
                  onClick={handleReject}
                  className="flex-1"
                >
                  Confirmar rechazo
                </BaseButton>
              </div>
            </div>
          </div>
        </ModalsPortal>
      )}
    </div>
  );
}
