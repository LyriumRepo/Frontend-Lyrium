import { z } from 'zod';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADAPTER: WooCommerce REST API -> App Types
 * 
 * Graceful Degradation Strategy:
 * - Si un campo opcional falla la validación → valor por defecto seguro
 * - Nunca devuelve null para campos críticos → siempre hay fallback
 * - Registra errores pero no lanza excepciones
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Schema flexible para aceptar cualquier forma de datos de WP
const WPProductSchema = z.object({
  id: z.union([z.string(), z.number()]).default(0),
  name: z.union([z.string(), z.null()]).default('Producto sin nombre'),
  price: z.union([z.string(), z.number(), z.null()]).default(0),
  regular_price: z.union([z.string(), z.number(), z.null()]).optional(),
  sale_price: z.union([z.string(), z.number(), z.null()]).optional(),
  stock_quantity: z.union([z.string(), z.number(), z.null()]).default(0),
  stock_status: z.union([z.string(), z.null()]).default('outofstock'),
  weight: z.union([z.string(), z.number(), z.null()]).optional(),
  dimensions: z
    .object({
      length: z.union([z.string(), z.number(), z.null()]).default(0),
      width: z.union([z.string(), z.number(), z.null()]).default(0),
      height: z.union([z.string(), z.number(), z.null()]).default(0),
    })
    .optional(),
  description: z.union([z.string(), z.null()]).default(''),
  images: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        src: z.string().url().or(z.string()).default('/placeholder.png'),
        alt: z.union([z.string(), z.null()]).optional(),
      })
    )
    .default([]),
  categories: z
    .array(
      z.union([
        z.number(),
        z.object({ id: z.number(), name: z.string() }),
        z.object({ id: z.number(), name: z.string(), slug: z.string() }),
        z.unknown(),
      ])
    )
    .default([]),
  attributes: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        name: z.union([z.string(), z.null()]).optional(),
        options: z.array(z.unknown()).default([]),
        visible: z.union([z.boolean(), z.string()]).optional(),
      })
    )
    .default([]),
  meta_data: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        key: z.string(),
        value: z.unknown(),
      })
    )
    .default([]),
  date_created: z.union([z.string(), z.null()]).optional(),
});

type WPProductRaw = z.infer<typeof WPProductSchema>;

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
  mainAttributes: { values: string[] }[];
  additionalAttributes: { values: string[] }[];
  createdAt: string;
}

/**
 * Transforma datos crudos de WP a tipo App
 * Graceful: si falla algo, usa defaults seguros
 */
function transformToProduct(raw: WPProductRaw): Product {
  // Extraer sticker de meta_data
  let sticker: ProductSticker = null;
  try {
    const stickerMeta = raw.meta_data?.find((m) => m.key === 'sticker');
    if (stickerMeta?.value) {
      const validStickers = ['liquidacion', 'oferta', 'descuento', 'nuevo', 'bestseller', 'envio_gratis'];
      const val = String(stickerMeta.value);
      if (validStickers.includes(val)) {
        sticker = val as ProductSticker;
      }
    }
  } catch {
    // Graceful: si falla, queda null
    sticker = null;
  }

  // Extraer categoría
  let category = 'Sin categoría';
  try {
    if (raw.categories && raw.categories.length > 0) {
      const first = raw.categories[0];
      if (typeof first === 'number') {
        category = `Cat-${first}`;
      } else if (first && typeof first === 'object' && 'name' in first) {
        category = (first as { name: string }).name;
      }
    }
  } catch {
    // Graceful: default
    category = 'Sin categoría';
  }

  // Calcular descuento
  let discountPercentage: number | undefined;
  try {
    const price = Number(raw.price) || 0;
    const salePrice = raw.sale_price ? Number(raw.sale_price) : 0;
    if (salePrice > 0 && salePrice < price) {
      discountPercentage = Math.round(((price - salePrice) / price) * 100);
    }
  } catch {
    // Graceful: sin descuento
    discountPercentage = undefined;
  }

  // Dimensiones
  let dimensions: string | undefined;
  try {
    if (raw.dimensions) {
      const d = raw.dimensions;
      dimensions = `${d.length}x${d.width}x${d.height}`;
    }
  } catch {
    dimensions = undefined;
  }

  // Stock
  let stock = 0;
  try {
    const qty = raw.stock_quantity;
    stock = typeof qty === 'number' ? qty : typeof qty === 'string' ? Number(qty) || 0 : 0;
    if (raw.stock_status === 'instock' && stock === 0) {
      stock = 999; // Graceful: si dice instock pero sin quantity, asumir stock
    }
  } catch {
    stock = 0;
  }

  // Imagen
  let image = '/placeholder.png';
  try {
    if (raw.images && raw.images.length > 0) {
      const firstImg = raw.images[0];
      image = firstImg.src || '/placeholder.png';
    }
  } catch {
    image = '/placeholder.png';
  }

  // Atributos
  let mainAttributes: { values: string[] }[] = [];
  let additionalAttributes: { values: string[] }[] = [];
  try {
    mainAttributes = raw.attributes
      ?.filter((a) => a.visible)
      ?.map((a) => ({
        values: Array.isArray(a.options) ? a.options.map(String) : [],
      })) ?? [];
    additionalAttributes = raw.attributes
      ?.filter((a) => !a.visible)
      ?.map((a) => ({
        values: Array.isArray(a.options) ? a.options.map(String) : [],
      })) ?? [];
  } catch {
    mainAttributes = [];
    additionalAttributes = [];
  }

  return {
    id: String(raw.id || 0),
    name: raw.name ?? 'Producto sin nombre',
    category,
    price: Number(raw.price) || 0,
    stock,
    weight: raw.weight ? Number(raw.weight) : undefined,
    dimensions,
    description: raw.description ?? '',
    image,
    sticker,
    discountPercentage,
    mainAttributes,
    additionalAttributes,
    createdAt: raw.date_created ?? new Date().toISOString(),
  };
}

/**
 * Parsea un producto individual
 * @returns Product o null si el parseo falla completamente
 */
export function parseWPProduct(raw: unknown): Product | null {
  if (!raw) {
    return getDefaultProduct();
  }

  const result = WPProductSchema.safeParse(raw);
  
  if (!result.success) {
    // Loguear solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('WP Product Parse Warning:', result.error.flatten().fieldErrors);
    }
    
    // Graceful Degradation: intentar extraer lo que se pueda
    return extractPartialProduct(raw);
  }
  
  return transformToProduct(result.data);
}

/**
 * Parsea un array de productos
 * @returns array de Products (nunca null, puede estar vacío)
 */
export function parseWPProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  
  const products = raw
    .map(parseWPProduct)
    .filter((p): p is Product => p !== null);
  
  return products;
}

/**
 * Graceful Degradation: intenta extraer datos mínimos de un objeto malformado
 */
function extractPartialProduct(raw: unknown): Product {
  if (!raw || typeof raw !== 'object') {
    return getDefaultProduct();
  }

  const obj = raw as Record<string, unknown>;

  return {
    id: String(obj.id ?? 0),
    name: obj.name ? String(obj.name) : 'Producto sin nombre',
    category: 'Sin categoría',
    price: Number(obj.price) || 0,
    stock: Number(obj.stock_quantity) || 0,
    description: obj.description ? String(obj.description) : '',
    image: '/placeholder.png',
    sticker: null,
    mainAttributes: [],
    additionalAttributes: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Producto por defecto (fallback seguro)
 */
function getDefaultProduct(): Product {
  return {
    id: '0',
    name: 'Producto no disponible',
    category: 'Sin categoría',
    price: 0,
    stock: 0,
    description: '',
    image: '/placeholder.png',
    sticker: null,
    mainAttributes: [],
    additionalAttributes: [],
    createdAt: new Date().toISOString(),
  };
}
