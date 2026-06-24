// features/seller/catalog/types.ts

export type ProductSticker =
  | 'liquidacion'
  | 'oferta'
  | 'descuento'
  | 'nuevo'
  | 'bestseller'
  | 'envio_gratis'
  | null;

export type ProductType = 'physical' | 'digital' | 'service';

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
  name?: string;
  values: string[];
}

export interface NutritionalAttribute {
  values: NutritionalAttributeValue;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  discountPercentage?: number;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string | null;
  type: ProductType;
  category: string;
  categories?: { name: string; slug: string }[];
  price: number;
  regularPrice?: number;
  stock: number;
  description: string;
  short_description?: string | null;
  image: string;
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
  weight?: number | null;
  dimensions?: string | null;
  expirationDate?: string | null;
  downloadUrl?: string | null;
  downloadLimit?: number | null;
  fileType?: string | null;
  fileSize?: number | null;
  serviceDuration?: number | null;
  serviceModality?: string | null;
  serviceLocation?: string | null;
  mainAttributes: ProductAttribute[];
  additionalAttributes: ProductAttribute[];
  nutritionalAttributes?: NutritionalAttribute[];
  servingNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

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
  weight?: number | null;
  dimensions?: string | null;
  expirationDate?: string | null;
  downloadUrl?: string | null;
  downloadLimit?: number | null;
  fileType?: string | null;
  fileSize?: number | null;
  serviceDuration?: number | null;
  serviceModality?: string | null;
  serviceLocation?: string | null;
  mainAttributes?: ProductAttribute[];
  additionalAttributes?: ProductAttribute[];
  nutritionalAttributes?: NutritionalAttribute[];
  servingNote?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  images?: string[];
  mainAttributes?: { values: Record<string, string> }[];
  additionalAttributes?: { values: Record<string, string> }[];
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  mainAttributes?: { values: Record<string, string> }[];
  additionalAttributes?: { values: Record<string, string> }[];
}

export interface EtiquetaDescuentoData { valor: number; inicio: string; fin: string | null; }
export interface EtiquetaOfertaData    { valor: number; inicio: string; fin: string; }
export interface EtiquetaEdicionData   { inicio: string; fin: string; }
export interface EtiquetaPromocionData { productosIds: string[]; }
export interface EtiquetaConfig {
  nuevo: boolean;
  descuento?:      EtiquetaDescuentoData;
  oferta?:         EtiquetaOfertaData;
  edicionLimitada?: EtiquetaEdicionData;
  promocion?:      EtiquetaPromocionData;
}

export function etiquetasFromProduct(product: Product): EtiquetaConfig {
  const stored = (product as any).etiquetas;
  if (stored) return stored;

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  switch (product.sticker) {
    case 'nuevo':
      return { nuevo: true };
    case 'descuento':
      return { nuevo: false, descuento: { valor: product.discountPercentage ?? 20, inicio: today, fin: null } };
    case 'oferta':
      return { nuevo: false, oferta: { valor: product.discountPercentage ?? 30, inicio: today, fin: nextMonthStr } };
    case 'liquidacion':
      return { nuevo: false, edicionLimitada: { inicio: today, fin: nextMonthStr } };
    default:
      return { nuevo: false };
  }
}
