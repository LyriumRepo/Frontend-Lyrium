import type { Order } from '../types'
import type { SalesExportRow } from './types'
import {
  formatProductsDetail,
  formatServicesDetail,
  normalizeShippingType,
  safeString,
} from './formatters'
import { ORDER_TYPE_LABELS } from './constants'

export function mapOrderToSalesExportRow(order: Order): SalesExportRow {
  const isService = order.orderType === 'service'

  return {
    orderId: order.id,
    orderNumber: order.orderNumber || order.id,
    orderType: ORDER_TYPE_LABELS[order.orderType] || order.orderType,
    orderStatus: order.estado,
    orderStatusLabel: order.statusLabel || order.estado,

    customerName: order.cliente,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerDocumentType: order.customerDocumentType,
    customerDocumentNumber: order.customerDocument,

    storeName: safeString(order.storeName),

    itemsSummary: order.itemsSummary || '',
    totalProducts: order.items.length,
    totalServices: order.serviceItems.length,
    totalQuantity: order.unidades,

    productsDetail: formatProductsDetail(order.items),
    servicesDetail: formatServicesDetail(order.serviceItems),

    paymentMethod: order.metodo_pago || '',
    paymentStatus: order.estado_pago || '',
    paymentStatusLabel: order.paymentStatusLabel || order.estado_pago || '',
    paidAt: safeString(order.paidAt),

    shippingType: isService ? '—' : normalizeShippingType(order.tipo_envio),
    carrier: isService ? '' : safeString(order.envio.carrier),
    trackingNumber: isService ? '' : safeString(order.trackingNumber),
    shippingAddress: isService ? '' : safeString(order.envio.direccion),
    shippingCity: isService ? '' : safeString(order.envio.city),
    shippingPostalCode: isService ? '' : safeString(order.envio.postalCode),
    shippingNotes: isService ? '' : safeString(order.envio.notes),

    subtotal: order.subtotal ?? 0,
    shippingCost: isService ? 0 : (order.shippingCost ?? 0),
    taxAmount: order.taxAmount ?? 0,
    discountAmount: order.discountAmount ?? 0,
    total: order.total ?? 0,

    couponCode: safeString(order.couponCode),

    customerNotes: safeString(order.notes),

    createdAt: order.fecha || '',
    updatedAt: order.updatedAt || '',
  }
}

export function mapOrdersToExportRows(orders: Order[]): SalesExportRow[] {
  return orders.map(mapOrderToSalesExportRow)
}
