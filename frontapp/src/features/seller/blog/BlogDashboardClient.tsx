'use client';

import { useState, useEffect } from 'react';
import { BookOpen, FileText, Headphones, Video, Clapperboard, Eye, MessageSquare } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { blogApi, BlogDashboard } from '@/shared/lib/api/bioblogRepository';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BLOG_TABS = [
    { label: 'Dashboard', href: '/seller/blog', icon: BookOpen },
    { label: 'Artículos', href: '/seller/blog/articles', icon: FileText },
    { label: 'Podcasts', href: '/seller/blog/podcasts', icon: Headphones },
    { label: 'Vídeos', href: '/seller/blog/videos', icon: Video },
    { label: 'Shorts', href: '/seller/blog/shorts', icon: Clapperboard },
];

function BlogTabs({ current }: { current: string }) {
    const pathname = usePathname();
    return (
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-2xl overflow-x-auto">
            {BLOG_TABS.map(tab => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                            isActive
                                ? 'bg-white dark:bg-[var(--bg-card)] text-teal-600 dark:text-teal-400 shadow-sm border border-gray-200/50 dark:border-teal-500/20'
                                : 'text-gray-400 dark:text-[var(--text-muted)] hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}

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

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
            review: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
            published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            archived: 'bg-gray-200 dark:bg-gray-700 text-gray-400',
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
            <ModuleHeader title="BioBlog" subtitle="Panel de control de contenido" icon="BookOpen" />

            <BlogTabs current="dashboard" />

            {/* KPI Cards */}
            <div className="grid grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                    { label: 'Artículos', value: kpi.articles, icon: FileText, color: 'turquesa' },
                    { label: 'Podcasts', value: kpi.podcasts, icon: Headphones, color: 'turquesaClaro' },
                    { label: 'Videos', value: kpi.videos, icon: Video, color: 'verde' },
                    { label: 'Shorts', value: kpi.shorts, icon: Clapperboard, color: 'turquesa' },
                    { label: 'Vistas', value: kpi.total_views, icon: Eye, color: 'turquesaClaro' },
                    { label: 'Foro Temas', value: kpi.forum_topics, icon: MessageSquare, color: 'lima' },
                    { label: 'Foro Resp.', value: kpi.forum_replies, icon: MessageSquare, color: 'turquesa' },
                ].map(stat => (
                    <div key={stat.label} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-4 text-center">
                        <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color === 'verde' || stat.color === 'lima' ? 'text-[var(--color-success)]' : 'text-[var(--icons-green)]'}`} />
                        <div className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Publications */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Últimas Publicaciones</span>
                    <span className="text-xs text-[var(--text-muted)]">{recent.length} items</span>
                </div>
                {recent.length === 0 ? (
                    <div className="p-10 text-center text-[var(--text-muted)] text-sm">Aún no hay publicaciones</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-800/50 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-5 py-3 whitespace-nowrap">Tipo</th>
                                    <th className="px-5 py-3 whitespace-nowrap">Título</th>
                                    <th className="px-5 py-3 whitespace-nowrap">Estado</th>
                                    <th className="px-5 py-3 whitespace-nowrap">Fecha</th>
                                    <th className="px-5 py-3 whitespace-nowrap">Vistas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((item, i) => (
                                    <tr key={`${item.type}-${item.id}`} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]/30 transition">
                                        <td className="px-5 py-3">{typeIcon(item.type)}</td>
                                        <td className="px-5 py-3 text-gray-700 dark:text-gray-300 font-semibold whitespace-nowrap">{item.title}</td>
                                        <td className="px-5 py-3">{statusBadge(item.status)}</td>
                                        <td className="px-5 py-3 text-gray-400 text-xs">{new Date(item.published_at ?? item.created_at).toLocaleDateString('es-PE')}</td>
                                        <td className="px-5 py-3 text-gray-500">{item.views}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
