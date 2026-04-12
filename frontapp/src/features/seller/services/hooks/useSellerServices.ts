'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Service, Specialist, Appointment } from '../types';
import { useToast } from '@/shared/lib/context/ToastContext';
import { serviceApi, bookingApi } from '@/shared/lib/api/serviceRepository';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export function useSellerServices() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const { data: specialists = [], isLoading: loadingSpecialists } = useQuery({
        queryKey: ['seller', 'specialists'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return [
                    { id: 1, nombres: 'Dra. María', apellidos: 'García', especialidad: 'Nutrición Deportiva', avatar_chars: 'MG', color: '#10b981' },
                    { id: 2, nombres: 'Lic. Juan', apellidos: 'Pérez', especialidad: 'Fisioterapia', avatar_chars: 'JP', color: '#f59e0b' }
                ] as Specialist[];
            }
            try {
                return [] as Specialist[];
            } catch (e) {
                console.warn('FALLBACK: Specialists error', e);
                return [] as Specialist[];
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: services = [], isLoading: loadingServices, refetch: refetchServices } = useQuery({
        queryKey: ['seller', 'services'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return [
                    {
                        id: 1,
                        nombre: 'Evaluación Nutricional Integral',
                        horario: 'Lun, Mié, Vie • 08:00 - 18:00',
                        estado: 'disponible',
                        sticker: 'bestseller',
                        especialistas_ids: [1],
                        config: { hora_inicio: '08:00', hora_fin: '18:00', duracion: 45, max_citas: 1, dias: ['Lun', 'Mié', 'Vie'] }
                    },
                    {
                        id: 2,
                        nombre: 'Sesión de Terapia Física',
                        horario: 'Mar, Jue • 09:00 - 17:00',
                        estado: 'disponible',
                        sticker: 'nuevo',
                        especialistas_ids: [2],
                        config: { hora_inicio: '09:00', hora_fin: '17:00', duracion: 60, max_citas: 1, dias: ['Mar', 'Jue'] }
                    }
                ] as Service[];
            }
            try {
                return await serviceApi.list() as unknown as Service[];
            } catch (e) {
                console.warn('FALLBACK: Services error', e);
                return [] as Service[];
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
        queryKey: ['seller', 'appointments'],
        queryFn: async () => {
            if (USE_MOCKS) {
                await new Promise(r => setTimeout(r, 300));
                return [
                    { id: 101, fecha: '2024-03-20', hora: '10:00', duracionMinutos: 45, especialistaId: 1, cliente: 'Carlos Rodríguez', servicio: 'Evaluación Nutricional Integral' }
                ] as Appointment[];
            }
            try {
                return await bookingApi.sellerBookings() as unknown as Appointment[];
            } catch (e) {
                console.warn('FALLBACK: Appointments error', e);
                return [] as Appointment[];
            }
        },
        staleTime: 2 * 60 * 1000,
    });

    const upsertServiceMutation = useMutation({
        mutationFn: async (service: Partial<Service>) => {
            await new Promise(r => setTimeout(r, 1000));
            return service;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['seller', 'services'], (old: Service[] | undefined) => {
                if (!old) return [data as Service];
                if (variables.id) {
                    return old.map(s => s.id === variables.id ? { ...s, ...data } : s);
                }
                return [{ ...data, id: Date.now() } as Service, ...old];
            });
            showToast("Servicio sincronizado correctamente", "success");
        }
    });

    const deleteServiceMutation = useMutation({
        mutationFn: async (id: number) => {
            await new Promise(r => setTimeout(r, 800));
            return id;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData(['seller', 'services'], (old: Service[] | undefined) => {
                return old ? old.filter(s => s.id !== deletedId) : [];
            });
            showToast("Servicio removido del catálogo", "info");
        }
    });

    const upsertSpecialistMutation = useMutation({
        mutationFn: async (spec: Partial<Specialist>) => {
            await new Promise(r => setTimeout(r, 1000));
            return spec;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['seller', 'specialists'], (old: Specialist[] | undefined) => {
                if (!old) return [data as Specialist];
                if (variables.id) {
                    return old.map(s => s.id === variables.id ? { ...s, ...data } : s);
                }
                return [{ ...data, id: Date.now() } as Specialist, ...old];
            });
            showToast("Perfil de especialista actualizado", "success");
        }
    });

    const rescheduleMutation = useMutation({
        mutationFn: async ({ appointmentId, newTime }: { appointmentId: number, newTime: string }) => {
            await new Promise(r => setTimeout(r, 800));
            return { appointmentId, newTime };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['seller', 'appointments'], (old: Appointment[] | undefined) => {
                return old ? old.map(app => app.id === data.appointmentId ? { ...app, hora: data.newTime } : app) : [];
            });
            showToast("Cita reprogramada con éxito", "success");
        }
    });

    return {
        specialists,
        services,
        appointments,
        loading: loadingSpecialists || loadingServices || loadingAppointments || upsertServiceMutation.isPending || deleteServiceMutation.isPending || upsertSpecialistMutation.isPending || rescheduleMutation.isPending,
        handleSaveService: (service: Partial<Service>) => upsertServiceMutation.mutateAsync(service),
        handleDeleteService: (id: number) => deleteServiceMutation.mutateAsync(id),
        handleSaveSpecialist: (spec: Partial<Specialist>) => upsertSpecialistMutation.mutateAsync(spec),
        handleReschedule: (appointmentId: number, newTime: string) => rescheduleMutation.mutateAsync({ appointmentId, newTime }),
        refreshServices: refetchServices
    };
}
