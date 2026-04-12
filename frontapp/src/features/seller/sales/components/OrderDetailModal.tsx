import React, { useState } from 'react';
import { Order, ItemStatus, ORDER_STATUS_LABELS } from '@/features/seller/sales/types';
import OrderStepper from './OrderStepper';
import OrderItemList from './OrderItemList';
import BaseButton from '@/components/ui/BaseButton';
import BaseDrawer from '@/components/ui/BaseDrawer';
import Icon from '@/components/ui/Icon';

interface OrderDetailModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onAdvanceStep: (orderId: string) => Promise<void>;
    onConfirmItem?: (orderId: string, itemId: string) => Promise<void>;
    onCancelItem?: (orderId: string, itemId: string) => Promise<void>;
    onUpdateItemStatus?: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
}

export default function OrderDetailModal({ order, isOpen, onClose, onAdvanceStep, onConfirmItem, onCancelItem, onUpdateItemStatus }: OrderDetailModalProps) {
    const [isAdvancing, setIsAdvancing] = useState(false);

    if (!order) return null;

    const handleAdvance = async () => {
        setIsAdvancing(true);
        await onAdvanceStep(order.id);
        setIsAdvancing(false);
    };

    const handleConfirmItem = async (itemId: string) => {
        if (onConfirmItem) {
            await onConfirmItem(order.id, itemId);
        }
    };

    const handleCancelItem = async (itemId: string) => {
        if (onCancelItem) {
            await onCancelItem(order.id, itemId);
        }
    };

    const nextStepIcons: Record<number, string> = {
        1: 'CheckCircle2',
        2: 'Logistics',
        3: 'Truck',
        4: 'Truck',
        5: 'CheckCircle2'
    };

    const nextStepActions: Record<number, string> = {
        1: 'Confirmar Validación',
        2: 'Enviar a Despacho',
        3: 'Confirmar envío Agencia',
        4: 'Marcar en Tránsito',
        5: 'Finalizar Entrega'
    };

    const isVerified = order.estado_pago === 'verificado' || order.estado === 'pending_seller';
    const statusLabel = ORDER_STATUS_LABELS[order.global_status] || ORDER_STATUS_LABELS[order.estado];

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
                >
                    Imprimir
                </BaseButton>
                <BaseButton
                    onClick={handleAdvance}
                    isLoading={isAdvancing}
                    disabled={order.currentStep >= 5}
                    className={`flex-1 sm:flex-none !text-white !border-white/20 hover:!bg-white/10 shadow-lg ${order.currentStep >= 5 ? 'hidden' : ''}`}
                    variant="ghost"
                    leftIcon={order.currentStep >= 5 ? 'CheckCircle2' : (nextStepIcons[order.currentStep] || 'ArrowRight')}
                >
                    {order.currentStep >= 5 ? 'Entregado' : nextStepActions[order.currentStep] || 'Siguiente Paso'}
                </BaseButton>
            </div>
        </div>
    );

    return (
        <BaseDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={order.id}
            subtitle={order.cliente}
            badge="Detalle de Operación"
            footer={footer}
            width="md:w-[600px]"
            accentColor="from-emerald-500/10 via-sky-500/5"
        >
            <div className="space-y-8">
                {/* Stepper */}
                <OrderStepper currentStep={order.currentStep} />

                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">Logística de Envío</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-[var(--border-subtle)]">
                                    <Icon name="MapPin" className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Dirección</p>
                                    <p className="text-[11px] font-black text-[var(--text-primary)] leading-tight">{order.envio.direccion}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-[var(--border-subtle)]">
                                    <Icon name="Truck" className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Transporte / Tracking</p>
                                    <p className="text-[11px] font-black text-[var(--text-primary)] leading-tight">
                                        {order.envio.carrier} - {order.envio.tracking}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-subtle)]">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">Información de Pago</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 shadow-sm border border-[var(--border-subtle)]">
                                    <Icon name="CreditCard" className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Método</p>
                                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase">{order.metodo_pago}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-emerald-600 shadow-sm border border-[var(--border-subtle)]">
                                    <Icon name="Banknote" className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Estado Pago</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider
                                        ${isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {isVerified ? 'VERIFICADO' : (order.estado_pago || 'PENDIENTE')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Resumen de Productos</p>
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            {order.items.filter(i => i.status === 'confirmed' || i.status === 'processing' || i.status === 'shipped' || i.status === 'delivered').length}/{order.items.length} confirmados
                        </span>
                    </div>
                    <OrderItemList 
                        items={order.items} 
                        onConfirmItem={onConfirmItem ? (itemId) => handleConfirmItem(itemId) : undefined}
                        onCancelItem={onCancelItem ? (itemId) => handleCancelItem(itemId) : undefined}
                    />
                </div>
            </div>
        </BaseDrawer>
    );
}
