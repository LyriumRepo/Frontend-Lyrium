'use client';

import { useState, useCallback } from 'react';
import BaseModal from './BaseModal';
import BaseButton from './BaseButton';

interface ConfirmDialogState {
    open: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
}

const initialState: ConfirmDialogState = {
    open: false,
    title: '',
    description: '',
    onConfirm: null,
};

export function useConfirmDialog() {
    const [state, setState] = useState<ConfirmDialogState>(initialState);

    const confirm = useCallback((title: string, description: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                open: true,
                title,
                description,
                onConfirm: () => resolve(true),
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        state.onConfirm?.();
        setState(initialState);
    }, [state.onConfirm]);

    const handleCancel = useCallback(() => {
        setState(initialState);
    }, []);

    return {
        confirm,
        ConfirmDialog: () => (
            <BaseModal
                isOpen={state.open}
                onClose={handleCancel}
                title={state.title}
                size="sm"
                showCloseButton={false}
            >
                <div className="space-y-6">
                    <p id="confirm-description" className="text-gray-600">{state.description}</p>
                    <div className="flex gap-3 justify-end">
                        <BaseButton variant="secondary" onClick={handleCancel}>
                            Cancelar
                        </BaseButton>
                        <BaseButton variant="danger" onClick={handleConfirm}>
                            Confirmar
                        </BaseButton>
                    </div>
                </div>
            </BaseModal>
        ),
    };
}
