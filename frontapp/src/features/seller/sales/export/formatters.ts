import type { OrderItem, ServiceOrderItem } from '../types'

const CURRENCY_LOCALE = 'es-PE'
const CURRENCY = 'S/'
const DATE_LOCALE = 'es-PE'

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return `${CURRENCY} 0.00`
  return `${CURRENCY} ${value.toLocaleString(CURRENCY_LOCALE, { minimumFractionDigits: 2 })}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString(DATE_LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return value
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString(DATE_LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function normalizePaymentStatus(status: string | null | undefined): string {
  switch (status) {
    case 'paid':
    case 'verified':
      return 'paid'
    case 'pending':
      return 'pending'
    case 'failed':
      return 'failed'
    case 'refunded':
      return 'refunded'
    default:
      return status ?? ''
  }
}

export function normalizeShippingType(type: string | null | undefined): string {
  switch (type) {
    case 'domicilio':
      return 'Domicilio'
    case 'agencia':
      return 'Agencia'
    case 'retiro_tienda':
      return 'Retiro en Tienda'
    default:
      return type ?? '—'
  }
}

export function formatProductsDetail(items: OrderItem[]): string {
  if (!items || items.length === 0) return ''
  return items
    .map((item) => {
      const name = item.name || 'Producto'
      const qty = item.qty ?? 1
      const price = formatCurrency(item.price)
      return `${name} x${qty} (${price})`
    })
    .join(' | ')
}

export function formatServicesDetail(serviceItems: ServiceOrderItem[]): string {
  if (!serviceItems || serviceItems.length === 0) return ''
  return serviceItems
    .map((item) => {
      const parts: string[] = [item.serviceName || 'Servicio']
      if (item.specialistName) parts.push(item.specialistName)
      if (item.appointmentDate) {
        const date = formatDate(item.appointmentDate)
        const time =
          item.startTime
            ? item.startTime.substring(0, 5)
            : null
        parts.push(time ? `${date} ${time}` : date)
      }
      parts.push(formatCurrency(item.lineTotal))
      return parts.join(' - ')
    })
    .join(' | ')
}

export function truncate(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str
  return str.substring(0, maxLen - 1) + '…'
}

export function safeString(value: string | null | undefined): string {
  return value ?? ''
}
