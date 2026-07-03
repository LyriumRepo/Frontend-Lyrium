// features/public/product/types.ts

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
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  logo_marketplace?: string | null;
  email: string | null;
  phone: string | null;
}

export interface LaravelProductRating {
  average: number;
  count: number;
}

// ── Atributos ────────────────────────────────────────────────────────────────

export interface AttributeValue {
  label: string;
  value: string;
}

export interface NutritionalRow {
  label: string;
  value: string;
  daily_value: string | null;
}

export interface NutritionalInfo {
  serving_note: string | null;
  rows: NutritionalRow[];
}

// ── Producto ─────────────────────────────────────────────────────────────────

export interface AttributeGroup {
  values: AttributeValue[];
}

export interface LaravelProduct {
  id: string;
  name: string;
  slug: string;
  type: 'physical' | 'digital' | 'service';
  description: string | null;
  short_description: string | null;
  status: 'approved' | 'pending_review' | 'rejected' | 'draft';
  sticker: string | null;
  sku: string | null;
  price: number;
  regular_price: number;
  discount_percentage: number | null;
  stock: number;
  in_stock: boolean;
  images: LaravelProductImage[];
  categories: LaravelProductCategory[];
  store: LaravelProductStore;
  rating: LaravelProductRating;
  created_at: string | null;
  updated_at: string | null;
  image?: string | null;

  // Atributos desde API (ProductResource)
  mainAttributes: AttributeGroup[];
  additionalAttributes: AttributeGroup[];

  // Alias planos (transformación opcional desde el backend)
  characteristics: AttributeValue[];
  additional_info: AttributeValue[];
  nutritional_info: NutritionalInfo | null;

  // Solo physical
  weight?: number | null;
  dimensions?: string | null;
  expirationDate?: string | null;

  // Solo digital
  downloadUrl?: string | null;
  downloadLimit?: number | null;
  fileType?: string | null;
  fileSize?: number | null;

  // Solo service
  serviceDuration?: number | null;
  serviceModality?: string | null;
  serviceLocation?: string | null;
}

// ── Respuestas de API ─────────────────────────────────────────────────────────

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

export type LaravelProductDetailResponse = LaravelProduct;

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

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ReviewUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface LaravelReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  orderId: string | null;
  user: ReviewUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface LaravelReviewsResponse {
  data: LaravelReview[];
  stats: ReviewStats;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
