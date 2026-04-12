'use client';

import React from 'react';
import { Branch } from '@/features/seller/store/types';
import Icon from '@/components/ui/Icon';

interface BranchCardProps {
    branch: Branch;
    onEdit: (branch: Branch) => void;
    onDelete: (id: string) => void;
}

export default function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
    return (
        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl relative group hover:shadow-xl hover:shadow-black/5 transition-all">
            {branch.isPrincipal && (
                <span className="absolute top-4 right-4 bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                    Principal
                </span>
            )}
            <h4 className="font-black text-[var(--text-primary)] flex items-center gap-2">
                <Icon name="Store" className="text-purple-500 w-4 h-4" /> {branch.name}
            </h4>

            <div className="space-y-2 mt-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                    <Icon name="MapPin" className="text-purple-400 w-4 h-4" />
                    <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                    <Icon name="Building2" className="text-purple-400 w-4 h-4" />
                    <span>{branch.city}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                    <Icon name="Phone" className="text-purple-400 w-4 h-4" />
                    <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                    <Icon name="Clock" className="text-purple-400 w-4 h-4" />
                    <span>{branch.hours}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(branch)}
                    className="p-2 text-[var(--text-secondary)] hover:text-sky-500 transition-colors"
                >
                    <Icon name="Pencil" className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(branch.id)}
                    className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                >
                    <Icon name="Trash2" className="w-5 h-5" />
                </button>
                <div className="flex-1"></div>
                {branch.mapsUrl && (
                    <a
                        href={branch.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] font-black text-purple-500 hover:underline uppercase"
                    >
                        <Icon name="Map" className="w-3 h-3" /> Maps URL
                    </a>
                )}
            </div>
        </div>
    );
}
