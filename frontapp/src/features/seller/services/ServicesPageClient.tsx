'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ServiceCard from './components/ServiceCard';
import SpecialistItem from './components/SpecialistItem';
import SpecialistModal from './components/SpecialistModal';
import ServiceConfigModal from './components/ServiceConfigModal';
import ServiceDetailModal from './components/ServiceDetailModal';
import RescheduleModal from './components/RescheduleModal';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import BaseButton from '@/components/ui/BaseButton';
import { Service, Specialist, Appointment } from '@/features/seller/services/types';
import { useSellerServices } from '@/features/seller/services/hooks/useSellerServices';
import { useToast } from '@/shared/lib/context/ToastContext';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface ServicesPageClientProps {
    // TODO Tarea 3: Recibir datos iniciales del Server Component
}

export function ServicesPageClient(_props: ServicesPageClientProps) {
    const {
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
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const [modals, setModals] = useState({
        serviceConfig: false,
        specialist: false,
        detail: false,
        reschedule: false,
    });

    // ── Guardar servicio y sincronizar availability de especialistas ─────────
    const saveServiceAndSyncSpecialists = (serviceData: Omit<Service, 'id'> & { id?: number }) => {
        handleSaveService(serviceData);

        // Calcular la lista de servicios resultante tras el guardado
        const futureServices: Service[] = serviceData.id
            ? services.map((s) =>
                s.id === serviceData.id ? { ...s, ...serviceData, id: serviceData.id } : s,
              )
            : [...services, { ...serviceData, id: -1 }]; // id temporal solo para el cálculo

        specialists.forEach((sp) => {
            const willBeAssigned = futureServices.some((s) =>
                s.especialistasAsignados.includes(sp.id),
            );

            if (willBeAssigned && sp.availability !== 'Ocupado') {
                handleSaveSpecialist({ ...sp, id: sp.id, availability: 'Ocupado' });
            } else if (!willBeAssigned && sp.availability === 'Ocupado') {
                // Liberar al especialista solo si ya no está en ningún servicio
                handleSaveSpecialist({ ...sp, id: sp.id, availability: 'Disponible' });
            }
        });
    };


    const deleteService = async (id: number) => {
        const confirmed = await confirm(
            'Eliminar servicio',
            '¿Seguro de eliminar este servicio?'
        );
        if (confirmed) {
            handleDeleteService(id);
            showToast('Servicio eliminado del catálogo', 'info');

            // Liberar especialistas que ya no están asignados a ningún otro servicio
            const remainingServices = services.filter((s) => s.id !== id);
            specialists.forEach((sp) => {
                const stillAssigned = remainingServices.some((s) =>
                    s.especialistasAsignados.includes(sp.id),
                );
                if (!stillAssigned && sp.availability === 'Ocupado') {
                    handleSaveSpecialist({ ...sp, id: sp.id, availability: 'Disponible' });
                }
            });
        }
    };

    // ── Publicar / Despublicar servicio ──────────────────────────────────────
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

    if (loading) {
        return <BaseLoading message="Cargando ecosistema de servicios..." />;
    }

    const headerActions = (
        <div className="flex gap-3 items-center whitespace-nowrap">
            <BaseButton
                variant="action"
                leftIcon="Briefcase"
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
                onClick={() => {
                    setSelectedSpecialist(null);
                    setModals({ ...modals, specialist: true });
                }}
            >
                Especialista
            </BaseButton>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <ModuleHeader
                title="Gestión de Servicios"
                subtitle="Registro y administración de especialistas y servicios disponibles."
                icon="Services"
                actions={headerActions}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

                {/* LADO IZQUIERDO: Catálogo */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500/10 dark:bg-[#8FC3A1]/10 rounded-2xl flex items-center justify-center border border-sky-500/20 dark:border-[#8FC3A1]/20 shadow-sm text-sky-500 dark:text-[#8FC3A1]">
                                <Icon name="Services" className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                                    Catálogo de Servicios
                                </h2>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                    Tus ofertas activas
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black text-sky-500 dark:text-[#8FC3A1] uppercase tracking-widest bg-sky-500/10 dark:bg-[#8FC3A1]/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 dark:border-[#8FC3A1]/20">
                                <span className="w-2.5 h-2.5 bg-sky-500 dark:bg-[#8FC3A1] rounded-full animate-pulse shadow-sm shadow-sky-500 dark:shadow-[#8FC3A1]" />
                                Publicado
                            </span>
                            <span className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-300/10 px-3 py-1.5 rounded-lg border border-gray-300/20">
                                <span className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                                Borrador
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {services.length > 0 ? (
                            services.map((s) => (
                                <ServiceCard
                                    key={s.id}
                                    service={s}
                                    specialists={specialists}
                                    onDetail={(serv) => {
                                        setActiveService(serv);
                                        setModals({ ...modals, detail: true });
                                    }}
                                    onEdit={(serv) => {
                                        setActiveService(serv);
                                        setModals({ ...modals, serviceConfig: true });
                                    }}
                                    onDelete={deleteService}
                                    onPublish={handlePublish}
                                />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <BaseEmptyState
                                    title="Sin servicios activos"
                                    description="Tu catálogo de servicios está esperando su primera oferta."
                                    icon="Services"
                                    actionLabel="Nuevo Servicio"
                                    onAction={() => {
                                        setActiveService(null);
                                        setModals({ ...modals, serviceConfig: true });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* LADO DERECHO: Especialistas */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 bg-sky-500/10 dark:bg-[#8FC3A1]/10 rounded-2xl flex items-center justify-center border border-sky-500/20 dark:border-[#8FC3A1]/20 shadow-sm text-sky-500 dark:text-[#8FC3A1]">
                            <Icon name="Users" className="w-5 h-5 stroke-[2.5px]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                                Especialistas
                            </h2>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                Tu equipo de profesionales
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {specialists.length > 0 ? (
                            specialists.map((esp) => (
                                <SpecialistItem
                                    key={esp.id}
                                    specialist={esp}
                                    onClick={(s) => {
                                        setSelectedSpecialist(s);
                                        setModals({ ...modals, specialist: true });
                                    }}
                                />
                            ))
                        ) : (
                            <div className="p-10 text-center bg-[var(--bg-secondary)]/50 rounded-[2.5rem] border border-dashed border-[var(--border-subtle)]">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                    Sin especialistas
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
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
                appointment={selectedAppointment}
                onClose={() => setModals({ ...modals, reschedule: false, detail: true })}
                onConfirm={handleReschedule}
            />

            <ConfirmDialog />
        </div>
    );
}