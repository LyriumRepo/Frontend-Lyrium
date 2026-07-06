'use client';

import React, { useState, useCallback } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="sm" ariaDescribedby="confirm-dialog-desc">
      <p id="confirm-dialog-desc" className="text-sm font-medium text-[var(--text-secondary)] mb-8">
        {message}
      </p>
      <div className="flex gap-3">
        <BaseButton
          variant="ghost"
          onClick={onClose}
          className="flex-1"
          size="md"
        >
          {cancelText}
        </BaseButton>
        <BaseButton
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1"
          size="md"
        >
          {confirmText}
        </BaseButton>
      </div>
    </BaseModal>
  );
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  resolve: (value: boolean) => void;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback(
    (title: string, message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({ isOpen: true, title, message, resolve });
      });
    },
    [],
  );

  const handleClose = useCallback(() => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  }, [state]);

  const handleConfirm = useCallback(() => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  }, [state]);

  function ConfirmDialogComponent() {
    if (!state) return null;
    return (
      <ConfirmDialog
        isOpen={state.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={state.title}
        message={state.message}
      />
    );
  }

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}

export default ConfirmDialog;
