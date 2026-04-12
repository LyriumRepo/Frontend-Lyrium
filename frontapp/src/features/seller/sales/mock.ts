import { Order, SalesKPI, ItemStatus } from './types';

export const MOCK_ORDERS: Order[] = [
    {
        id: '1',
        fecha: '2024-03-15',
        cliente: 'Ana Martínez',
        dni: '76543210',
        total: 250.50,
        unidades: 3,
        estado: 'processing',
        global_status: 'processing',
        currentStep: 2,
        metodo_pago: 'Tarjeta de Crédito',
        estado_pago: 'verificado',
        envio: { direccion: 'Av. Siempre Viva 123, Lima', carrier: 'Olva Courier', tracking: 'TRK-123456789', costo: 15.00 },
        items: [
            { id: '1', name: 'Producto A', qty: 2, price: 100.00, status: 'confirmed', can_confirm: false, can_cancel: false },
            { id: '2', name: 'Producto B', qty: 1, price: 50.50, status: 'processing', can_confirm: false, can_cancel: false }
        ]
    },
    {
        id: '2',
        fecha: '2024-03-16',
        cliente: 'Roberto Gómez',
        dni: '01234567',
        total: 89.90,
        unidades: 1,
        estado: 'pending_seller',
        global_status: 'pending_seller',
        currentStep: 1,
        metodo_pago: 'Yape',
        estado_pago: 'verificado',
        envio: { direccion: 'Calle Falsa 456, Arequipa', carrier: 'Shalom', tracking: 'SHL-987654321', costo: 10.00 },
        items: [
            { id: '3', name: 'Producto C', qty: 1, price: 89.90, status: 'pending_seller', can_confirm: true, can_cancel: true }
        ]
    },
    {
        id: '3',
        fecha: '2024-03-17',
        cliente: 'Carmen Rojas',
        dni: '44556677',
        total: 450.00,
        unidades: 5,
        estado: 'pending_seller',
        global_status: 'pending_seller',
        currentStep: 1,
        metodo_pago: 'Transferencia Bancaria',
        estado_pago: 'pendiente',
        envio: { direccion: 'Urb. Los Rosales Mz A Lt 5, Trujillo', carrier: 'Pendiente', tracking: '-', costo: 20.00 },
        items: [
            { id: '4', name: 'Producto D', qty: 5, price: 90.00, status: 'pending_seller', can_confirm: true, can_cancel: true }
        ]
    }
];

export const MOCK_KPIS: SalesKPI[] = [
    { label: 'Ingresos Mensuales', count: 45000, status: 'Total', icon: 'Finance', color: 'sky' },
    { label: 'Nuevos Pedidos', count: 12, status: 'Pendientes', icon: 'Sales', color: 'indigo' },
    { label: 'En Preparación', count: 5, status: 'Agencia', icon: 'Catalog', color: 'cyan' },
    { label: 'En Camino', count: 8, status: 'Tránsito', icon: 'Logistics', color: 'amber' },
    { label: 'Devoluciones', count: 1, status: 'Alerta', icon: 'RotateCcw', color: 'red' }
];
