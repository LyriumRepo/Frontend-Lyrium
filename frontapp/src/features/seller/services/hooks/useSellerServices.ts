'use client';

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Service,
  Specialist,
  Appointment,
} from '../types';
import { useToast } from '@/shared/lib/context/ToastContext';
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
  customerName?: string;
};

interface UseSellerServicesProps {
  initialServices?: Service[];
  initialSpecialists?: Specialist[];
  initialAppointments?: Appointment[];
}

export function useSellerServices(props?: UseSellerServicesProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data: specialists = [],
    isLoading: loadingSpecialists,
    isError: specialistsError,
    error: specialistsErrorObj,
  } = useQuery({
    queryKey: ['seller', 'specialists'],
    queryFn: async (): Promise<Specialist[]> => {
      return serviceRepository.listSpecialists();
    },
    initialData: props?.initialSpecialists,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const {
    data: services = [],
    isLoading: loadingServices,
    isError: servicesError,
    error: servicesErrorObj,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ['seller', 'services'],
    queryFn: async (): Promise<Service[]> => {
      return serviceRepository.listServices();
    },
    initialData: props?.initialServices,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const {
    data: appointments = [],
    isLoading: loadingAppointments,
    isError: appointmentsError,
    error: appointmentsErrorObj,
  } = useQuery({
    queryKey: ['seller', 'appointments'],
    queryFn: async (): Promise<AppointmentWithClient[]> => {
      const apps = await serviceRepository.listAppointments();
      return apps as AppointmentWithClient[];
    },
    initialData: props?.initialAppointments as AppointmentWithClient[] | undefined,
    staleTime: 30 * 1000,
    retry: 1,
  });

  // Derivar clientes únicos desde los appointments reales (no hay endpoint separado de clientes)
  const clients = useMemo((): Client[] => {
    const seen = new Set<number>();
    return appointments.reduce<Client[]>((acc, app) => {
      const id = app.clientId;
      if (!id || seen.has(id)) return acc;
      seen.add(id);
      const fullName = (app as AppointmentWithClient).customerName ?? '';
      const [nombres = '', ...rest] = fullName.trim().split(' ');
      acc.push({ id, nombres, apellidos: rest.join(' '), dni: '', telefono: '', email: '' });
      return acc;
    }, []);
  }, [appointments]);

  useEffect(() => {
    if (servicesError) {
      showToast(
        (servicesErrorObj as Error)?.message || 'No se pudo cargar la lista de servicios',
        'error',
      );
    }
  }, [servicesError]);

  useEffect(() => {
    if (specialistsError) {
      showToast(
        (specialistsErrorObj as Error)?.message || 'No se pudo cargar los especialistas',
        'error',
      );
    }
  }, [specialistsError]);

  useEffect(() => {
    if (appointmentsError) {
      showToast(
        (appointmentsErrorObj as Error)?.message || 'No se pudo cargar la agenda',
        'error',
      );
    }
  }, [appointmentsError]);

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
    hasError: servicesError || specialistsError,
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