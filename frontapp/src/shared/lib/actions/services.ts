'use server';

import { cookies } from 'next/headers';
import {
  Service,
  Specialist,
  Appointment,
} from '@/features/seller/services/types';
import {
  adaptServiceToFrontend,
  adaptSpecialistToFrontend,
  adaptAppointmentToFrontend,
  LaravelService,
  LaravelSpecialist,
  LaravelBooking,
} from '@/features/seller/services/utils/serviceAdapter';

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

/**
 * Helper interno del servidor para obtener las cabeceras de autorización
 */
async function getServerHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('laravel_token')?.value || '';
  const cookieHeader = cookieStore.toString();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  return headers;
}

/**
 * Obtiene los servicios configurados para la tienda del vendedor actual
 */
export async function getServicesAction(): Promise<Service[]> {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${LARAVEL_API_URL}/seller/services`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        'Error fetching services from server action:',
        response.status,
      );
      return [];
    }

    const data = await response.json();
    const rawServices: LaravelService[] = data.data || data || [];
    return rawServices.map((s) => adaptServiceToFrontend(s));
  } catch (error) {
    console.error('Error en getServicesAction:', error);
    return [];
  }
}

/**
 * Obtiene los especialistas registrados para la tienda del vendedor actual
 */
export async function getSpecialistsAction(): Promise<Specialist[]> {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${LARAVEL_API_URL}/stores/me/specialists`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        'Error fetching specialists from server action:',
        response.status,
      );
      return [];
    }

    const data = await response.json();
    const rawSpecs: LaravelSpecialist[] =
      data.specialists || data.data || data || [];
    return rawSpecs.map((sp) => adaptSpecialistToFrontend(sp));
  } catch (error) {
    console.error('Error en getSpecialistsAction:', error);
    return [];
  }
}

/**
 * Obtiene la agenda de citas del vendedor
 */
export async function getAppointmentsAction(): Promise<Appointment[]> {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${LARAVEL_API_URL}/bookings/seller`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        'Error fetching appointments from server action:',
        response.status,
      );
      return [];
    }

    const data = await response.json();
    const rawBookings: LaravelBooking[] =
      data.bookings || data.data || data || [];
    return rawBookings.map((b) => adaptAppointmentToFrontend(b));
  } catch (error) {
    console.error('Error en getAppointmentsAction:', error);
    return [];
  }
}
