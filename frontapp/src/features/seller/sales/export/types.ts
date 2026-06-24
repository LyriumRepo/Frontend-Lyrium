export interface SalesExportRow {
  orderId: string
  orderNumber: string
  orderType: string
  orderStatus: string
  orderStatusLabel: string

  customerName: string
  customerEmail: string
  customerPhone: string
  customerDocumentType: string
  customerDocumentNumber: string

  storeName: string

  itemsSummary: string
  totalProducts: number
  totalServices: number
  totalQuantity: number

  productsDetail: string
  servicesDetail: string

  paymentMethod: string
  paymentStatus: string
  paymentStatusLabel: string
  paidAt: string

  shippingType: string
  carrier: string
  trackingNumber: string
  shippingAddress: string
  shippingCity: string
  shippingPostalCode: string
  shippingNotes: string

  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  total: number

  couponCode: string

  customerNotes: string

  createdAt: string
  updatedAt: string
}
