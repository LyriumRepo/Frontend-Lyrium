import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Order, ItemStatus, ServiceOrderItem, ORDER_STATUS_LABELS, OrderType, TipoEnvio, ShippingInfo } from '@/features/seller/sales/types';
import ProductOrderStepper from './OrderStepper';
import ServiceOrderStepper, { ServiceFlowType } from './ServiceOrderStepper';
import OrderItemList from './OrderItemList';
import BaseButton from '@/components/ui/BaseButton';
import BaseDrawer from '@/components/ui/BaseDrawer';
import Icon from '@/components/ui/Icon';
import { formatDate, formatDateTime } from '@/shared/lib/utils/formatters';
import { generateOrderPdf } from '../utils/generateOrderPdf';
import SalesLegendModal from './SalesLegendModal';
import LogisticsModal from './LogisticsModal';
import { CARRIERS, CARRIER_CODES } from '@/features/seller/sales/config/logistics';

interface OrderDetailModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onAdvanceStep: (orderId: string, section?: 'products' | 'services' | 'confirm') => Promise<void>;
    onConfirmItem?: (orderId: string, itemId: string) => Promise<void>;
    onCancelItem?: (orderId: string, itemId: string) => Promise<void>;
    onUpdateItemStatus?: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
    onShipWithCarrier?: (orderId: string, carrierCode: string, carrierData: Record<string, string>) => Promise<void>;
}

type StepAction = { label: string; icon: string };

// ── Product flow configs ──
const PRODUCT_FLOW_ACTIONS: Record<TipoEnvio, Record<number, StepAction>> = {
    domicilio: {
        1: { label: 'Confirmar Validación',       icon: 'CheckCircle2' },
        2: { label: 'Marcar Despachado',           icon: 'Package'      },
        3: { label: 'Confirmar En Transporte',     icon: 'Truck'        },
        4: { label: 'Confirmar Entrega Domicilio', icon: 'Home'         },
    },
    agencia: {
        1: { label: 'Confirmar Validación',        icon: 'CheckCircle2' },
        2: { label: 'Marcar Despachado',            icon: 'Package'      },
        3: { label: 'Confirmar En Transporte',      icon: 'Truck'        },
        4: { label: 'Listo para Recojo en Agencia', icon: 'ScanBarcode'  },
    },
    retiro_tienda: {
        1: { label: 'Confirmar Validación',           icon: 'CheckCircle2' },
        2: { label: 'Marcar Despachado',              icon: 'Package'      },
        3: { label: 'Listo para Recojo en Tienda',    icon: 'Store'        },
    },
};

const PRODUCT_MAX_STEP: Record<TipoEnvio, number> = {
    domicilio: 5,
    agencia:   5,
    retiro_tienda: 4,
};

// ── Service flow configs (status→action) ──
const SERVICE_ACTIONS_BY_STATUS: Record<ServiceFlowType, Record<string, StepAction | undefined>> = {
    domicilio: {
        pending:    { label: 'Validar atención',    icon: 'CheckCircle2' },
        confirmed:  { label: 'Marcar en camino',    icon: 'Truck'        },
        on_the_way: undefined,
        completed:  undefined,
    },
    sede: {
        pending:    { label: 'Validar atención',   icon: 'CheckCircle2' },
        confirmed:  { label: 'Confirmar atención', icon: 'UserCheck'    },
        completed:  undefined,
    },
};

// ── Service flow configs (step→action, fallback) ──
const SERVICE_STEP_ACTIONS: Record<ServiceFlowType, Record<number, StepAction>> = {
    domicilio: {
        1: { label: 'Validar atención',    icon: 'CheckCircle2' },
        2: { label: 'Marcar en camino',    icon: 'Truck'        },
    },
    sede: {
        1: { label: 'Validar atención',   icon: 'CheckCircle2' },
        2: { label: 'Confirmar atención', icon: 'UserCheck'    },
    },
};

const SERVICE_MAX_STEP: Record<ServiceFlowType, number> = {
    domicilio: 3,
    sede:      3,
};

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
    product: 'Producto',
    service: 'Servicio',
    mixed: 'Mixto',
};

const ORDER_TYPE_BADGE: Record<OrderType, { icon: string; class: string }> = {
    product: { icon: 'Package', class: 'bg-blue-100 text-blue-700' },
    service: { icon: 'Briefcase', class: 'bg-purple-100 text-purple-700' },
    mixed: { icon: 'LayoutGrid', class: 'bg-amber-100 text-amber-700' },
};

const SERVICE_STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
    pending_seller: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'Clock' },
    confirmed: { bg: 'bg-sky-100', text: 'text-sky-700', icon: 'Check' },
    on_the_way: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'Truck' },
    processing: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: 'Package' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'CheckCircle' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: 'X' },
};

const HEADER_STATUS_CONFIG: Record<string, { label: string; icon: string }> = {
    pending_seller: { label: 'Pendiente', icon: 'Clock' },
    pending: { label: 'Pendiente', icon: 'Clock' },
    confirmed: { label: 'Confirmado', icon: 'CheckCircle' },
    on_the_way: { label: 'En camino', icon: 'Truck' },
    processing: { label: 'En preparación', icon: 'Package' },
    shipped: { label: 'En transporte', icon: 'Truck' },
    delivered: { label: 'Entregado', icon: 'Home' },
    completed: { label: 'Atención completada', icon: 'CheckCircle' },
    cancelled: { label: 'Cancelado', icon: 'XCircle' },
};

function formatTime(time: string | null): string {
    if (!time) return '-';
    return time.substring(0, 5);
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-[var(--border-subtle)]">
                <Icon name={icon} className="w-5 h-5" />
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
                <div className="text-sm font-black text-[var(--text-primary)] leading-snug">{value}</div>
            </div>
        </div>
    );
}

function Badge({ label, className }: { label: string; className: string }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider ${className}`}>
            {label}
        </span>
    );
}

function FinancialRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
            <span className={`text-xs ${bold ? 'font-black text-[var(--text-primary)]' : 'font-bold text-[var(--text-secondary)]'}`}>
                {value}
            </span>
        </div>
    );
}

function ServiceItemRow({ item }: { item: ServiceOrderItem }) {
    const statusStyle = SERVICE_STATUS_STYLES[item.status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'Circle' };
    const statusLabel = ORDER_STATUS_LABELS[item.status as keyof typeof ORDER_STATUS_LABELS] || item.status;

    return (
        <div className="bg-[var(--bg-secondary)]/30 p-4 flex justify-between items-center group hover:bg-[var(--bg-card)] transition-all">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[var(--bg-card)] rounded-xl flex items-center justify-center text-[10px] font-black text-[var(--text-secondary)] group-hover:text-emerald-500 transition-colors shadow-sm shrink-0">
                    <Icon name="Briefcase" className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-black text-[var(--text-primary)] uppercase leading-none truncate">{item.serviceName}</p>
                    {item.specialistName && (
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                            <Icon name="User" className="w-2.5 h-2.5" />
                            {item.specialistName}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        {item.appointmentDate && (
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                                <Icon name="Calendar" className="w-2.5 h-2.5" />
                                {formatDate(item.appointmentDate)}
                            </span>
                        )}
                        {(item.startTime || item.endTime) && (
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                                <Icon name="Clock" className="w-2.5 h-2.5" />
                                {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </span>
                        )}
                        {item.modality && (
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
                                <Icon name="MapPin" className="w-2.5 h-2.5" />
                                {item.modality === 'presencial' || item.modality === 'in_person' ? 'Atención en sede' : item.modality === 'domicilio' || item.modality === 'home' ? 'Atención a domicilio' : item.modality === 'online' ? 'En línea' : item.modality}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-3">
                <div className="text-right">
                    <p className="text-sm font-black text-[var(--text-primary)]">
                        S/ {item.lineTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${statusStyle.bg} ${statusStyle.text}`}>
                        <Icon name={statusStyle.icon} className="w-2.5 h-2.5" />
                        {statusLabel}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function OrderDetailModal({
    order, isOpen, onClose, onAdvanceStep,
    onConfirmItem, onCancelItem, onUpdateItemStatus,
    onShipWithCarrier
}: OrderDetailModalProps) {
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [openSection, setOpenSection] = useState<'products' | 'services' | null>(
        order?.orderType === 'mixed' ? 'products' : null
    );
    const [showLegend, setShowLegend] = useState(false);
    const [showLogistics, setShowLogistics] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!order) return null;
    if (!mounted) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const hasItems = order.items.length > 0;
    const hasServiceItems = order.serviceItems.length > 0;
    const isMixed = order.orderType === 'mixed';
    const isServiceOrder = hasServiceItems && !hasItems;

    const tipoEnvio: TipoEnvio = hasItems ? (order.tipo_envio ?? 'domicilio') : 'domicilio';
    const serviceFlowType: ServiceFlowType = hasServiceItems
        ? (order.serviceItems?.some(item => {
            const m = String(item.modality ?? '').trim().toLowerCase();
            return m === 'home' || m === 'domicilio' || m === 'home_service';
        }) ? 'domicilio' : 'sede')
        : 'domicilio';

    const productMaxStep  = hasItems ? PRODUCT_MAX_STEP[tipoEnvio] : 0;
    const serviceMaxStep  = hasServiceItems ? SERVICE_MAX_STEP[serviceFlowType] : 0;
    const maxStep         = hasItems ? productMaxStep : serviceMaxStep;
    const productIsDone   = hasItems ? order.productCurrentStep >= productMaxStep : true;
    const serviceIsDone   = hasServiceItems ? order.serviceCurrentStep > serviceMaxStep : true;

    const productAction   = hasItems ? PRODUCT_FLOW_ACTIONS[tipoEnvio]?.[order.productCurrentStep] : null;
    const firstServiceStatus = order.serviceItems?.[0]?.status as string ?? 'pending';
    const serviceAction   = hasServiceItems
        ? (SERVICE_ACTIONS_BY_STATUS[serviceFlowType]?.[firstServiceStatus]
            ?? SERVICE_STEP_ACTIONS[serviceFlowType]?.[order.serviceCurrentStep]
            ?? null)
        : null;
    const action          = isMixed ? null : (productAction ?? serviceAction);
    const isDone          = isMixed ? (productIsDone && serviceIsDone) : !action;
    const firstServiceItem = order.serviceItems?.[0] ?? null;
    const isVerified = order.estado_pago === 'verificado' || order.estado === 'pending_seller';
    const typeConfig = ORDER_TYPE_BADGE[order.orderType] || ORDER_TYPE_BADGE.product;

    function parseCity(city: string): { departamento: string; provincia: string; distrito: string } {
        const parts = (city || '').split(',').map(s => s.trim()).filter(Boolean);
        return {
            distrito: parts[0] || '—',
            provincia: parts[1] || '—',
            departamento: parts[2] || '—',
        };
    }

    const { departamento, provincia, distrito } = parseCity(order.envio.city);

    const handleAdvance = async () => {
        const isLogisticsStep = productAction?.label === 'Confirmar En Transporte';
        const isPickup = tipoEnvio === 'retiro_tienda';
        if (isLogisticsStep && onShipWithCarrier && !isPickup) {
            setShowLogistics(true);
            return;
        }

        console.log('[OrderDetailModal::handleAdvance]', {
            orderId: order.id,
            orderType: order.orderType,
            isMixed,
            openSection,
            isServiceOrder,
            hasItems,
            hasServiceItems,
            firstServiceItem: firstServiceItem ? {
                id: firstServiceItem.id,
                serviceBookingId: firstServiceItem.serviceBookingId,
                status: firstServiceItem.status,
                modality: firstServiceItem.modality,
            } : null,
            allServiceItems: order.serviceItems?.map(si => ({
                id: si.id,
                serviceBookingId: si.serviceBookingId,
                status: si.status,
            })),
        });

        setIsAdvancing(true);
        try {
            const section = (isServiceOrder || (isMixed && openSection === 'services')) ? 'services' : undefined;
            const sectionOrConfirm = !isServiceOrder && order.productCurrentStep === 1 ? 'confirm' : section;
            console.log('[OrderDetailModal::handleAdvance] calling onAdvanceStep', { orderId: order.id, section: sectionOrConfirm });
            await onAdvanceStep(order.id, sectionOrConfirm);
            console.log('[OrderDetailModal::handleAdvance] onAdvanceStep completed successfully');
        } catch (err) {
            console.error('[OrderDetailModal::handleAdvance] onAdvanceStep failed', err);
            throw err;
        } finally {
            setIsAdvancing(false);
        }
    };

    const handleShipWithCarrier = async (carrierCode: string, carrierData: Record<string, string>) => {
        if (!onShipWithCarrier) return;
        setShowLogistics(false);
        setIsAdvancing(true);
        await onShipWithCarrier(order.id, carrierCode, carrierData);
        setIsAdvancing(false);
    };

    const handleConfirmItem = async (itemId: string) => {
        if (onConfirmItem) await onConfirmItem(order.id, itemId);
    };

    const handleCancelItem = async (itemId: string) => {
        if (onCancelItem) await onCancelItem(order.id, itemId);
    };

    const footer = (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-sky-500 p-8 rounded-[3rem] shadow-2xl w-full">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="text-[10px] font-black text-sky-200 uppercase tracking-widest mb-1 flex items-center gap-1 justify-center sm:justify-start">
                    <Icon name="CheckCircle2" className="text-white w-3 h-3" /> Total a Liquidar
                </p>
                <p className="text-1xl font-black text-white tracking-tighter">
                    S/ {order.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <BaseButton
                    variant="ghost"
                    className="flex-1 sm:flex-none !text-white !border-gray-700 hover:!bg-[var(--bg-card)] hover:!text-[var(--text-primary)] shadow-lg"
                    leftIcon="Printer"
                    onClick={() => generateOrderPdf(order)}
                >
                    Imprimir
                </BaseButton>
                {isMixed ? (
                    openSection === 'products' ? (
                        !productIsDone && productAction && (
                            <BaseButton
                                onClick={handleAdvance}
                                isLoading={isAdvancing}
                                className="flex-1 sm:flex-none !text-white !border-white/20 hover:!bg-white/10 shadow-lg"
                                variant="ghost"
                                leftIcon={productAction.icon}
                            >
                                {productAction.label}
                            </BaseButton>
                        )
                    ) : (
                        !serviceIsDone && serviceAction && (
                            <BaseButton
                                onClick={handleAdvance}
                                isLoading={isAdvancing}
                                className="flex-1 sm:flex-none !text-white !border-emerald-500/30 hover:!bg-white/10 shadow-lg"
                                variant="ghost"
                                leftIcon={serviceAction.icon}
                            >
                                {serviceAction.label}
                            </BaseButton>
                        )
                    )
                ) : (
                    !isDone && action && (
                        <BaseButton
                            onClick={handleAdvance}
                            isLoading={isAdvancing}
                            className="flex-1 sm:flex-none !text-white !border-white/20 hover:!bg-white/10 shadow-lg"
                            variant="ghost"
                            leftIcon={action.icon}
                        >
                            {action.label}
                        </BaseButton>
                    )
                )}
            </div>
        </div>
    );

    return createPortal(
        <>
        <BaseDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={order.orderNumber}
            subtitle={order.cliente}
            badge={ORDER_TYPE_LABELS[order.orderType] || 'Producto'}
            footer={footer}
            width="md:w-[600px]"
            accentColor="from-emerald-500/10 via-sky-500/5"
        >
            <div className="space-y-8">
                {/* Status Header */}
                <div className="flex items-center gap-3 flex-wrap">
                    {isMixed ? (
                        <>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider border-sky-200 bg-sky-50 text-sky-700 shadow-sm">
                                <Icon name="Package" className="w-3.5 h-3.5" />
                                Productos: {HEADER_STATUS_CONFIG[order.estado]?.label || order.estado}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider border-purple-200 bg-purple-50 text-purple-700 shadow-sm">
                                <Icon name="Briefcase" className="w-3.5 h-3.5" />
                                Servicios: {order.serviceCurrentStep <= 1 ? 'Pendiente' : order.serviceCurrentStep === 2 ? 'Atención confirmada' : 'Atención completada'}
                            </span>
                        </>
                    ) : (
                        (() => {
                            const cfg = HEADER_STATUS_CONFIG[order.estado] || HEADER_STATUS_CONFIG.pending_seller;
                            const colorMap: Record<string, { border: string; bg: string; text: string }> = {
                                pending_seller: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700' },
                                confirmed: { border: 'border-sky-200', bg: 'bg-sky-50', text: 'text-sky-700' },
                                processing: { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-700' },
                                shipped: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700' },
                                delivered: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                                cancelled: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700' },
                            };
                            const colors = colorMap[order.estado] || colorMap.pending_seller;
                            return (
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${colors.border} ${colors.bg} ${colors.text} shadow-sm`}>
                                    <Icon name={cfg.icon} className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-wider">{cfg.label}</span>
                                </span>
                            );
                        })()
                    )}
                    <button
                        onClick={() => setShowLegend(true)}
                        className="ml-auto w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors shrink-0"
                        title="Leyenda"
                    >
                        <Icon name="HelpCircle" className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* WORKFLOW — Productos accordion (mixed) */}
                {isMixed && hasItems && (
                    <div className="space-y-3">
                        <div
                            className="flex items-center justify-between p-5 bg-[var(--bg-secondary)]/50 rounded-[2rem] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-card)] transition-all select-none"
                            onClick={() => setOpenSection(openSection === 'products' ? null : 'products')}
                        >
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl border text-[9px] font-black uppercase tracking-widest text-sky-500 bg-sky-500/10 border-sky-500/20">
                                    <Icon name="Package" className="w-3 h-3" />
                                    Productos
                                </span>
                                <span className="text-[9px] font-bold text-[var(--text-secondary)]">
                                    Paso {Math.min(order.productCurrentStep, productMaxStep)}/{productMaxStep}
                                </span>
                            </div>
                            <Icon
                                name={openSection === 'products' ? 'ChevronUp' : 'ChevronDown'}
                                className="w-4 h-4 text-[var(--text-secondary)] transition-transform"
                            />
                        </div>
                        {openSection === 'products' && (
                            <div className="space-y-6">
                                <ProductOrderStepper currentStep={order.productCurrentStep} tipoEnvio={tipoEnvio} />
                                <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                                    {tipoEnvio === 'retiro_tienda' ? (
                                        <>
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                                                <Icon name="Store" className="w-3 h-3 inline mr-1" /> Retiro en Tienda
                                            </p>
                                            {order.branch ? (
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
                                                                <Icon name="Store" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">{order.branch.name}</p>
                                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500">El cliente recogerá en esta sucursal</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Departamento</p>
                                                            <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.department || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Provincia</p>
                                                            <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.province || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Distrito</p>
                                                            <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.district || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dirección</p>
                                                            <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.address || '—'}</p>
                                                        </div>
                                                        {order.branch.phone && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Teléfono</p>
                                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.phone}</p>
                                                            </div>
                                                        )}
                                                        {order.branch.hours && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Horario</p>
                                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.hours}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
                                                            <Icon name="Store" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">El cliente recogerá en tienda</p>
                                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500">Sin costo de envío — El pedido está listo para recojo</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                                                <Icon name="MapPin" className="w-3 h-3 inline mr-1" /> Dirección de Envío
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Departamento</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{departamento}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Provincia</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{provincia}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Distrito</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{distrito}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dirección</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.direccion || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Piso / Dpto / Lote</p>
                                                    <p className="text-sm font-black text-[var(--text-secondary)]">—</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Referencia</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.notes || '—'}</p>
                                                </div>
                                            </div>
                                            {(order.envio.carrier || (order.envio.tracking && order.envio.tracking !== '-')) && (
                                                <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] flex flex-wrap gap-x-10 gap-y-3">
                                                    {order.envio.carrier && (
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 shadow-sm border border-[var(--border-subtle)]">
                                                                <Icon name="Truck" className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Transportista</p>
                                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.carrier}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {order.envio.tracking && order.envio.tracking !== '-' && (
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 shadow-sm border border-[var(--border-subtle)]">
                                                                <Icon name="Package" className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">N° Tracking</p>
                                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.tracking}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* WORKFLOW — Servicios accordion (mixed) */}
                {isMixed && hasServiceItems && (
                    <div className="space-y-3">
                        <div
                            className="flex items-center justify-between p-5 bg-[var(--bg-secondary)]/50 rounded-[2rem] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-card)] transition-all select-none"
                            onClick={() => setOpenSection(openSection === 'services' ? null : 'services')}
                        >
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl border text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 border-purple-500/20">
                                    <Icon name="Briefcase" className="w-3 h-3" />
                                    Servicios
                                </span>
                                <span className="text-[9px] font-bold text-[var(--text-secondary)]">
                                    Paso {Math.min(order.serviceCurrentStep, serviceMaxStep)}/{serviceMaxStep}
                                </span>
                            </div>
                            <Icon
                                name={openSection === 'services' ? 'ChevronUp' : 'ChevronDown'}
                                className="w-4 h-4 text-[var(--text-secondary)] transition-transform"
                            />
                        </div>
                        {openSection === 'services' && (
                            <div className="space-y-6">
                                <ServiceOrderStepper currentStep={order.serviceCurrentStep} flowType={serviceFlowType} />
                                <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                                        <Icon name="CalendarClock" className="w-3 h-3 inline mr-1" /> Detalle de Atención
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Especialista</p>
                                            <p className="text-sm font-black text-[var(--text-primary)]">{firstServiceItem?.specialistName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Modalidad</p>
                                            <p className="text-sm font-black text-[var(--text-primary)]">
                                                {firstServiceItem?.modality === 'presencial' || firstServiceItem?.modality === 'in_person' ? 'Atención en sede'
                                                 : firstServiceItem?.modality === 'domicilio' || firstServiceItem?.modality === 'home' ? 'Atención a domicilio'
                                                 : firstServiceItem?.modality === 'online' ? 'En línea'
                                                 : (firstServiceItem?.modality || '—')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fecha</p>
                                            <p className="text-sm font-black text-[var(--text-primary)]">{firstServiceItem?.appointmentDate ? formatDate(firstServiceItem.appointmentDate) : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Horario</p>
                                            <p className="text-sm font-black text-[var(--text-primary)]">
                                                {firstServiceItem?.startTime || firstServiceItem?.endTime
                                                    ? `${formatTime(firstServiceItem?.startTime)} - ${formatTime(firstServiceItem?.endTime)}`
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Duración</p>
                                            <p className="text-sm font-black text-[var(--text-primary)]">{firstServiceItem?.durationMinutes ? `${firstServiceItem.durationMinutes} min` : '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TIMELINE — Productos (pure only) */}
                {!isMixed && hasItems && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl border text-[9px] font-black uppercase tracking-widest text-sky-500 bg-sky-500/10 border-sky-500/20">
                                <Icon name="Package" className="w-3 h-3" />
                                Productos
                            </span>
                        </div>
                        <ProductOrderStepper currentStep={order.productCurrentStep} tipoEnvio={tipoEnvio} />
                    </div>
                )}

                {/* TIMELINE — Servicios (pure only) */}
                {!isMixed && hasServiceItems && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl border text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 border-purple-500/20">
                                <Icon name="Briefcase" className="w-3 h-3" />
                                Servicios
                            </span>
                        </div>
                        <ServiceOrderStepper currentStep={order.serviceCurrentStep} flowType={serviceFlowType} />
                    </div>
                )}

                {/* 1 — DATOS PERSONALES */}
                <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                        <Icon name="User" className="w-3 h-3 inline mr-1" /> Datos Personales
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard icon="FileText" label="Tipo de documento" value={order.customerDocumentType || '—'} />
                        <InfoCard icon="FileText" label="Número de documento" value={order.customerDocument || '—'} />
                        <InfoCard icon="User" label="Nombre completo" value={order.cliente} />
                        <InfoCard icon="Phone" label="Celular" value={order.customerPhone || '—'} />
                        <InfoCard icon="Mail" label="Correo electrónico" value={order.customerEmail || '—'} />
                        {order.storeName && (
                            <InfoCard icon="Store" label="Tienda" value={order.storeName} />
                        )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap gap-x-6 gap-y-1 text-[8px] font-bold text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1"><Icon name="Calendar" className="w-2.5 h-2.5" /> Creado: {formatDate(order.fecha)}</span>
                        {order.updatedAt && <span className="flex items-center gap-1"><Icon name="Clock" className="w-2.5 h-2.5" /> Actualizado: {formatDateTime(order.updatedAt)}</span>}
                    </div>
                </div>

                {/* 2 — DIRECCIÓN DE ENVÍO / RETIRO EN TIENDA (pure only) */}
                {!isMixed && hasItems && (
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                        {tipoEnvio === 'retiro_tienda' ? (
                            <>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                                    <Icon name="Store" className="w-3 h-3 inline mr-1" /> Retiro en Tienda
                                </p>
                                {order.branch ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
                                                    <Icon name="Store" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">{order.branch.name}</p>
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500">El cliente recogerá en esta sucursal</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Departamento</p>
                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.department || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Provincia</p>
                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.province || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Distrito</p>
                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.district || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dirección</p>
                                                <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.address || '—'}</p>
                                            </div>
                                            {order.branch.phone && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Teléfono</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.phone}</p>
                                                </div>
                                            )}
                                            {order.branch.hours && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Horario</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{order.branch.hours}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
                                                <Icon name="Store" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">El cliente recogerá en tienda</p>
                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500">Sin costo de envío — El pedido está listo para recojo</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                                    <Icon name="MapPin" className="w-3 h-3 inline mr-1" /> Dirección de Envío
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Departamento</p>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{departamento}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Provincia</p>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{provincia}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Distrito</p>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{distrito}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dirección</p>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.direccion || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Piso / Dpto / Lote</p>
                                        <p className="text-sm font-black text-[var(--text-secondary)]">—</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Referencia</p>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.notes || '—'}</p>
                                    </div>
                                </div>
                                {(order.envio.carrier || (order.envio.tracking && order.envio.tracking !== '-')) && (
                                    <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] flex flex-wrap gap-x-10 gap-y-3">
                                        {order.envio.carrier && (
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 shadow-sm border border-[var(--border-subtle)]">
                                                    <Icon name="Truck" className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Transportista</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.carrier}</p>
                                                </div>
                                            </div>
                                        )}
                                        {order.envio.tracking && order.envio.tracking !== '-' && (
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 shadow-sm border border-[var(--border-subtle)]">
                                                    <Icon name="Package" className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">N° Tracking</p>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{order.envio.tracking}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* 3 — DETALLE DE ATENCIÓN (pure only) */}
                {!isMixed && hasServiceItems && (
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                            <Icon name="CalendarClock" className="w-3 h-3 inline mr-1" /> Detalle de Atención
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Especialista</p>
                                <p className="text-sm font-black text-[var(--text-primary)]">{firstServiceItem?.specialistName || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Modalidad</p>
                                <p className="text-sm font-black text-[var(--text-primary)]">
                                    {firstServiceItem?.modality === 'presencial' || firstServiceItem?.modality === 'in_person' ? 'Atención en sede'
                                     : firstServiceItem?.modality === 'domicilio' || firstServiceItem?.modality === 'home' ? 'Atención a domicilio'
                                     : firstServiceItem?.modality === 'online' ? 'En línea'
                                     : (firstServiceItem?.modality || '—')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fecha</p>
                                <p className="text-sm font-black text-[var(--text-primary)]">{firstServiceItem?.appointmentDate ? formatDate(firstServiceItem.appointmentDate) : '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Horario</p>
                                <p className="text-sm font-black text-[var(--text-primary)]">
                                    {firstServiceItem?.startTime || firstServiceItem?.endTime
                                        ? `${formatTime(firstServiceItem?.startTime)} - ${formatTime(firstServiceItem?.endTime)}`
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Duración</p>
                                <p className="text-sm font-black text-[var(--text-primary)]">{firstServiceItem?.durationMinutes ? `${firstServiceItem.durationMinutes} min` : '—'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3 — INFORMACIÓN DE PAGO */}
                <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                        <Icon name="CreditCard" className="w-3 h-3 inline mr-1" /> Información de Pago
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-[var(--border-subtle)]">
                                    <Icon name="CreditCard" className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Método</p>
                                    <p className="text-sm font-black text-[var(--text-primary)] uppercase">{order.metodo_pago}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-[var(--border-subtle)]">
                                    <Icon name="Banknote" className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Estado Pago</p>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider
                                        ${isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {isVerified ? 'VERIFICADO' : (order.estado_pago || 'PENDIENTE')}
                                    </span>
                                </div>
                            </div>
                            {order.couponCode && (
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-[var(--border-subtle)]">
                                        <Icon name="Tag" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Cupón</p>
                                        <p className="text-sm font-black text-[var(--text-primary)] uppercase">{order.couponCode}</p>
                                    </div>
                                </div>
                            )}
                            {order.paidAt && (
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-[var(--border-subtle)]">
                                        <Icon name="CalendarCheck" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fecha de Pago</p>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{formatDateTime(order.paidAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2.5 border-t md:border-t-0 md:border-l border-[var(--border-subtle)] pt-4 md:pt-0 md:pl-8">
                            {(order.sellerSubtotal ?? 0) > 0 && (
                                <FinancialRow label="Tu subtotal" value={`S/ ${(order.sellerSubtotal ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} bold />
                            )}
                            {(order.sellerShipping ?? 0) > 0 && (
                                <FinancialRow label="Tu costo de envío" value={`S/ ${(order.sellerShipping ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} bold />
                            )}
                            {(order.discountAmount ?? 0) > 0 && (
                                <FinancialRow label="Descuento" value={`- S/ ${(order.discountAmount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} />
                            )}
                            <div className="border-t border-[var(--border-subtle)] pt-2.5 mt-2.5">
                                <FinancialRow label="Total de orden" value={`S/ ${(order.sellerTotal ?? order.total ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} bold />
                            </div>
                            {order.isMultiStore && (
                                <div className="mt-3 p-3 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-subtle)]">
                                    <p className="text-[11px] font-bold flex items-center gap-1.5 text-[var(--text-primary)]">
                                        🛒 Pedido compuesto
                                    </p>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                                        Esta orden incluye productos de otras tiendas. Monto total de la orden: <strong>S/ {(order.total ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notas del Cliente */}
                {order.notes && (
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                            <Icon name="FileText" className="w-3 h-3 inline mr-1" /> Notas del Cliente
                        </p>
                        <p className="text-[13px] font-bold text-[var(--text-primary)] leading-relaxed">{order.notes}</p>
                    </div>
                )}

                {/* Resumen de Productos */}
                {order.items.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                <Icon name="Package" className="w-3 h-3 inline mr-1" /> Resumen de Productos
                                {order.orderType === 'mixed' && (
                                    <span className="ml-1 text-[8px] font-bold text-[var(--text-secondary)]">
                                        ({order.items.length} producto{order.items.length !== 1 ? 's' : ''})
                                    </span>
                                )}
                            </p>
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                {order.items.filter(i =>
                                    ['confirmed','processing','shipped','delivered'].includes(i.status)
                                ).length}/{order.items.length} confirmados
                            </span>
                        </div>
                        <OrderItemList
                            items={order.items}
                            onConfirmItem={onConfirmItem ? handleConfirmItem : undefined}
                            onCancelItem={onCancelItem ? handleCancelItem : undefined}
                        />
                    </div>
                )}

                {/* Resumen de Servicios */}
                {order.serviceItems.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                <Icon name="Briefcase" className="w-3 h-3 inline mr-1" /> Resumen de Servicios
                                {order.orderType === 'mixed' && (
                                    <span className="ml-1 text-[8px] font-bold text-[var(--text-secondary)]">
                                        ({order.serviceItems.length} servicio{order.serviceItems.length !== 1 ? 's' : ''})
                                    </span>
                                )}
                            </p>
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                {order.serviceItems.length} servicio{order.serviceItems.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="space-y-px rounded-[2rem] overflow-hidden border border-[var(--border-subtle)]">
                            {order.serviceItems.map((item) => (
                                <ServiceItemRow key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </BaseDrawer>
        <SalesLegendModal isOpen={showLegend} onClose={() => setShowLegend(false)} />
        {onShipWithCarrier && (
            <LogisticsModal
                isOpen={showLogistics}
                onClose={() => setShowLogistics(false)}
                onConfirm={handleShipWithCarrier}
                detectedCarrier={order.envio.checkoutCarrier ?? order.envio.carrierCode ?? null}
                existingData={order.envio.carrierData ?? null}
                tipoEnvio={tipoEnvio}
            />
        )}
        </>,
        modalRoot,
    );
}