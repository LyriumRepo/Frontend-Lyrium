import { AgendaEvent, AgendaOrder } from './types';
import { Appointment, Specialist } from '../services/types';

export const MOCK_ORDERS: AgendaOrder[] = [
    {
        id: 'PED-1001',
        date: '2026-01-05T10:00:00',
        customer: 'Juan Pérez',
        dni: '43567890',
        status: 'pagado',
        currentStep: 2,
        total: 150.00,
        payment_method: 'Tarjeta de Crédito (Visa)',
        shipping: { address: 'Av. Larco 456, Miraflores', carrier: 'Olva Courier', tracking: 'OLV-987654' }
    },
    {
        id: 'PED-1002',
        date: '2026-01-05T14:30:00',
        customer: 'Ana García',
        dni: '70123456',
        status: 'pendiente',
        currentStep: 1,
        total: 89.90,
        payment_method: 'PagoEfectivo',
        shipping: { address: 'Calle Las Flores 123, San Isidro', carrier: 'Servicios Express', tracking: 'PENDIENTE' }
    },
    {
        id: 'PED-1003',
        date: '2026-01-12T09:15:00',
        customer: 'Carlos Ruiz',
        dni: '09876543',
        status: 'entregado',
        currentStep: 5,
        total: 210.50,
        payment_method: 'Transferencia BCP',
        shipping: { address: 'Jr. Junín 450, Lima Centro', carrier: 'Scharff', tracking: 'SCH-112233' }
    }
];

export const MOCK_SPECIALISTS: Specialist[] = [
    { id: 1, nombres: 'Dra. María', apellidos: 'García', especialidad: 'Nutrición Deportiva', avatar_chars: 'MG', color: '#10b981' },
    { id: 2, nombres: 'Lic. Juan', apellidos: 'Pérez', especialidad: 'Fisioterapia', avatar_chars: 'JP', color: '#f59e0b' }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 101, fecha: '2026-01-05', hora: '11:00', duracionMinutos: 45, especialistaId: 1, cliente: 'Carlos Rodríguez', servicio: 'Evaluación Nutricional Integral' },
    { id: 102, fecha: '2026-01-12', hora: '10:00', duracionMinutos: 60, especialistaId: 2, cliente: 'Lucía Torres', servicio: 'Sesión de Terapia Física' }
];

export function buildUnifiedEvents(orders: AgendaOrder[], appointments: Appointment[], specialists: Specialist[]): AgendaEvent[] {
    const orderEvents: AgendaEvent[] = orders.map(order => ({
        id: order.id,
        type: 'order',
        date: order.date.split('T')[0],
        time: order.date.split('T')[1].substring(0, 5),
        title: order.id,
        subtitle: order.customer,
        status: order.status,
        originalData: order
    }));

    const appointmentEvents: AgendaEvent[] = appointments.map(app => {
        const esp = specialists.find(e => e.id === app.especialistaId);
        return {
            id: app.id,
            type: 'service',
            date: app.fecha,
            time: app.hora,
            title: app.servicio || 'Servicio',
            subtitle: app.cliente,
            status: 'confirmed',
            originalData: app,
            specialist: esp
        };
    });

    return [...orderEvents, ...appointmentEvents].sort((a, b) => {
        const dateComp = a.date.localeCompare(b.date);
        if (dateComp !== 0) return dateComp;
        return a.time.localeCompare(b.time);
    });
}
