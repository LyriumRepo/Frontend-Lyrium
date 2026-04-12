/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ENTITIES - Tipos Unificados del Sistema
 * 
 * Este archivo es la FUENTE ÚNICA DE VERDAD para todos los tipos de entidades.
 * - Deriva tipos desde Zod Schemas donde existe validación
 * - Proporciona tipos limpios para el Frontend (sin estructura de WP)
 * - Elimina redundancia entre types/ y schemas/
 * 
 * IMPORTANTE: Antes de agregar un nuevo tipo:
 * 1. ¿Ya existe un Zod Schema? → Usar z.infer
 * 2. ¿Es una entidad del dominio? → Agregar aquí
 * 3. ¿Es un tipo de UI/View? → Preferir en componente
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

// ============================================================================
// SCHEMAS DE REFERENCIA (para inferir tipos)
// ============================================================================

// Products
export const ProductFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.union([z.string(), z.number()]),
  regularPrice: z.union([z.string(), z.number(), z.null()]).optional(),
  stock: z.union([z.string(), z.number()]).default(0),
  category: z.string().optional().default(''),
  sku: z.string().optional().default(''),
  images: z.array(z.string()).default([]),
  featuredImage: z.string().optional().default(''),
  nonce: z.string().min(10),
});

// Orders
export const OrderStatusSchema = z.enum([
  'pending', 'processing', 'on-hold', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'
]);

// ============================================================================
// TIPOS UNIFICADOS (Frontend - Struktur WP-agnostic)
// ============================================================================

// -------------------- PRODUCT --------------------
export type ProductSticker = 'liquidacion' | 'oferta' | 'descuento' | 'nuevo' | 'bestseller' | 'envio_gratis' | null;

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  weight?: number;
  dimensions?: string;
  description: string;
  image: string;
  sticker: ProductSticker;
  discountPercentage?: number;
  mainAttributes: ProductAttribute[];
  additionalAttributes: ProductAttribute[];
  createdAt: string;
}

export interface ProductAttribute {
  values: string[];
}

// Tipo para formularios (derive from Zod)
export type ProductFormData = z.infer<typeof ProductFormSchema>;

// -------------------- ORDER --------------------
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

// -------------------- CUSTOMER --------------------
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  billingAddress: Address;
  shippingAddress: Address;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

// -------------------- SELLER / VENDOR --------------------
export interface Seller {
  id: string;
  userId: number;
  storeName: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  email: string;
  phone?: string;
  address?: Address;
  status: 'active' | 'pending' | 'suspended' | 'deleted';
  commissionRate: number;
  payoutBalance: number;
  totalSales: number;
  totalOrders: number;
  rating?: number;
  registeredAt: string;
  verifiedAt?: string;
}

// -------------------- CATEGORY --------------------
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  image?: string;
  count: number;
}

// -------------------- INVOICE / VOUCHER --------------------
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled' | 'void';

export interface Invoice {
  id: string;
  number: string;
  serie: string;
  type: 'invoice' | 'receipt' | 'credit_note' | 'debit_note';
  status: InvoiceStatus;
  sellerId: string;
  customerId: string;
  orderId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  igv: number;
  currency: string;
  sunatCode?: string;
  sunatResponse?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  issuedAt: string;
  dueDate?: string;
  paidAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  taxAmount: number;
  productCode?: string;
  productId?: string;
}

// -------------------- SHIPMENT / LOGISTICS --------------------
export type ShipmentStatus = 
  | 'ASIGNADO' 
  | 'RECOGIDO' 
  | 'EN_TRÁNSITO' 
  | 'EN_DESTINO' 
  | 'ENTREGADO' 
  | 'INCIDENCIA' 
  | 'REAGENDADO';

export interface Shipment {
  id: string;
  orderId: string;
  vendorId: number;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  status: ShipmentStatus;
  previousStatus?: ShipmentStatus;
  notes?: string;
  assignedAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingUrl?: string;
  carrier?: string;
}

// -------------------- SERVICES / APPOINTMENTS --------------------
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutos
  price: number;
  category?: string;
  image?: string;
  active: boolean;
}

export interface Specialist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  bio?: string;
  services: string[]; // IDs de servicios
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface Appointment {
  id: string;
  serviceId: string;
  specialistId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

// -------------------- HELP DESK / TICKETS --------------------
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'order' | 'shipping' | 'general';

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assignedTo?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  senderName: string;
  content: string;
  attachments?: string[];
  createdAt: string;
}

// ============================================================================
// MAPA DE EXPORTACIÓN
// ============================================================================

/**
 * Utilidad para exportar todos los tipos desde un solo punto
 * Uso: import { Product, Order, Customer } from '@/lib/types/entities';
 */

// Re-exportaciones para compatibilidad hacia atrás
// Exportar desde archivos individuales cuando sea necesario

// ============================================================================
// UTILIDADES DE TIPOS
// ============================================================================

/**
 * Tipo para respuestas de API paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Tipo para respuestas de API con metadatos
 */
export interface ApiMetadata {
  requestId?: string;
  timestamp: string;
  version: string;
}

/**
 * Tipo genérico para respuestas de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata: ApiMetadata;
}
