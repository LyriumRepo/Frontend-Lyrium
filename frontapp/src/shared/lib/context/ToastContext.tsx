'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Icon from '@/components/ui/Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev.slice(-2), { id, message, type }]); // Max 3 toasts

        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[100001] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <BaseToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

// Internal Component for the Toast Item
const BaseToastItem = ({ toast, onClose }: { toast: Toast, onClose: () => void }) => {
    const icons = {
        success: { name: 'CheckCircle2', color: 'text-emerald-500' },
        error: { name: 'XCircle', color: 'text-rose-500' },
        info: { name: 'Info', color: 'text-sky-500' },
        warning: { name: 'AlertTriangle', color: 'text-amber-500' }
    };

    const backgrounds = {
        success: 'bg-emerald-50/90 border-emerald-100',
        error: 'bg-rose-50/90 border-rose-100',
        info: 'bg-sky-50/90 border-sky-100',
        warning: 'bg-amber-50/90 border-amber-100'
    };

    const currentIcon = icons[toast.type];

    return (
        <div className={`
            ${backgrounds[toast.type]} 
            backdrop-blur-xl border p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md 
            animate-slideInRight pointer-events-auto
        `}>
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Icon name={currentIcon.name} className={`${currentIcon.color} w-6 h-6`} />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Sistema Operativo
                </p>
                <p className="text-[11px] font-black text-gray-800 leading-tight">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
            >
                <Icon name="X" className="w-5 h-5" />
            </button>
        </div>
    );
};
