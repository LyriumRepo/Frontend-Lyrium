export interface CartProduct {
  id: string;
  slug: string;
  titulo: string;
  imagen: string;
  precio: number;
  precioDescuento?: number;
  quantity: number;
  variant?: string;
  stock?: number;
}

export interface CartSummary {
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  itemCount: number;
}

export interface ShippingAddress {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  direccion: string;
  referencia?: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export interface BillingAddress {
  razonSocial: string;
  ruc: string;
  direccionFiscal: string;
}

export interface CheckoutData {
  items: CartProduct[];
  shipping: ShippingAddress | null;
  billing: BillingAddress | null;
  paymentMethod: 'card' | 'yape' | 'cash' | null;
}
