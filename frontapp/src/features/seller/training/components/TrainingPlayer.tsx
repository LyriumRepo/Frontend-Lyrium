'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import Modal from '@/features/seller/plans/shared/Modal';
import type { SellerTraining } from '../types';

function getEmbedUrl(url: string, platform: string): string {
    if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
    if (platform === 'vimeo' || url.includes('vimeo.com')) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
}

interface Props {
    training: SellerTraining | null;
    onClose: () => void;
    onToggleComplete: (t: SellerTraining) => void;
    toggling: boolean;
}

export default function TrainingPlayer({ training, onClose, onToggleComplete, toggling }: Props) {
    if (!training) return null;

    const embedUrl = getEmbedUrl(training.url, training.platform);

    return (
        <Modal open={!!training} onClose={onClose} className="w-full max-w-4xl">
            <div className="space-y-4">
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] pr-8">{training.title}</h2>

                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                    {embedUrl.startsWith('http') ? (
                        <iframe
                            src={embedUrl}
                            title={training.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white">
                            <p className="text-sm">No se pudo cargar el reproductor. <a href={training.url} target="_blank" rel="noopener noreferrer" className="underline">Abrir enlace</a></p>
                        </div>
                    )}
                </div>

                {training.description && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{training.description}</p>
                )}

                {training.is_required && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--brand-teal)]/10 border border-[var(--brand-teal)]/20">
                        <Icon name="AlertTriangle" className="w-4 h-4 text-[var(--brand-teal)]" />
                        <span className="text-[11px] font-bold text-[var(--brand-teal)]">Capacitación obligatoria</span>
                    </div>
                )}

                <button
                    onClick={() => onToggleComplete(training)}
                    disabled={toggling}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                        training.completed
                            ? 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                            : 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white hover:opacity-90'
                    }`}
                >
                    {toggling ? (
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : training.completed ? (
                        <>
                            <Icon name="CheckSquare" className="w-4 h-4" />
                            Marcar como pendiente
                        </>
                    ) : (
                        <>
                            <Icon name="Check" className="w-4 h-4" />
                            Marcar como completado
                        </>
                    )}
                </button>
            </div>
        </Modal>
    );
}
