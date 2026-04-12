'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { OrderDetails, updateOrderStatus, addOrderNote } from '@/shared/lib/actions/orders';
import { getStatusLabel, getStatusColor, formatDateTime, ORDER_STATUSES, OrderStatus, WooCommerceStatus } from '@/shared/lib/utils/order-utils';

type AnyOrderStatus = OrderStatus | WooCommerceStatus;
import { formatCurrency } from '@/shared/lib/utils/formatters';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';
import { useToast } from '@/shared/lib/context/ToastContext';

interface OrderDetailClientProps {
  order: OrderDetails;
}

export default function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState(initialOrder);
  const [isPending, startTransition] = useTransition();
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleStatusChange = async (newStatus: AnyOrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, newStatus as any);

      if (result.success) {
        setOrder(prev => ({ ...prev, status: newStatus as any }));
        showToast(result.message || 'Estado actualizado', 'success');
      } else {
        showToast(result.error || 'Error al actualizar', 'error');
      }

      setShowStatusSelect(false);
    });
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;

    setIsAddingNote(true);
    const result = await addOrderNote(order.id, note);

    if (result.success) {
      showToast('Nota agregada', 'success');
      setNote('');
    } else {
      showToast(result.error || 'Error al agregar nota', 'error');
    }
    setIsAddingNote(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 print:print-container">
      <ModuleHeader
        title={`Pedido #${order.number}`}
        subtitle={`Cliente: ${order.customer.first_name} ${order.customer.last_name}`}
        icon="ShoppingBag"
        actions={
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Icon name="Printer" className="w-4 h-4" />
            <span className="text-sm font-bold">Imprimir</span>
          </button>
        }
      />

      {/* Status Card */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <span className="text-gray-500 text-sm">
              {formatDateTime(order.date_created)}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStatusSelect(!showStatusSelect)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              <Icon name="RefreshCw" className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
              Cambiar Estado
            </button>

            {showStatusSelect && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2">
                {ORDER_STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${order.status === status ? 'bg-gray-50 font-bold' : ''
                      }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg">
            <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Productos</h3>
            <div className="space-y-4">
              {order.line_items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover rounded-lg" />
                    ) : (
                      <Icon name="Package" className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(item.price)} x {item.quantity}</p>
                    <p className="text-sm text-gray-500">Total: {formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Envío</span>
                <span className="font-bold">{formatCurrency(order.shipping_total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Impuestos</span>
                <span className="font-bold">{formatCurrency(order.tax_total)}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-emerald-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          {order.customer_note && (
            <div className="glass-card p-6 rounded-3xl bg-amber-50 border border-amber-100">
              <h3 className="text-sm font-black text-amber-800 uppercase mb-2">Nota del Cliente</h3>
              <p className="text-amber-900">{order.customer_note}</p>
            </div>
          )}

          {/* Add Note */}
          <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg">
            <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Agregar Nota</h3>
            <div className="space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe una nota interna..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-100"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={isAddingNote || !note.trim()}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {isAddingNote ? 'Agregando...' : 'Agregar Nota'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg">
            <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Cliente</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Nombre</p>
                <p className="font-bold text-gray-800">{order.customer.first_name} {order.customer.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                <p className="font-bold text-gray-800">{order.customer.email}</p>
              </div>
              {order.customer.phone && (
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Teléfono</p>
                  <p className="font-bold text-gray-800">{order.customer.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Address */}
          <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg">
            <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Dirección de Facturación</h3>
            <p className="text-gray-600 text-sm">
              {order.billing.address_1}<br />
              {order.billing.address_2 && <>{order.billing.address_2}<br /></>}
              {order.billing.city}, {order.billing.state} {order.billing.postcode}<br />
              {order.billing.country}
            </p>
          </div>

          {/* Shipping Address */}
          <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg">
            <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Dirección de Envío</h3>
            <p className="text-gray-600 text-sm">
              {order.shipping.address_1}<br />
              {order.shipping.address_2 && <>{order.shipping.address_2}<br /></>}
              {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}<br />
              {order.shipping.country}
            </p>
          </div>

          {/* Payment Info */}
          <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg">
            <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Pago</h3>
            <p className="font-bold text-gray-800">{order.payment_method_title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
