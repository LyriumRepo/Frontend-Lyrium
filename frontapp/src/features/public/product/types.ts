// ─── Tipos que reflejan exactamente la respuesta del backend Laravel ───────────
// GET /api/products y GET /api/products/{id}

export interface LaravelProductImage {
    src: string;
    thumb?: string;
    medium?: string;
    large?: string;
    alt?: string;
}

export interface LaravelProductCategory {
    name: string;
    slug: string;
}

export interface LaravelProductStore {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    email: string;
    phone: string;
}

export interface LaravelProductRating {
    average: number;
    count: number;
}

export interface LaravelProductAttribute {
    values:(string | AttributeValue)[]
}
export interface AttributeValue {
    label: string;
    value: string;
}

// Producto individual (GET /api/products/{id})
export interface LaravelProduct {
    id: string;
    name: string;
    slug: string;
    type: 'physical' | 'digital' | 'service';
    description: string;
    status: 'approved' | 'pending' | 'rejected' | 'draft';
    sticker: string | null;
    price: number;
    regular_price: number;
    stock: number;
    images: LaravelProductImage[];
    categories: LaravelProductCategory[];
    store: LaravelProductStore;
    rating: LaravelProductRating;
    weight?: number;
    dimensions?: string;
    expirationDate?: string;
    mainAttributes: LaravelProductAttribute[];
    additionalAttributes: LaravelProductAttribute[];
    discount_percentage?: number;
}

// Respuesta de lista (GET /api/products)
export interface LaravelProductsResponse {
    success: boolean;
    data: LaravelProduct[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

// Respuesta de detalle (GET /api/products/{id})
export type LaravelProductDetailResponse = LaravelProduct;

// Filtros disponibles en el endpoint
export interface LaravelProductFilters {
    search?: string;
    category?: string;
    category_id?: number;
    on_sale?: boolean;
    new?: boolean;
    sticker?: string;
    inStock?: boolean;
    status?: string;
    type?: string;
    slug?: string;
    per_page?: number;
    page?: number;
}