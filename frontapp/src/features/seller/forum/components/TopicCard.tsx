'use client';

import { useState, ReactNode } from 'react';
import { Eye, MessageCircle, ThumbsUp, ImageIcon } from 'lucide-react';
import Icon from '@/components/ui/Icon';

interface TopicCardProps {
    image: string | null;
    title: string;
    category: string;
    statusBadge: ReactNode;
    replyCount: number;
    views: number;
    reactions: number;
    date: string;
    actions: ReactNode;
}

export function TopicCard({ image, title, category, statusBadge, replyCount, views, reactions, date, actions }: TopicCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-2xl border bg-white dark:bg-[var(--bg-secondary)] overflow-hidden transition-colors ${
            expanded ? 'border-teal-400/40' : 'border-gray-100 dark:border-gray-800'
        }`}>
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 dark:active:bg-gray-800/60 transition-colors"
            >
                {image ? (
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-[var(--bg-primary)] flex-shrink-0">
                        <img src={image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                ) : (
                    <div className="w-12 h-9 rounded-lg bg-slate-100 dark:bg-[var(--bg-primary)] flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate leading-tight">{title}</p>
                    <div className="mt-1">{statusBadge}</div>
                </div>

                <Icon
                    name={expanded ? 'ChevronUp' : 'ChevronDown'}
                    className="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform"
                />
            </button>

            {expanded && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Categoría</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{category || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Fecha</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{date}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Respuestas</p>
                            <span className="flex items-center gap-1 text-sm font-black text-gray-700 dark:text-gray-300"><MessageCircle className="w-3.5 h-3.5" />{replyCount}</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Vistas</p>
                            <span className="flex items-center gap-1 text-sm font-black text-gray-700 dark:text-gray-300"><Eye className="w-3.5 h-3.5" />{views}</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Reacciones</p>
                            <span className="flex items-center gap-1 text-sm font-black text-gray-700 dark:text-gray-300"><ThumbsUp className="w-3.5 h-3.5" />{reactions}</span>
                        </div>
                    </div>
                    <div className="pt-1 flex flex-wrap gap-2">{actions}</div>
                </div>
            )}
        </div>
    );
}
