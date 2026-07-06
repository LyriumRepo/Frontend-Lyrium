'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ServiceCard from './components/ServiceCard';
import ServiceCardMobile from './components/ServiceCardMobile';
import SpecialistItem from './components/SpecialistItem';
import SpecialistModal from './components/SpecialistModal';
import dynamic from 'next/dynamic';
const ServiceConfigModal = dynamic(() => import('./components/ServiceConfigModal'), { ssr: false });
import ServiceDetailModal from './components/ServiceDetailModal';
import RescheduleModal from './components/RescheduleModal';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import BaseButton from '@/components/ui/BaseButton';
import { Service, Specialist, Appointment } from '@/features/seller/services/types';
import { exportServicesToExcel, exportServiciosToPdf } from './export';
import { useSellerServices } from '@/features/seller/services/hooks/useSellerServices';
import { useToast } from '@/shared/lib/context/ToastContext';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import ServicesGuideModal from './components/ServicesGuideModal';

type AppointmentWithClient = Appointment & { clientId?: number };

type StatusFilter = 'todos' | 'publicado' | 'borrador';

export function ServicesPageClient() {
    const {
        clients,
        specialists,
        services,
        appointments,
        loading,
        handleSaveService,
        handleDeleteService,
        handleSaveSpecialist,
        handleReschedule,
    } = useSellerServices();

    const { showToast } = useToast();
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const [activeService, setActiveService] = useState<Service | null>(null);
    const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithClient | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [specialistPage, setSpecialistPage] = useState(1);
    const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);

    const [modals, setModals] = useState({
        serviceConfig: false,
        specialist: false,
        detail: false,
        reschedule: false,
    });
    const [showGuide, setShowGuide] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const saveServiceAndSyncSpecialists = (
        serviceData: Omit<Service, 'id'> & { id?: number },
    ) => {
        handleSaveService(serviceData);

        const futureServices: Service[] = serviceData.id
            ? services.map((s) =>
                s.id === serviceData.id
                    ? { ...s, ...serviceData, id: serviceData.id }
                    : s,
            )
            : [...services, { ...serviceData, id: -1 }];

        specialists.forEach((sp) => {
            const willBeAssigned = futureServices.some((s) =>
                s.especialistasAsignados.includes(sp.id),
            );
            if (willBeAssigned && sp.availability !== 'Ocupado') {
                handleSaveSpecialist({ ...sp, availability: 'Ocupado' });
            } else if (!willBeAssigned && sp.availability === 'Ocupado') {
                handleSaveSpecialist({ ...sp, availability: 'Disponible' });
            }
        });
    };

    const deleteService = async (id: number) => {
        const confirmed = await confirm('Eliminar servicio', '¿Seguro de eliminar este servicio?');
        if (!confirmed) return;

        handleDeleteService(id);
        showToast('Servicio eliminado del catálogo', 'info');

        const remainingServices = services.filter((s) => s.id !== id);
        specialists.forEach((sp) => {
            const stillAssigned = remainingServices.some((s) =>
                s.especialistasAsignados.includes(sp.id),
            );
            if (!stillAssigned && sp.availability === 'Ocupado') {
                handleSaveSpecialist({ ...sp, availability: 'Disponible' });
            }
        });
    };

    const handlePublish = (service: Service) => {
        const nuevoEstado = service.estado === 'publicado' ? 'borrador' : 'publicado';
        handleSaveService({ ...service, estado: nuevoEstado });
        showToast(
            nuevoEstado === 'publicado'
                ? `"${service.denominacion}" publicado exitosamente`
                : `"${service.denominacion}" movido a borradores`,
            nuevoEstado === 'publicado' ? 'success' : 'info',
        );
    };

    // ── Derived ──────────────────────────────────────────────────────────────

    const filteredServices = services
        .filter((s) => statusFilter === 'todos' || s.estado === statusFilter)
        .filter((s) =>
            searchText.trim() === '' ||
            s.denominacion.toLowerCase().includes(searchText.trim().toLowerCase()),
        );

    const PAGE_SIZE = 7;
    const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedServices = filteredServices.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const publishedCount = services.filter((s) => s.estado === 'publicado').length;
    const draftCount = services.filter((s) => s.estado === 'borrador').length;

    // ── Specialist pagination ─────────────────────────────────────────────────

    const SPECIALIST_PAGE_SIZE = 4;
    const specialistTotalPages = Math.max(1, Math.ceil(specialists.length / SPECIALIST_PAGE_SIZE));
    const safeSpecialistPage = Math.min(specialistPage, specialistTotalPages);
    const pagedSpecialists = specialists.slice(
        (safeSpecialistPage - 1) * SPECIALIST_PAGE_SIZE,
        safeSpecialistPage * SPECIALIST_PAGE_SIZE,
    );

    // ── Header actions (unchanged) ───────────────────────────────────────────

    const primaryActions = (
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-center sm:justify-end">
            <BaseButton
                variant="action"
                leftIcon="Briefcase"
                size="md"
                onClick={() => {
                    setActiveService(null);
                    setModals({ ...modals, serviceConfig: true });
                }}
            >
                Nuevo Servicio
            </BaseButton>
            <BaseButton
                variant="action"
                leftIcon="PlusCircle"
                size="md"
                onClick={() => {
                    setSelectedSpecialist(null);
                    setModals({ ...modals, specialist: true });
                }}
            >
                Especialista
            </BaseButton>
        </div>
    );

    const secondaryActions = (
        <div className="flex flex-wrap gap-3 items-center justify-center xl:justify-end">
            <button
                onClick={() => exportServicesToExcel(services).catch(console.error)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
            >
                <Icon name="FileSpreadsheet" className="text-xl" />
                <span className="hidden sm:inline">Excel</span>
            </button>
            <button
                onClick={() => exportServiciosToPdf(services).catch(console.error)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
            >
                <Icon name="FileText" className="text-xl" />
                <span className="hidden sm:inline">PDF</span>
            </button>
            <button
                onClick={() => setShowGuide(true)}
                className="w-9 h-9 flex-shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-sky-500 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all"
                title="Guía para imágenes de servicios"
            >
                <Icon name="HelpCircle" className="w-4 h-4" />
            </button>
        </div>
    );

    if (loading) return <BaseLoading message="Cargando ecosistema de servicios..." />;

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
        <ServicesGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
        <div className="space-y-8 animate-fadeIn pb-20">

            {/* ── Encabezado ── */}
            <ModuleHeader
                title="Gestión de Servicios"
                subtitle="Registro y administración de especialistas y servicios disponibles."
                icon="Services"
            />

            {/* ── Catálogo ── */}
            <div className="space-y-4 mt-8">

                {/* Barra superior de la tabla */}
                <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] animate-fadeIn">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <Icon name="Services" className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                                    Catálogo de Servicios
                                </h2>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                    {services.length} servicio{services.length !== 1 ? 's' : ''} registrado{services.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setSearchText(''); setStatusFilter('todos'); setCurrentPage(1); }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            title="Limpiar Filtros"
                        >
                            <Icon name="RotateCcw" className="w-4 h-4" />
                            <span className="hidden sm:inline">Limpiar</span>
                        </button>
                    </div>

                    {/* Buscador + acciones principales */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <div className="relative flex-1">
                            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                                placeholder="Buscar servicio..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50 transition-colors"
                            />
                        </div>
                        <div className="shrink-0">
                            {primaryActions}
                        </div>
                    </div>

                    {/* Estado + Especialistas + Acciones */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Estado</label>
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
                                    className="appearance-none w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--icons-green)]/20 cursor-pointer outline-none"
                                >
                                    <option value="todos">Todos ({services.length})</option>
                                    <option value="publicado">Publicados ({publishedCount})</option>
                                    <option value="borrador">Borradores ({draftCount})</option>
                                </select>
                                <Icon name="ChevronDown" className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Equipo</label>
                            <button
                                onClick={() => setDrawerOpen(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-sky-500/20 dark:border-[#8FC3A1]/20 bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] hover:bg-sky-500/20 dark:hover:bg-[#8FC3A1]/20 transition-colors"
                            >
                                <Icon name="Users" className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Mis Especialistas
                                </span>
                                {specialists.length > 0 && (
                                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-sky-500 dark:bg-[#8FC3A1] text-white dark:text-[#0a1a13] text-[9px] font-bold">
                                        {specialists.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Acciones secundarias */}
                        <div className="space-y-2 sm:col-span-2 xl:col-span-1">
                            <label className="hidden xl:block text-[10px] font-black text-transparent uppercase tracking-widest ml-1 select-none">.</label>
                            {secondaryActions}
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                {filteredServices.length > 0 ? (
                    <>
                        {/* ===== Vista Desktop: Tabla ===== */}
                        <div className="hidden sm:block rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-visible">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                                        {[
                                            'Estado',
                                            'Servicio',
                                            'Categoría',
                                            'Precio',
                                            'Equipo',
                                            'Acciones',
                                        ].map((h, index, arr) => (
                                            <th
                                                key={h}
                                                className={`px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]
                                                    ${index === 0 ? 'rounded-tl-2xl' : ''}
                                                    ${index === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedServices.map((s) => (
                                        <ServiceCard
                                            key={s.id}
                                            service={s}
                                            specialists={specialists}
                                            onDetail={(serv) => {
                                                setActiveService(serv);
                                                setModals((prev) => ({ ...prev, detail: true }));
                                            }}
                                            onEdit={(serv) => {
                                                setActiveService(serv);
                                                setModals((prev) => ({ ...prev, serviceConfig: true }));
                                            }}
                                            onDelete={deleteService}
                                            onPublish={handlePublish}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ===== Vista Mobile: Acordeón ===== */}
                        <div className="sm:hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] divide-y divide-[var(--border-subtle)] overflow-hidden">
                            {pagedServices.map((s) => (
                                <ServiceCardMobile
                                    key={s.id}
                                    service={s}
                                    specialists={specialists}
                                    isExpanded={expandedServiceId === s.id}
                                    onToggle={() => setExpandedServiceId((prev) => (prev === s.id ? null : s.id))}
                                    onDetail={(serv) => {
                                        setActiveService(serv);
                                        setModals((prev) => ({ ...prev, detail: true }));
                                    }}
                                    onEdit={(serv) => {
                                        setActiveService(serv);
                                        setModals((prev) => ({ ...prev, serviceConfig: true }));
                                    }}
                                    onDelete={deleteService}
                                    onPublish={handlePublish}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 pt-1">
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    Página {safePage} de {totalPages} · {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''}
                                </p>
                                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                                ${safePage === page
                                                    ? 'bg-sky-500/20 dark:bg-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1] border border-sky-500/30 dark:border-[#8FC3A1]/30'
                                                    : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <BaseEmptyState
                        title="Sin servicios"
                        description={
                            statusFilter === 'todos'
                                ? 'Tu catálogo de servicios está esperando su primera oferta.'
                                : `No hay servicios en estado "${statusFilter}".`
                        }
                        icon="Services"
                        actionLabel={statusFilter === 'todos' ? 'Nuevo Servicio' : undefined}
                        onAction={
                            statusFilter === 'todos'
                                ? () => {
                                    setActiveService(null);
                                    setModals((prev) => ({ ...prev, serviceConfig: true }));
                                }
                                : undefined
                        }
                    />
                )}
            </div>

            {/* ── Off-canvas Especialistas ─────────────────────────────────── */}
            {mounted && document.getElementById('modal-root') && createPortal(
                <>
                {/* Backdrop */}
                <div
                    onClick={() => setDrawerOpen(false)}
                    className={`fixed inset-0 z-[70] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300
                        ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                />

                {/* Panel */}
                <aside
                    className={`fixed top-0 right-0 h-full w-[85vw] max-w-xs sm:w-80 sm:max-w-none z-[80] flex flex-col
                        bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl
                        transition-transform duration-300 ease-in-out
                        ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-500/10 dark:bg-[#8FC3A1]/10 rounded-xl flex items-center justify-center border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1]">
                            <Icon name="Users" className="w-4 h-4 stroke-[2.5px]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                                Especialistas
                            </h3>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                {specialists.length} profesional{specialists.length !== 1 ? 'es' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Agregar especialista desde el drawer */}
                        <button
                            onClick={() => {
                                setSelectedSpecialist(null);
                                setModals({ ...modals, specialist: true });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] hover:bg-sky-500/20 dark:hover:bg-[#8FC3A1]/20 transition-colors"
                            title="Agregar especialista"
                        >
                            <Icon name="Plus" className="w-3.5 h-3.5" />
                        </button>
                        {/* Cerrar */}
                        <button
                            onClick={() => setDrawerOpen(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                            title="Cerrar"
                        >
                            <Icon name="X" className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Drawer body — scroll interno */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {specialists.length > 0 ? (
                        pagedSpecialists.map((esp) => (
                            <SpecialistItem
                                key={esp.id}
                                specialist={esp}
                                onClick={(s) => {
                                    setSelectedSpecialist(s);
                                    setModals({ ...modals, specialist: true });
                                    setDrawerOpen(false);
                                }}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
                            <Icon name="Users" className="w-8 h-8 text-[var(--text-secondary)] opacity-30" />
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                Sin especialistas
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedSpecialist(null);
                                    setModals({ ...modals, specialist: true });
                                }}
                                className="mt-2 px-4 py-1.5 rounded-xl border border-sky-500/20 dark:border-[#8FC3A1]/20 bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/20 transition-colors"
                            >
                                Agregar el primero
                            </button>
                        </div>
                    )}
                </div>

                {/* Drawer footer — paginación (visible sólo con >5 especialistas) */}
                {specialistTotalPages > 1 && (
                    <div className="flex-shrink-0 px-4 pt-3 pb-16 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                            {safeSpecialistPage}/{specialistTotalPages} · {specialists.length} prof.
                        </p>
                        <div className="flex items-center gap-1 overflow-x-auto">
                            <button
                                onClick={() => setSpecialistPage((p) => Math.max(1, p - 1))}
                                disabled={safeSpecialistPage === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                            </button>
                            {Array.from({ length: specialistTotalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setSpecialistPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                                        ${safeSpecialistPage === page
                                            ? 'bg-sky-500/20 dark:bg-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1] border border-sky-500/30 dark:border-[#8FC3A1]/30'
                                            : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setSpecialistPage((p) => Math.min(specialistTotalPages, p + 1))}
                                disabled={safeSpecialistPage === specialistTotalPages}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
                </aside>
                </>,
                document.getElementById('modal-root')!
            )}

            {/* ── Modals (sin cambios) ─────────────────────────────────────── */}

            <SpecialistModal
                isOpen={modals.specialist}
                specialist={selectedSpecialist}
                onClose={() => setModals({ ...modals, specialist: false })}
                onSave={handleSaveSpecialist}
            />

            <ServiceConfigModal
                isOpen={modals.serviceConfig}
                service={activeService}
                specialists={specialists}
                onClose={() => setModals({ ...modals, serviceConfig: false })}
                onSave={saveServiceAndSyncSpecialists}
            />

            <ServiceDetailModal
                isOpen={modals.detail}
                service={activeService}
                specialists={specialists}
                clients={clients}
                appointments={appointments}
                onClose={() => setModals({ ...modals, detail: false })}
                onEdit={(serv) => {
                    setActiveService(serv);
                    setModals({ ...modals, serviceConfig: true, detail: false });
                }}
                onReschedule={(app) => {
                    setSelectedAppointment(app);
                    setModals({ ...modals, reschedule: true, detail: false });
                }}
            />

            <RescheduleModal
                isOpen={modals.reschedule}
                specialists={specialists}
                appointment={selectedAppointment}
                service={activeService!}
                appointments={appointments}
                clients={clients}
                onClose={() => setModals({ ...modals, reschedule: false, detail: true })}
                onConfirm={(id, fecha, sesion, specialistId) => handleReschedule(id, fecha, sesion, specialistId)}
            />

            <ConfirmDialog />
        </div>
        </>
    );
}