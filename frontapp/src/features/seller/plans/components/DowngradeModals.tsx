'use client';
import Modal from '@/features/seller/plans/shared/Modal';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import type { PlansMap } from '@/features/seller/plans/types';

interface DowngradeProps {
  open: boolean; plan: string | null; plansData: PlansMap;
  onClose: () => void; onConfirm: () => void;
}

export function DowngradeModal({ open, plan, plansData, onClose, onConfirm }: DowngradeProps) {
  const data = plan ? plansData[plan] : null;
  return (
    <Modal open={open} onClose={onClose} className="downgrade-confirm-modal">
      {/* Ícono circular con fondo */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'18px' }}>
        <div style={{
          width:'72px', height:'72px', borderRadius:'50%',
          background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
      </div>
      <h2 className="waiting-title" style={{ color:'#d97706', marginBottom:'10px' }}>¿Cambiar a un plan menor?</h2>
      <p className="waiting-text" style={{ marginBottom:'24px' }}>
        Estás a punto de cambiar tu plan a <strong>{data?.name ?? plan}</strong>. Perderás acceso a algunas funciones de tu plan actual.
      </p>
      <div style={{ display:'flex', gap:'10px' }}>
        <button className="dg-btn dg-btn-cancel" onClick={onClose}>Cancelar</button>
        <button className="dg-btn dg-btn-warn" onClick={onConfirm}>Sí, continuar</button>
      </div>
    </Modal>
  );
}

interface DowngradeConfirm2Props {
  open: boolean; plan: string | null; plansData: PlansMap;
  confirmText: string; onCancel: () => void; onExecute: () => void;
}

export function DowngradeConfirm2Modal({ open, plan, plansData, confirmText, onCancel, onExecute }: DowngradeConfirm2Props) {
  const data = plan ? plansData[plan] : null;
  return (
    <Modal open={open} onClose={onCancel} className="downgrade-confirm-modal">
      <h2 className="waiting-title" style={{ color:'#ef4444', marginBottom:'10px' }}>Última confirmación</h2>
      <p className="waiting-text" style={{ marginBottom:'24px' }}>
        ¿Confirmas el cambio al plan <strong>{data?.name ?? plan}</strong>?{' '}
        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(confirmText) }} />
      </p>
      <div style={{ display:'flex', gap:'10px' }}>
        <button className="dg-btn dg-btn-cancel" onClick={onCancel}>Cancelar</button>
        <button className="dg-btn dg-btn-danger" onClick={onExecute}>Confirmar cambio</button>
      </div>
    </Modal>
  );
}
