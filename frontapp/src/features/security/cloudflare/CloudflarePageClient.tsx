'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Skeleton from '@/components/ui/Skeleton';
import { Cloud, Shield, Activity, Globe, Trash2, RefreshCw, AlertCircle, CheckCircle, XCircle, Server, Database, Zap, BarChart3, FileText } from 'lucide-react';
import * as cfApi from '@/shared/lib/api/cloudflareRepository';
import type { CloudflareStatus, CloudflareZone, CloudflareAnalytics, CloudflareSecurity, CloudflareDNSRecord, CloudflareFirewallEvent } from './types';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatNumber(n: number): string {
    return new Intl.NumberFormat('es-PE').format(n);
}

function cfStatusBadge(status: string | undefined) {
    if (!status) return null;
    const map: Record<string, { label: string; class: string }> = {
        active: { label: 'Activo', class: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
        pending: { label: 'Pendiente', class: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
        deleted: { label: 'Eliminado', class: 'bg-red-100 dark:bg-red-900/30 text-red-500' },
        moved: { label: 'Movido', class: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' },
        connected: { label: 'Conectado', class: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
        unauthenticated: { label: 'No autenticado', class: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' },
        connection_error: { label: 'Error conexión', class: 'bg-red-100 dark:bg-red-900/30 text-red-500' },
    };
    const m = map[status] ?? { label: status, class: 'bg-gray-100 dark:bg-gray-800 text-gray-500' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${m.class}`}>{m.label}</span>;
}

export default function CloudflarePageClient() {
    const [status, setStatus] = useState<CloudflareStatus | null>(null);
    const [zone, setZone] = useState<CloudflareZone | null>(null);
    const [analytics, setAnalytics] = useState<CloudflareAnalytics | null>(null);
    const [security, setSecurity] = useState<CloudflareSecurity | null>(null);
    const [dnsRecords, setDnsRecords] = useState<CloudflareDNSRecord[]>([]);
    const [firewallEvents, setFirewallEvents] = useState<CloudflareFirewallEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [purgeLoading, setPurgeLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'dns' | 'firewall' | 'settings'>('overview');

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statusRes, zoneRes, analyticsRes, securityRes, dnsRes, fwRes] = await Promise.allSettled([
                cfApi.getStatus(),
                cfApi.getZone(),
                cfApi.getAnalytics(),
                cfApi.getSecurity(),
                cfApi.getDnsRecords(),
                cfApi.getFirewallEvents(10, 1),
            ]);

            if (statusRes.status === 'fulfilled') setStatus(statusRes.value.data);
            if (zoneRes.status === 'fulfilled') setZone(zoneRes.value.data.zone);
            if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.analytics);
            if (securityRes.status === 'fulfilled') setSecurity(securityRes.value.data.security);
            if (dnsRes.status === 'fulfilled') setDnsRecords(dnsRes.value.data.records);
            if (fwRes.status === 'fulfilled') setFirewallEvents(fwRes.value.data.events);

            const failures = [statusRes, zoneRes, analyticsRes, securityRes, dnsRes, fwRes].filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                const msgs = failures.map((r: any) => r.reason?.message).filter(Boolean).join('; ');
                if (msgs) setError(msgs);
            }
        } catch (e: any) {
            setError(e.message || 'Error al cargar datos de Cloudflare');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handlePurgeCache = async () => {
        if (!confirm('¿Purgar todo el caché de Cloudflare? Esta acción es irreversible.')) return;
        setPurgeLoading(true);
        try {
            await cfApi.purgeCache('everything');
            alert('Caché purgado correctamente.');
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setPurgeLoading(false);
        }
    };

    // ── Status card section ─────────────────────────────────────────

    const renderStatusCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Estado</div>
                        <div className="text-sm font-black text-[var(--text-primary)]">{status?.zone || '—'}</div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">Zone ID</span>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-primary)]">{status?.account_id?.slice(0, 12)}...</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">Zone Status</span>
                    {cfStatusBadge(status?.zone_status)}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">Conexión</span>
                    {cfStatusBadge(status?.status)}
                </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tráfico</div>
                        <div className="text-sm font-black text-[var(--text-primary)]">Últimas 24h</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(analytics?.totals?.requests ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Requests</div>
                    </div>
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatBytes(analytics?.totals?.bandwidth ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ancho Banda</div>
                    </div>
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(analytics?.totals?.uniques ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Únicos</div>
                    </div>
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(analytics?.totals?.page_views ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Page Views</div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Caché</div>
                        <div className="text-sm font-black text-[var(--text-primary)]">Rendimiento</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">
                            {analytics?.totals ? ((analytics.totals.requests > 0 ? ((analytics.totals.requests_cached / analytics.totals.requests) * 100).toFixed(1) : '0.0') + '%') : '0%'}
                        </div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Cache Ratio</div>
                    </div>
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(analytics?.totals?.requests_cached ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Cached</div>
                    </div>
                </div>
                <button
                    onClick={handlePurgeCache}
                    disabled={purgeLoading}
                    className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 dark:hover:bg-amber-500/20 transition disabled:opacity-50"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    {purgeLoading ? 'Purgando...' : 'Purgar Caché'}
                </button>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Seguridad</div>
                        <div className="text-sm font-black text-[var(--text-primary)]">Amenazas</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(security?.total_threats ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Bloqueados</div>
                    </div>
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(security?.total_challenges ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Challenges</div>
                    </div>
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(security?.unique_ips ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">IPs Únicas</div>
                    </div>
                    <div>
                        <div className="text-[20px] font-black text-[var(--text-primary)]">{formatNumber(security?.recent_event_count ?? 0)}</div>
                        <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Eventos</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── HTTP Status breakdown ──────────────────────────────────────

    const renderStatusBreakdown = () => {
        const totals = analytics?.totals;
        if (!totals) return null;
        const max = Math.max(totals.status_200, totals.status_300, totals.status_400, totals.status_500, 1);
        const items = [
            { label: '2xx', value: totals.status_200, color: 'bg-emerald-500' },
            { label: '3xx', value: totals.status_300, color: 'bg-cyan-500' },
            { label: '4xx', value: totals.status_400, color: 'bg-amber-500' },
            { label: '5xx', value: totals.status_500, color: 'bg-rose-500' },
        ];
        return (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5">
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">HTTP Status Codes</div>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.label} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                                <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">{formatNumber(item.value)}</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${(item.value / max) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ── DNS Records Table ──────────────────────────────────────────

    const renderDnsRecords = () => (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Registros DNS ({dnsRecords.length})
                </span>
            </div>
            {dnsRecords.length === 0 ? (
                <div className="p-10 text-center text-sm text-[var(--text-secondary)]">Sin registros DNS</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Contenido</th>
                                <th className="px-6 py-4">TTL</th>
                                <th className="px-6 py-4">Proxy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dnsRecords.slice(0, 15).map(r => (
                                <tr key={r.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition">
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold font-mono">
                                            {r.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-bold text-[var(--text-primary)]">{r.name}</td>
                                    <td className="px-6 py-3 text-[var(--text-secondary)] font-mono text-[12px] max-w-[250px] truncate">{r.content}</td>
                                    <td className="px-6 py-3 text-[var(--text-secondary)]">{r.ttl === 1 ? 'Auto' : `${r.ttl}s`}</td>
                                    <td className="px-6 py-3">
                                        {r.proxied
                                            ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold"><Zap className="w-3 h-3" />Proxy</span>
                                            : <span className="text-[var(--text-muted)] text-[10px] font-bold">DNS Only</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // ── Firewall Events ────────────────────────────────────────────

    const renderFirewallEvents = () => (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Eventos de Firewall Recientes
                </span>
            </div>
            {firewallEvents.length === 0 ? (
                <div className="p-10 text-center text-sm text-[var(--text-secondary)]">Sin eventos recientes</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                                <th className="px-6 py-4">Acción</th>
                                <th className="px-6 py-4">IP</th>
                                <th className="px-6 py-4">Path</th>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">País</th>
                            </tr>
                        </thead>
                        <tbody>
                            {firewallEvents.map(e => (
                                <tr key={e.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition">
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                            e.action === 'block' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                            e.action === 'challenge' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                        }`}>{e.action}</span>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-[12px] font-bold text-[var(--text-primary)]">{e.ip_address}</td>
                                    <td className="px-6 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">{e.path}</td>
                                    <td className="px-6 py-3 text-[var(--text-secondary)] font-mono">{e.http_response_code}</td>
                                    <td className="px-6 py-3 text-[var(--text-secondary)]">{e.country || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // ── Main render ────────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
            <ModuleHeader
                title="Cloudflare"
                subtitle="Integración con Cloudflare — protección, CDN y rendimiento"
                icon="Cloud"
                actions={
                    <BaseButton onClick={loadAll} variant="ghost" leftIcon="RefreshCw" size="md">
                        Sincronizar
                    </BaseButton>
                }
            />

            {error && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-0.5">Error de conexión</p>
                        <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
                    </div>
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            ) : (
                <>
                    {renderStatusCards()}

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-2xl overflow-x-auto">
                        {([
                            { id: 'overview', label: 'Resumen', icon: Activity },
                            { id: 'dns', label: 'DNS', icon: Globe },
                            { id: 'firewall', label: 'Firewall', icon: Shield },
                            { id: 'settings', label: 'Ajustes', icon: FileText },
                        ] as const).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-[var(--bg-card)] text-teal-600 dark:text-teal-400 shadow-sm border border-gray-200/50 dark:border-teal-500/20'
                                        : 'text-gray-400 dark:text-[var(--text-muted)] hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {analytics && (
                                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5">
                                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Series Temporales (últimas 24h)</div>
                                        <div className="h-48 flex items-end gap-1">
                                            {analytics.timeseries.slice(-24).map((ts, i) => {
                                                const maxReq = Math.max(...analytics.timeseries.slice(-24).map(t => t.requests), 1);
                                                const h = (ts.requests / maxReq) * 100;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                        <div className="w-full bg-teal-500/20 dark:bg-teal-400/10 rounded-t-sm hover:bg-teal-500/40 transition-all"
                                                            style={{ height: `${Math.max(h, 2)}%` }}>
                                                            <div className="w-full bg-teal-500 dark:bg-teal-400 rounded-t-sm transition-all"
                                                                style={{ height: `${Math.max(h * 0.7, 1)}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between mt-2 text-[9px] font-bold text-[var(--text-muted)]">
                                            <span>{analytics.since ? new Date(analytics.since).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : ''}</span>
                                            <span>{analytics.until ? new Date(analytics.until).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit' }) : ''}</span>
                                        </div>
                                    </div>
                                )}
                                {renderDnsRecords()}
                            </div>
                            <div className="space-y-6">
                                {renderStatusBreakdown()}
                                {renderFirewallEvents()}
                            </div>
                        </div>
                    )}

                    {activeTab === 'dns' && (
                        <div>
                            {renderDnsRecords()}
                        </div>
                    )}

                    {activeTab === 'firewall' && (
                        <div className="space-y-6">
                            {renderFirewallEvents()}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center">
                            <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                            <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Configuración de Cloudflare</h3>
                            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                                Los ajustes de zona, SSL, WAF y reglas se configuran directamente desde el panel de Cloudflare.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
