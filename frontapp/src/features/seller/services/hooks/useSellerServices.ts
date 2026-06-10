'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Service,
  Specialist,
  Appointment,
} from '../types';
import { useToast } from '@/shared/lib/context/ToastContext';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { serviceRepository } from '@/shared/lib/api/ServicoReposit';

type Client = {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email?: string;
};

type AppointmentWithClient = Appointment & {
  clientId?: number;
};

interface UseSellerServicesProps {
  initialServices?: Service[];
  initialSpecialists?: Specialist[];
  initialAppointments?: Appointment[];
}

const MOCK_CLIENTS: Client[] = [
  { id: 1, nombres: 'Carlos', apellidos: 'Rojas', dni: '12345678', telefono: '987654321', email: 'carlos@email.com' },
  { id: 2, nombres: 'Ana', apellidos: 'Vargas', dni: '87654321', telefono: '912345678', email: 'ana@email.com' },
  { id: 3, nombres: 'Lucía', apellidos: 'Paredes', dni: '81234567', telefono: '955667788', email: 'lucia@email.com' },
  { id: 4, nombres: 'Miguel', apellidos: 'Torres', dni: '45678912', telefono: '944556677', email: 'miguel@email.com' },
  { id: 5, nombres: 'Sofía', apellidos: 'Chávez', dni: '78912345', telefono: '933221100', email: 'sofia@email.com' },
];

export function useSellerServices(props?: UseSellerServicesProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: clients = [] } = useQuery({
    queryKey: ['seller', 'clients'],
    queryFn: async (): Promise<Client[]> => MOCK_CLIENTS,
    staleTime: Infinity,
  });

  const {
    data: specialists = [],
    isLoading: loadingSpecialists,
  } = useQuery({
    queryKey: ['seller', 'specialists'],
    queryFn: async (): Promise<Specialist[]> => {
      return serviceRepository.listSpecialists();
    },
    initialData: props?.initialSpecialists,
    staleTime: 30 * 1000,
  });

  const {
    data: services = [],
    isLoading: loadingServices,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ['seller', 'services'],
    queryFn: async (): Promise<Service[]> => {
      return serviceRepository.listServices();
    },
    initialData: props?.initialServices,
    staleTime: 30 * 1000,
  });

  const {
    data: appointments = [],
    isLoading: loadingAppointments,
  } = useQuery({
    queryKey: ['seller', 'appointments'],
    queryFn: async (): Promise<AppointmentWithClient[]> => {
      const apps = await serviceRepository.listAppointments();
      return apps as AppointmentWithClient[];
    },
    initialData: props?.initialAppointments as AppointmentWithClient[] | undefined,
    staleTime: 30 * 1000,
  });

  const upsertServiceMutation = useMutation({
    mutationFn: async (svc: Omit<Service, 'id'> & { id?: number }) => {
      if (svc.id) {
        return serviceRepository.updateService(svc.id, svc);
      }
      return serviceRepository.createService(svc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'specialists'] });
      showToast('Servicio sincronizado correctamente', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al guardar el servicio', 'error');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await serviceRepository.deleteService(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'specialists'] });
      showToast('Servicio removido del catálogo', 'info');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al eliminar el servicio', 'error');
    },
  });

  const upsertSpecialistMutation = useMutation({
    mutationFn: async (spec: Partial<Specialist>) => {
      if (spec.id) {
        return serviceRepository.updateSpecialist(spec.id, spec);
      }
      return serviceRepository.createSpecialist(spec);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'specialists'] });
      showToast('Perfil de especialista actualizado', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al guardar especialista', 'error');
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      newFecha,
      newSession,
      token,
    }: {
      appointmentId: number;
      newFecha: string;
      newSession: { inicio: string; fin: string };
      token?: string;
    }) => {
      await serviceRepository.rescheduleAppointment(
        appointmentId,
        newFecha,
        newSession.inicio,
        newSession.fin,
        token || '',
      );
      return { appointmentId, newFecha, newSession };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'appointments'] });
      showToast('Cita reprogramada con éxito', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Error al reprogramar la cita', 'error');
    },
  });

  return {
    clients,
    specialists,
    services,
    appointments,
    loading:
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
    handleSaveSpecialist: (spec: Partial<Specialist>) =>
      upsertSpecialistMutation.mutateAsync(spec),
    handleReschedule: (
      appointmentId: number,
      newFecha: string,
      newSession: { inicio: string; fin: string },
      _specialistId?: number,
    ) =>
      rescheduleMutation.mutateAsync({
        appointmentId,
        newFecha,
        newSession,
      }),
    refreshServices: refetchServices,
  };
}