'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Service, Specialist, Appointment } from '../types';
import { useToast } from '@/shared/lib/context/ToastContext';
import { serviceApi, bookingApi } from '@/shared/lib/api/serviceRepository';
import { USE_MOCKS } from '@/shared/lib/config/flags';

type Client = {
    id: number;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono: string;
    email?: string;
    direccion?: string;
};

type AppointmentWithClient = Appointment & {
    clientId: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CLIENTS: Client[] = [
    { id: 1, nombres: 'Carlos',    apellidos: 'Rojas',     dni: '12345678', telefono: '987654321', email: 'carlos.rojas@email.com',      direccion: 'Av. Los Jardines 123' },
    { id: 2, nombres: 'Ana',       apellidos: 'Vargas',    dni: '87654321', telefono: '912345678', email: 'ana.vargas@email.com',         direccion: 'Jr. Lima 456' },
    { id: 3, nombres: 'Lucía',     apellidos: 'Paredes',   dni: '81234567', telefono: '955667788', email: 'lucia.paredes@email.com',      direccion: 'Calle 7 de Junio 89' },
    { id: 4, nombres: 'Miguel',    apellidos: 'Torres',    dni: '45678912', telefono: '944556677', email: 'miguel.torres@email.com',      direccion: 'Mz. B Lt. 12' },
    { id: 5, nombres: 'Sofía',     apellidos: 'Chávez',    dni: '78912345', telefono: '933221100', email: 'sofia.chavez@email.com',       direccion: 'Urb. Santa Rosa 210' },
    { id: 6, nombres: 'Diego',     apellidos: 'Flores',    dni: '56781234', telefono: '966778899', email: 'diego.flores@email.com',       direccion: 'Calle Las Flores 33' },
    { id: 7, nombres: 'Valentina', apellidos: 'Ríos',      dni: '34127890', telefono: '977889900', email: 'valentina.rios@email.com',     direccion: 'Av. Grau 789' },
    { id: 8, nombres: 'Andrés',    apellidos: 'Cárdenas',  dni: '67890123', telefono: '988001122', email: 'andres.cardenas@email.com',    direccion: 'Jr. Moquegua 234' },
    { id: 9, nombres: 'Isabella',  apellidos: 'Navarro',   dni: '90123456', telefono: '999112233', email: 'isabella.navarro@email.com',   direccion: 'Urb. Primavera 100' },
];

const MOCK_SPECIALISTS: Specialist[] = [
    { id: 1, nombres: 'María',    apellidos: 'García',   dni: '45678901', email: 'maria.garcia@email.com',    especialidad: 'Nutrición Deportiva',  subEspecialidad: 'Rendimiento físico',             aniosExperiencia: 8, categoria: 'Servicios médicos > Nutriología',                                    numeroColegiatura: 'CNP-8801', availability: 'Ocupado' },
    { id: 2, nombres: 'Juan',     apellidos: 'Pérez',    dni: '72345678', email: 'juan.perez@email.com',      especialidad: 'Fisioterapia',                                                              aniosExperiencia: 5, categoria: 'Servicios médicos > Medicina física y rehabilitación',                                  availability: 'Ocupado' },
    { id: 3, nombres: 'Lucía',    apellidos: 'Torres',   dni: '61234567', email: 'lucia.torres@email.com',    especialidad: 'Masoterapia',          subEspecialidad: 'Técnicas orientales',            aniosExperiencia: 3, categoria: 'Belleza > Spas',                                                                       availability: 'Disponible' },
    { id: 4, nombres: 'Roberto',  apellidos: 'Sánchez',  dni: '55667788', email: 'roberto.sanchez@email.com', especialidad: 'Nutrición Clínica',    subEspecialidad: 'Nutrición pediátrica',           aniosExperiencia: 4, categoria: 'Servicios médicos > Nutriología',                                    numeroColegiatura: 'CNP-4422', availability: 'Ocupado' },
    { id: 5, nombres: 'Patricia', apellidos: 'Mendoza',  dni: '33445566', email: 'patricia.mendoza@email.com',especialidad: 'Fisioterapia',         subEspecialidad: 'Rehabilitación postoperatoria', aniosExperiencia: 6, categoria: 'Servicios médicos > Medicina física y rehabilitación',                                  availability: 'Ocupado' },
    { id: 6, nombres: 'Fernando', apellidos: 'Quispe',   dni: '22334455', email: 'fernando.quispe@email.com', especialidad: 'Fisioterapia',         subEspecialidad: 'Terapia manual ortopédica',      aniosExperiencia: 9, categoria: 'Servicios médicos > Medicina física y rehabilitación', numeroColegiatura: 'CNP-7700', availability: 'Ocupado' },
];

const MOCK_SERVICES: Service[] = [
    {
        id: 1,
        denominacion: 'Evaluación Nutricional Integral',
        categoria: 'Servicios médicos > Nutriología > Otro',
        duracion: 45,
        cupos: 2,
        precio: 120.0,
        estado: 'publicado',
        domicilio: false,
        anticipacionReserva: 24,
        especialistasAsignados: [1, 4],
        especialistaHorarios: [
            { id: 1, dias: [{ dia: 'Lunes', bloques: [0] }, { dia: 'Miércoles', bloques: [0] }] },
            { id: 4, dias: [{ dia: 'Viernes', bloques: [0] }] },
        ],
        diasAtencion: [
            { dia: 'Lunes',     bloques: [{ inicio: '08:00', fin: '13:00' }] },
            { dia: 'Miércoles', bloques: [{ inicio: '08:00', fin: '13:00' }] },
            { dia: 'Viernes',   bloques: [{ inicio: '08:00', fin: '13:00' }] },
        ],
    },
    {
        id: 2,
        denominacion: 'Sesión de Fisioterapia',
        categoria: 'Servicios médicos > Medicina física y rehabilitación > Otro',
        duracion: 60,
        cupos: 1,
        precio: 80.0,
        estado: 'publicado',
        domicilio: true,
        anticipacionReserva: 48,
        especialistasAsignados: [2, 5, 6],
        diasAtencion: [
            { dia: 'Martes',  bloques: [{ inicio: '09:00', fin: '13:00' }, { inicio: '14:00', fin: '18:00' }] },
            { dia: 'Jueves',  bloques: [{ inicio: '09:00', fin: '13:00' }] },
            { dia: 'Viernes', bloques: [{ inicio: '09:00', fin: '17:00' }] },
        ],
    },
    {
        id: 3,
        denominacion: 'Masaje Relajante',
        categoria: 'Belleza > Spas > Otro',
        duracion: 30,
        cupos: 3,
        precio: 60.0,
        estado: 'borrador',
        domicilio: false,
        anticipacionReserva: 24,
        especialistasAsignados: [],
        diasAtencion: [],
    },
];

const MOCK_APPOINTMENTS: AppointmentWithClient[] = [
    { id: 101, serviceId: 1, specialistId: 1, clientId: 1, fecha: 'Lunes 18 de Mayo',    sesion: { inicio: '08:00', fin: '08:45' }, cuposOcupados: 2 },
    { id: 102, serviceId: 1, specialistId: 1, clientId: 2, fecha: 'Lunes 18 de Mayo',    sesion: { inicio: '08:55', fin: '09:40' }, cuposOcupados: 1 },
    { id: 103, serviceId: 2, specialistId: 2, clientId: 3, fecha: 'Martes 19 de Mayo',   sesion: { inicio: '09:00', fin: '10:00' }, cuposOcupados: 1 },
    { id: 104, serviceId: 2, specialistId: 2, clientId: 4, fecha: 'Martes 19 de Mayo',   sesion: { inicio: '10:10', fin: '11:10' }, cuposOcupados: 1 },
    { id: 105, serviceId: 1, specialistId: 4, clientId: 5, fecha: 'Viernes 22 de Mayo',  sesion: { inicio: '11:40', fin: '12:25' }, cuposOcupados: 2 },
    { id: 106, serviceId: 1, specialistId: 1, clientId: 6, fecha: 'Miércoles 20 de Mayo',sesion: { inicio: '09:50', fin: '10:35' }, cuposOcupados: 1 },
    { id: 107, serviceId: 2, specialistId: 5, clientId: 7, fecha: 'Martes 19 de Mayo',   sesion: { inicio: '14:00', fin: '15:00' }, cuposOcupados: 1 },
    { id: 108, serviceId: 2, specialistId: 6, clientId: 8, fecha: 'Viernes 22 de Mayo',  sesion: { inicio: '09:00', fin: '10:00' }, cuposOcupados: 1 },
    { id: 109, serviceId: 2, specialistId: 5, clientId: 9, fecha: 'Jueves 21 de Mayo',   sesion: { inicio: '10:10', fin: '11:10' }, cuposOcupados: 1 },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSellerServices() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const { data: clients = [], isLoading: loadingClients } = useQuery({
        queryKey: ['seller', 'clients'],
        queryFn: async (): Promise<Client[]> => {
            if (USE_MOCKS) return MOCK_CLIENTS;
            try { return [] as Client[]; } catch (e) { console.warn('FALLBACK: Clients error', e); return []; }
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: specialists = [], isLoading: loadingSpecialists } = useQuery({
        queryKey: ['seller', 'specialists'],
        queryFn: async (): Promise<Specialist[]> => {
            if (USE_MOCKS) return MOCK_SPECIALISTS;
            try { return [] as Specialist[]; } catch (e) { console.warn('FALLBACK: Specialists error', e); return []; }
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: services = [], isLoading: loadingServices, refetch: refetchServices } = useQuery({
        queryKey: ['seller', 'services'],
        queryFn: async (): Promise<Service[]> => {
            if (USE_MOCKS) return MOCK_SERVICES;
            try { return await serviceApi.list() as unknown as Service[]; } catch (e) { console.warn('FALLBACK: Services error', e); return []; }
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
        queryKey: ['seller', 'appointments'],
        queryFn: async (): Promise<AppointmentWithClient[]> => {
            if (USE_MOCKS) return MOCK_APPOINTMENTS;
            try { return await bookingApi.sellerBookings() as unknown as AppointmentWithClient[]; } catch (e) { console.warn('FALLBACK: Appointments error', e); return []; }
        },
        staleTime: 2 * 60 * 1000,
    });

    const upsertServiceMutation = useMutation({
        mutationFn: async (service: Omit<Service, 'id'> & { id?: number }) => {
            await new Promise((r) => setTimeout(r, 1000));
            return service;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['seller', 'services'], (old: Service[] | undefined) => {
                if (!old) return [data as Service];
                if (variables.id) return old.map((s) => (s.id === variables.id ? { ...s, ...data } : s));
                return [{ ...data, id: Date.now() } as Service, ...old];
            });
            showToast('Servicio sincronizado correctamente', 'success');
        },
    });

    const deleteServiceMutation = useMutation({
        mutationFn: async (id: number) => {
            await new Promise((r) => setTimeout(r, 800));
            return id;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData(['seller', 'services'], (old: Service[] | undefined) =>
                old ? old.filter((s) => s.id !== deletedId) : [],
            );
            showToast('Servicio removido del catálogo', 'info');
        },
    });

    const upsertSpecialistMutation = useMutation({
        mutationFn: async (spec: Partial<Specialist>) => {
            await new Promise((r) => setTimeout(r, 1000));
            return spec;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['seller', 'specialists'], (old: Specialist[] | undefined) => {
                if (!old) return [data as Specialist];
                if (variables.id) return old.map((s) => (s.id === variables.id ? { ...s, ...data } : s));
                return [{ ...data, id: Date.now() } as Specialist, ...old];
            });
            showToast('Perfil de especialista actualizado', 'success');
        },
    });

    const rescheduleMutation = useMutation({
        mutationFn: async ({
            appointmentId,
            newFecha,
            newSession,
            newSpecialistId,
        }: {
            appointmentId: number;
            newFecha: string;
            newSession: { inicio: string; fin: string };
            newSpecialistId?: number;
        }) => {
            await new Promise((r) => setTimeout(r, 800));
            return { appointmentId, newFecha, newSession, newSpecialistId };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['seller', 'appointments'], (old: AppointmentWithClient[] | undefined) =>
                old
                    ? old.map((app) =>
                        app.id === data.appointmentId
                            ? {
                                ...app,
                                fecha: data.newFecha,
                                sesion: data.newSession,
                                ...(data.newSpecialistId !== undefined && { specialistId: data.newSpecialistId }),
                              }
                            : app,
                    )
                    : [],
            );
            showToast('Cita reprogramada con éxito', 'success');
        },
    });

    return {
        clients,
        specialists,
        services,
        appointments,
        loading:
            loadingClients ||
            loadingSpecialists ||
            loadingServices ||
            loadingAppointments ||
            upsertServiceMutation.isPending ||
            deleteServiceMutation.isPending ||
            upsertSpecialistMutation.isPending ||
            rescheduleMutation.isPending,
        handleSaveService: (service: Omit<Service, 'id'> & { id?: number }) =>
            upsertServiceMutation.mutateAsync(service),
        handleDeleteService: (id: number) => deleteServiceMutation.mutateAsync(id),
        handleSaveSpecialist: (spec: Partial<Specialist>) => upsertSpecialistMutation.mutateAsync(spec),
        handleReschedule: (
            appointmentId: number,
            newFecha: string,
            newSession: { inicio: string; fin: string },
            newSpecialistId?: number,
        ) => rescheduleMutation.mutateAsync({ appointmentId, newFecha, newSession, newSpecialistId }),
        refreshServices: refetchServices,
    };
}