'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, ImageIcon, Folder, FolderOpen, FileText, ShoppingBag, Briefcase } from 'lucide-react';
import type { CategoryNode } from '../hooks/useCategories';

interface CategoryTreeProps {
    tree: CategoryNode[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

const LEVEL_COLORS = [
    'text-sky-600 dark:text-sky-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-amber-600 dark:text-amber-400',
];

const LEVEL_BADGES = ['N1', 'N2', 'N3'];

function TreeNode({
    node,
    level,
    selectedId,
    onSelect,
}: {
    node: CategoryNode;
    level: number;
    selectedId: number | null;
    onSelect: (id: number) => void;
}) {
    const [expanded, setExpanded] = useState(level < 1);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;
    const hasImage = node.image !== null;

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    onSelect(node.id);
                    if (hasChildren) setExpanded(!expanded);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isSelected
                        ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] border border-transparent'
                }`}
                style={{ paddingLeft: `${level * 20 + 12}px` }}
            >
                {/* Expand/collapse */}
                {hasChildren ? (
                    expanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )
                ) : (
                    <span className="w-4 flex-shrink-0" />
                )}

                {/* Icon */}
                {level === 0 ? (
                    expanded ? (
                        <FolderOpen className={`w-4 h-4 flex-shrink-0 ${LEVEL_COLORS[0]}`} />
                    ) : (
                        <Folder className={`w-4 h-4 flex-shrink-0 ${LEVEL_COLORS[0]}`} />
                    )
                ) : level === 1 ? (
                    <Folder className={`w-4 h-4 flex-shrink-0 ${LEVEL_COLORS[1]}`} />
                ) : (
                    <FileText className={`w-4 h-4 flex-shrink-0 ${LEVEL_COLORS[2]}`} />
                )}

                {/* Name */}
                <span
                    className={`truncate text-left flex-1 ${
                        isSelected ? 'font-semibold text-sky-700 dark:text-sky-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                    {node.name}
                </span>

                {/* Badges */}
                {hasImage && (
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                )}
                <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        level === 0
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                            : level === 1
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                >
                    {LEVEL_BADGES[level] ?? `N${level + 1}`}
                </span>
            </button>

            {/* Children */}
            {hasChildren && expanded && (
                <div>
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface GroupHeaderProps {
    label: string;
    icon: React.ReactNode;
    count: number;
    color: string;
    expanded: boolean;
    onToggle: () => void;
}

function GroupHeader({ label, icon, count, color, expanded, onToggle }: GroupHeaderProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${color}`}
        >
            {expanded ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            {icon}
            <span className="flex-1 text-left uppercase tracking-wide">{label}</span>
            <span className="text-xs font-semibold opacity-60">{count}</span>
        </button>
    );
}

export default function CategoryTree({ tree, selectedId, onSelect }: CategoryTreeProps) {
    const [productsExpanded, setProductsExpanded] = useState(true);
    const [servicesExpanded, setServicesExpanded] = useState(true);

    const { productCategories, serviceCategories } = useMemo(() => {
        const products: CategoryNode[] = [];
        const services: CategoryNode[] = [];
        for (const node of tree) {
            if (node.type === 'service') {
                services.push(node);
            } else {
                products.push(node);
            }
        }
        return { productCategories: products, serviceCategories: services };
    }, [tree]);

    if (tree.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 text-sm">
                No hay categorias. Crea la primera.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* PRODUCTOS */}
            {productCategories.length > 0 && (
                <div>
                    <GroupHeader
                        label="Productos"
                        icon={<ShoppingBag className="w-4 h-4 flex-shrink-0" />}
                        count={productCategories.length}
                        color="bg-blue-50 dark:bg-blue-900/15 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/25"
                        expanded={productsExpanded}
                        onToggle={() => setProductsExpanded(!productsExpanded)}
                    />
                    {productsExpanded && (
                        <div className="mt-1 ml-2 border-l-2 border-blue-100 dark:border-blue-900/30 pl-1">
                            {productCategories.map((node) => (
                                <TreeNode
                                    key={node.id}
                                    node={node}
                                    level={0}
                                    selectedId={selectedId}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SERVICIOS */}
            {serviceCategories.length > 0 && (
                <div>
                    <GroupHeader
                        label="Servicios"
                        icon={<Briefcase className="w-4 h-4 flex-shrink-0" />}
                        count={serviceCategories.length}
                        color="bg-violet-50 dark:bg-violet-900/15 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/25"
                        expanded={servicesExpanded}
                        onToggle={() => setServicesExpanded(!servicesExpanded)}
                    />
                    {servicesExpanded && (
                        <div className="mt-1 ml-2 border-l-2 border-violet-100 dark:border-violet-900/30 pl-1">
                            {serviceCategories.map((node) => (
                                <TreeNode
                                    key={node.id}
                                    node={node}
                                    level={0}
                                    selectedId={selectedId}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
