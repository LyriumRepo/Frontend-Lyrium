'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
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

function getPlatformBadgeStyle(platform: string): string {
    switch (platform) {
        case 'youtube': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        case 'vimeo': return 'bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] border-[var(--brand-sky)]/20';
        case 'drive': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        default: return 'bg-[var(--brand-teal)]/10 text-[var(--brand-teal)] border-[var(--brand-teal)]/20';
    }
}

function getPlatformLabel(platform: string): string {
    switch (platform) {
        case 'youtube': return 'YouTube';
        case 'vimeo': return 'Vimeo';
        case 'drive': return 'Google Drive';
        default: return platform;
    }
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
        <BaseModal
            isOpen={!!training}
            onClose={onClose}
            title={training.title}
            size="4xl"
        >
            <div className="space-y-5">
                {/* Video player */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                    {embedUrl.startsWith('http') ? (
                        <iframe
                            src={embedUrl}
                            title={training.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white gap-3">
                            <Icon name="AlertCircle" className="w-8 h-8 text-white/50" />
                            <p className="text-sm text-white/70">No se pudo cargar el reproductor</p>
                            <a href={training.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold text-[var(--brand-sky)] hover:underline">
                                Abrir enlace externo
                            </a>
                        </div>
                    )}
                </div>

                {/* Info section */}
                <div className="space-y-3">
                    {/* Meta badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getPlatformBadgeStyle(training.platform)}`}>
                            {getPlatformLabel(training.platform)}
                        </span>
                        {training.category && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                <Icon name="FolderOpen" className="w-2.5 h-2.5" />
                                {training.category}
                            </span>
                        )}
                        {training.is_required && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] border border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20">
                                <Icon name="Shield" className="w-2.5 h-2.5" /> Obligatorio
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {training.description && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{training.description}</p>
                    )}
                </div>

                {/* Action button */}
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <BaseButton
                        variant={training.completed ? 'secondary' : 'primary'}
                        size="lg"
                        fullWidth
                        leftIcon={training.completed ? 'CheckSquare' : 'Check'}
                        onClick={() => onToggleComplete(training)}
                        isLoading={toggling}
                    >
                        {training.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                    </BaseButton>
                </div>
            </div>
        </BaseModal>
    );
}
