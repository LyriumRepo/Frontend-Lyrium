'use client';

import { useState, useEffect } from 'react';
import { BookOpen, FileText, Headphones, Video, Clapperboard, Eye, MessageSquare, ArrowRight } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { blogApi, BlogDashboard } from '@/shared/lib/api/bioblogRepository';
import Link from 'next/link';

// ─── Mobile accordion card para publicaciones recientes ──────────────────────

interface MobileRecentCardProps {
    item:        { type: string; id: number | string; title: string; status: string; published_at?: string | null; created_at: string; views: number };
    typeIcon:    (type: string) => React.ReactNode;
    statusBadge: (status: string) => React.ReactNode;
}

function MobileRecentCard({ item, typeIcon, statusBadge }: MobileRecentCardProps) {
    const [expanded, setExpanded] = useState(false);

    const typeLabels: Record<string, string> = {
        article: 'Artículo',
        podcast: 'Podcast',
        video:   'Video',
        short:   'Short',
    };

    return (
        <div>
            {/* ── Fila colapsada ── */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 active:bg-gray-100 transition-colors"
            >
                {/* Ícono de tipo */}
                <span className="text-gray-400 flex-shrink-0">
                    {typeIcon(item.type)}
                </span>

                {/* Título */}
                <span className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 truncate text-left">
                    {item.title}
                </span>

                {/* Badge estado */}
                <span className="flex-shrink-0">
                    {statusBadge(item.status)}
                </span>

                <svg
                    className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* ── Panel expandido ── */}
            {expanded && (
                <div className="px-4 pb-3.5 pt-0 grid grid-cols-3 gap-3 border-t border-gray-50 dark:border-gray-800/50">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Tipo</p>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {typeLabels[item.type] ?? item.type}
                        </span>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Fecha</p>
                        <span className="text-xs text-gray-400">
                            {new Date(item.published_at ?? item.created_at).toLocaleDateString('es-PE')}
                        </span>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Vistas</p>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{item.views}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export function BlogDashboardClient() {
    const [data, setData] = useState<BlogDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogApi.dashboard()
            .then(res => setData(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-20 text-center text-gray-400">Cargando dashboard...</div>;
    if (!data) return <div className="p-20 text-center text-gray-400">Error al cargar</div>;

    const { kpi, recent } = data;

    const quickActions = [
        { label: 'Nuevo Artículo', href: '/seller/blog/articles', icon: FileText },
        { label: 'Nuevo Podcast', href: '/seller/blog/podcasts', icon: Headphones },
        { label: 'Nuevo Video', href: '/seller/blog/videos', icon: Video },
        { label: 'Nuevo Short', href: '/seller/blog/shorts', icon: Clapperboard },
    ];

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
            review: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            archived: 'bg-red-100 dark:bg-red-900/30 text-red-500',
        };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status] || styles.draft}`}>{status}</span>;
    };

    const typeIcon = (type: string) => {
        const icons: Record<string, any> = { article: FileText, podcast: Headphones, video: Video, short: Clapperboard };
        const Icon = icons[type] || FileText;
        return <Icon className="w-3.5 h-3.5" />;
    };

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            {/* break-words fuerza el título del ModuleHeader a romper en móvil */}
            <div className="[&_h1]:!whitespace-normal [&_h1]:!break-words [&_h2]:!whitespace-normal [&_h2]:!break-words [&_p]:!whitespace-normal">
                <ModuleHeader title="BioBlog" subtitle="Panel de control de contenido" icon="BookOpen" />
            </div>

            {/* KPI Cards — 2 cols móvil · 4 cols sm · 7 cols lg */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
                {[
                    { label: 'Artículos', value: kpi.articles, icon: FileText, color: 'text-sky-500' },
                    { label: 'Podcasts', value: kpi.podcasts, icon: Headphones, color: 'text-purple-500' },
                    { label: 'Videos', value: kpi.videos, icon: Video, color: 'text-rose-500' },
                    { label: 'Shorts', value: kpi.shorts, icon: Clapperboard, color: 'text-orange-500' },
                    { label: 'Vistas', value: kpi.total_views, icon: Eye, color: 'text-emerald-500' },
                    { label: 'Foro Temas', value: kpi.forum_topics, icon: MessageSquare, color: 'text-blue-500' },
                    { label: 'Foro Resp.', value: kpi.forum_replies, icon: MessageSquare, color: 'text-indigo-500' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 text-center">
                        <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-2xl font-black text-gray-800 dark:text-gray-200">{stat.value}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions — 2 cols móvil · 4 cols sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map(action => (
                    <Link key={action.label} href={action.href}
                        className="flex items-center justify-between p-4 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-sky-200 dark:hover:border-sky-800 transition group">
                        <div className="flex items-center gap-3">
                            <action.icon className="w-5 h-5 text-sky-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{action.label}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 transition" />
                    </Link>
                ))}
            </div>

            {/* Recent Publications */}
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Últimas Publicaciones</span>
                    <span className="text-xs text-gray-400">{recent.length} items</span>
                </div>

                {recent.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm">Aún no hay publicaciones</div>
                ) : (
                    <>
                        {/* ══ MÓVIL: accordion cards (sm:hidden) ══════════════════ */}
                        <div className="sm:hidden divide-y divide-gray-50 dark:divide-gray-800/50">
                            {recent.map((item) => (
                                <MobileRecentCard
                                    key={`${item.type}-${item.id}`}
                                    item={item}
                                    typeIcon={typeIcon}
                                    statusBadge={statusBadge}
                                />
                            ))}
                        </div>

                        {/* ══ DESKTOP: tabla completa (hidden sm:block) ══════════ */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-50 dark:border-gray-800/50 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="px-5 py-3">Tipo</th>
                                        <th className="px-5 py-3">Título</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3">Fecha</th>
                                        <th className="px-5 py-3">Vistas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((item) => (
                                        <tr key={`${item.type}-${item.id}`} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                            <td className="px-5 py-3">{typeIcon(item.type)}</td>
                                            <td className="px-5 py-3 text-gray-700 dark:text-gray-300 font-semibold max-w-xs truncate">{item.title}</td>
                                            <td className="px-5 py-3">{statusBadge(item.status)}</td>
                                            <td className="px-5 py-3 text-gray-400 text-xs">{new Date(item.published_at ?? item.created_at).toLocaleDateString('es-PE')}</td>
                                            <td className="px-5 py-3 text-gray-500">{item.views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}