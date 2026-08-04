'use client';

import { Send, CheckCircle, Edit, Trash2 } from 'lucide-react';

interface ContentStatusActionsProps {
    status: string;
    onUpdateStatus: (status: string) => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function ContentStatusActions({ status, onUpdateStatus, onEdit, onDelete }: ContentStatusActionsProps) {
    return (
        <div className="flex gap-1.5 items-center flex-wrap">
            {status === 'draft' && (
                <button onClick={() => onUpdateStatus('pending_review')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gradient-to-r from-emerald-400 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white transition shadow-md shadow-sky-500/20 dark:shadow-[#8FC3A1]/50">
                    <Send className="w-3 h-3 inline mr-1" />Enviar
                </button>
            )}
            {status === 'pending_review' && (
                <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">En revisión</span>
            )}
            {status === 'approved' && (
                <>
                    <button onClick={() => onUpdateStatus('published')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gradient-to-r from-emerald-400 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white transition shadow-md shadow-sky-500/20 dark:shadow-[#8FC3A1]/50">
                        <CheckCircle className="w-3 h-3 inline mr-1" />Publicar
                    </button>
                    <button onClick={() => onUpdateStatus('draft')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 transition">
                        Borrador
                    </button>
                </>
            )}
            {status === 'rejected' && (
                <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500">Rechazado</span>
            )}
            {status === 'published' && (
                <button onClick={() => onUpdateStatus('approved')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 transition">
                    Ocultar
                </button>
            )}
            {status === 'archived' && (
                <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400">Archivado</span>
            )}
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-500 transition"><Edit className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition"><Trash2 className="w-4 h-4" /></button>
        </div>
    );
}
