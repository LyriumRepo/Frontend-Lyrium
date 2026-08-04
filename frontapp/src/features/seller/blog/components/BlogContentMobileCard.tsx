'use client';

import { useState, ReactNode } from 'react';
import Icon from '@/components/ui/Icon';
import { ContentStatusActions } from './ContentStatusActions';

interface MetaField {
    label: string;
    value: ReactNode;
}

interface BlogContentMobileCardProps {
    title: string;
    statusBadge: ReactNode;
    thumbnail?: string | null;
    thumbnailIcon?: ReactNode;
    metaFields: MetaField[];
    status: string;
    onUpdateStatus: (status: string) => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function BlogContentMobileCard({
    title, statusBadge, thumbnail, thumbnailIcon, metaFields,
    status, onUpdateStatus, onEdit, onDelete,
}: BlogContentMobileCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-2xl border bg-white dark:bg-[var(--bg-secondary)] overflow-hidden transition-colors ${
            expanded ? 'border-teal-400/40' : 'border-gray-100 dark:border-gray-800'
        }`}>
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 dark:active:bg-gray-800/60 transition-colors"
            >
                {thumbnail ? (
                    <img src={thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : thumbnailIcon ? (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        {thumbnailIcon}
                    </div>
                ) : null}

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
                    {metaFields.map((f, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{f.label}</span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{f.value}</span>
                        </div>
                    ))}
                    <div className="pt-1">
                        <ContentStatusActions status={status} onUpdateStatus={onUpdateStatus} onEdit={onEdit} onDelete={onDelete} />
                    </div>
                </div>
            )}
        </div>
    );
}
