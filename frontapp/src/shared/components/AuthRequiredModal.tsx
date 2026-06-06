// src/shared/components/AuthRequiredModal.tsx
'use client';

import Link from 'next/link';
import { X, LogIn, UserPlus, ShoppingCart } from 'lucide-react';
import { useCarritoStore } from '@/store/carritoStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const accentBg = 'var(--pd-accent, #1a3a2a)';
const accent2Bg = 'var(--pd-accent2, #2d5e42)';
const bg2 = 'var(--pd-bg2, #f2f0ea)';

function hoverAccent(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.background = accent2Bg;
}
function leaveAccent(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.background = accentBg;
}
function hoverSecondary(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.background = bg2;
}
function leaveSecondary(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.background = 'transparent';
}
function hoverClose(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = 'var(--pd-ink)';
}
function leaveClose(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = 'var(--pd-ink3)';
}

export default function AuthRequiredModal({ open, onClose }: Props) {
  // Cerramos drawer y popup antes de navegar a /login
  const closeCart = useCarritoStore((s) => s.closeCart);
  const closePopup = useCarritoStore((s) => s.closePopup);

  const handleNavigate = () => {
    closeCart();
    closePopup();
    onClose();
    // La navegación la hace el <Link> normalmente
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90]"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(360px,90vw)]"
        style={{
          background: 'var(--pd-white, #ffffff)',
          border: '1px solid var(--pd-border, rgba(15,14,12,0.10))',
          boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
        }}
      >
        {/* Icono decorativo */}
        <div
          className="w-full flex justify-center pt-8 pb-4"
          style={{ borderBottom: '1px solid var(--pd-border)' }}
        >
          <div
            className="w-14 h-14 flex items-center justify-center"
            style={{
              background: 'var(--pd-accent, #1a3a2a)',
              color: 'var(--pd-accent-fg, #e8f5ee)',
            }}
          >
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 text-center">
          <h2
            id="auth-modal-title"
            className="text-[17px] font-['DM_Serif_Display',Georgia,serif] mb-2"
            style={{ color: 'var(--pd-ink, #0f0e0c)' }}
          >
            Inicia sesión para continuar
          </h2>
          <p
            className="text-[13px] font-light leading-relaxed"
            style={{ color: 'var(--pd-ink3, #7a7970)' }}
          >
            Necesitas una cuenta para completar tu compra. Es rápido y gratuito.
          </p>
        </div>

        {/* CTAs */}
        <div className="px-6 pb-5 flex flex-col gap-2">
          <Link
            href="/login?redirect=/checkout"
            onClick={handleNavigate}
            className="flex items-center justify-center gap-2 w-full py-3 text-[12px] font-medium tracking-[.1em] uppercase transition-colors"
            style={{
              background: accentBg,
              color: 'var(--pd-accent-fg, #e8f5ee)',
            }}
            onMouseEnter={hoverAccent}
            onMouseLeave={leaveAccent}
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Link>

          <Link
            href="/login?redirect=/checkout"
            onClick={handleNavigate}
            className="flex items-center justify-center gap-2 w-full py-3 text-[12px] font-medium tracking-[.1em] uppercase transition-colors"
            style={{
              border: '1px solid var(--pd-border)',
              color: 'var(--pd-ink2, #3a3935)',
              background: 'transparent',
            }}
            onMouseEnter={hoverSecondary}
            onMouseLeave={leaveSecondary}
          >
            <UserPlus className="w-4 h-4" />
            Crear cuenta
          </Link>
        </div>

        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center transition-colors"
          style={{ color: 'var(--pd-ink3)' }}
          onMouseEnter={hoverClose}
          onMouseLeave={leaveClose}
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
