'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/shared/lib/api/orderRepository';
import Icon from '@/components/ui/Icon';

type ActionMode = 'default' | 'comprobante';

interface OrderOption {
    id: string;
    label: string;
    storeSlug?: string;
    storeId?: string;
}

const COMPRAR_MESSAGE = 'Para comprar en Lyrium solo debes buscar un producto, agregarlo al carrito, completar tu pedido y seleccionar un método de pago. Luego podrás realizar el seguimiento desde la sección Mis Pedidos.';

const VENDER_MESSAGE = 'Para convertirte en vendedor en Lyrium, sigue estos pasos:\n\n1. Registro de tienda\n   Ingresa a tu panel de usuario y selecciona "Registrar tienda". Completa los datos básicos: nombre, descripción, logo, banner y categoría de tus productos o servicios.\n\n2. Aprobación\n   El equipo de Lyrium revisará tu solicitud en un plazo de 1 a 3 días hábiles. Recibirás una notificación cuando tu tienda sea aprobada.\n\n3. Publicar productos\n   Una vez aprobada tu tienda, puedes empezar a publicar productos. Incluye fotos de calidad, descripciones detalladas, precio y stock disponible.\n\n4. Vender y gestionar\n   Recibirás notificaciones de nuevos pedidos. Puedes gestionar tus ventas, enviar mensajes a clientes y dar seguimiento desde tu panel de vendedor.\n\nRequisitos básicos:\n• Ser mayor de edad.\n• Contar con RUC o DNI para facturación.\n• Productos en las categorías permitidas.\n• Cumplir con las políticas de calidad de Lyrium.\n\n¿Te gustaría registrarte? Puedes iniciar desde tu panel de usuario.';

const COMPROBANTE_MESSAGE = 'Los comprobantes de compra (factura o boleta electrónica) son gestionados directamente por cada vendedor. Lyrium emite un comprobante por cada pedido completado.\n\nSelecciona uno de tus pedidos para ir al chat con el vendedor y solicitar tu comprobante:';

interface Props {
    onBotResponse: (message: string) => void;
}

export default function ChatBotQuickActions({ onBotResponse }: Props) {
    const router = useRouter();
    const [mode, setMode] = useState<ActionMode>('default');
    const [orders, setOrders] = useState<OrderOption[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        setFetchError(false);
        try {
            const result = await orderApi.list(1);
            const mapped: OrderOption[] = (result.data || []).map((order) => {
                const firstItem = order.items?.[0];
                return {
                    id: order.id,
                    label: `#${order.orderNumber} — ${order.statusLabel || order.globalStatus} — S/${Number(order.total).toFixed(2)}`,
                    storeSlug: firstItem?.store?.slug,
                    storeId: firstItem?.store?.id,
                };
            });
            setOrders(mapped.slice(0, 10));
        } catch {
            setFetchError(true);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    useEffect(() => {
        if (mode === 'comprobante' && orders.length === 0 && !loadingOrders && !fetchError) {
            fetchOrders();
        }
    }, [mode, orders.length, loadingOrders, fetchError, fetchOrders]);

    const handleAction = (actionId: string) => {
        if (actionId !== 'comprobante') {
            setMode('default');
        }

        switch (actionId) {
            case 'comprar':
                onBotResponse(COMPRAR_MESSAGE);
                break;
            case 'pedidos':
                router.push('/customer/orders');
                break;
            case 'pago':
                router.push('/customer/payment-methods');
                break;
            case 'comprobante':
                setMode('comprobante');
                break;
            case 'vender':
                onBotResponse(VENDER_MESSAGE);
                break;
            case 'soporte':
                router.push('/customer/support');
                break;
        }
    };

    const handleOrderSelect = (order: OrderOption) => {
        router.push(`/customer/orders?id=${order.id}`);
    };

    if (mode === 'comprobante') {
        return (
            <div className="px-4 pb-2 animate-slide-down">
                <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                        Selecciona un pedido
                    </p>
                    <button
                        onClick={() => { setMode('default'); setOrders([]); }}
                        className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                        ← Volver
                    </button>
                </div>

                {loadingOrders && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-[var(--text-secondary)] py-3">
                        <svg className="w-4 h-4 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Cargando tus pedidos...
                    </div>
                )}

                {fetchError && (
                    <p className="text-xs text-gray-400 dark:text-[var(--text-secondary)] py-3">
                        No se pudieron cargar tus pedidos. Intenta desde tu panel.
                    </p>
                )}

                {!loadingOrders && !fetchError && orders.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-[var(--text-secondary)] py-3">
                        No tienes pedidos activos.
                    </p>
                )}

                {orders.length > 0 && (
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {orders.map((order) => (
                            <button
                                key={order.id}
                                onClick={() => handleOrderSelect(order)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-primary)] text-xs text-left text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200 shadow-sm"
                            >
                                <Icon name="ShoppingBag" className="text-sm flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span className="truncate font-medium">{order.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleAction('comprar')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-primary)] text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Cómo comprar
                </button>

                <button
                    onClick={() => handleAction('pedidos')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-primary)] text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Mis pedidos
                </button>

                <button
                    onClick={() => handleAction('pago')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-primary)] text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Métodos de pago
                </button>

                <button
                    onClick={() => handleAction('comprobante')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-primary)] text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Solicitar comprobante
                </button>

                <button
                    onClick={() => handleAction('vender')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-primary)] text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Vender en Lyrium
                </button>

                <button
                    onClick={() => handleAction('soporte')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-primary)] text-xs font-medium text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Contactar soporte
                </button>
            </div>
        </div>
    );
}
