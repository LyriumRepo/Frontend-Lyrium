// features/seller/catalog/types.ts

export type ProductSticker =
  | 'liquidacion'
  | 'oferta'
  | 'descuento'
  | 'nuevo'
  | 'bestseller'
  | 'envio_gratis'
  | 'organic'
  | 'natural'
  | 'eco'
  | 'premium'
  | 'vegan'
  | null;

export type ProductType = 'physical' | 'digital' | 'service';

// ── Formato único de atributo (alineado con backend) ─────────────────────────
// Backend espera: { values: { label: string, value: string } }
// Nutritional:    { values: { label: string, value: string, daily_value?: string } }
export interface AttributeValue {
  label: string;
  value: string;
}

export interface NutritionalAttributeValue {
  label: string;
  value: string;
  daily_value?: string | null;
}

export interface ProductAttribute {
  values: AttributeValue;
}

export interface NutritionalAttribute {
  values: NutritionalAttributeValue;
}

// ── Producto completo ─────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug?: string;
  type: ProductType;
  category: string; // slug de categoría (para enviar al backend)
  categories?: { name: string; slug: string }[]; // respuesta del backend
  price: number;
  regularPrice?: number;
  stock: number;
  description: string;
  short_description?: string | null;
  image: string; // URL activa para UI
  images?: {
    src: string;
    thumb?: string;
    medium?: string;
    large?: string;
    alt?: string;
  }[];
  sticker: ProductSticker;
  discountPercentage?: number | null;
  status?: string;

  // Physical
  weight?: number | null;
  dimensions?: string | null;
  expirationDate?: string | null;

  // Digital
  downloadUrl?: string | null;
  downloadLimit?: number | null;
  fileType?: string | null;
  fileSize?: number | null;

  // Service
  serviceDuration?: number | null;
  serviceModality?: string | null;
  serviceLocation?: string | null;

  // Atributos
  mainAttributes: ProductAttribute[];
  additionalAttributes: ProductAttribute[];
  nutritionalAttributes?: NutritionalAttribute[];
  servingNote?: string | null; // nota de porción para ficha nutricional

  createdAt?: string;
  updatedAt?: string;
}

// ── Payload que se envía al backend ──────────────────────────────────────────
export interface ProductPayload {
  type: ProductType;
  name: string;
  description: string;
  short_description?: string | null;
  price: number;
  stock: number;
  category?: string | null;
  image?: string | null;
  discountPercentage?: number | null;
  sticker?: ProductSticker;

  // Physical
  weight?: number | null;
  dimensions?: string | null;
  expirationDate?: string | null;

  // Digital
  downloadUrl?: string | null;
  downloadLimit?: number | null;
  fileType?: string | null;
  fileSize?: number | null;

  // Service
  serviceDuration?: number | null;
  serviceModality?: string | null;
  serviceLocation?: string | null;

  // Atributos — formato exacto que espera Laravel
  mainAttributes?: ProductAttribute[];
  additionalAttributes?: ProductAttribute[];
  nutritionalAttributes?: NutritionalAttribute[];
  servingNote?: string | null;
}
