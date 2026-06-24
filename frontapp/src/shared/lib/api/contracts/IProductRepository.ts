// shared/lib/contracts/IProductRepository.ts

import { Product, ProductSticker } from '@/features/seller/catalog/types';

export interface ProductFilters {
  category?: string;
  search?: string;
  sticker?: ProductSticker;
  inStock?: boolean;
}

export interface CreateProductInput {
  name: string;
  type?: 'physical' | 'digital' | 'service';
  category: string;
  price: number;
  stock: number;
  description: string;
  short_description?: string | null;
  image?: string | null;
  weight?: number;
  dimensions?: string;
  expirationDate?: string;
  discountPercentage?: number;
  // Atributos
  mainAttributes?: { values: Record<string, string> }[];
  additionalAttributes?: { values: Record<string, string> }[];
  nutritionalAttributes?: { values: Record<string, string> }[];
  servingNote?: string;
}

export interface UpdateProductInput {
  name?: string;
  type?: 'physical' | 'digital' | 'service';
  category?: string;
  price?: number;
  stock?: number;
  description?: string;
  short_description?: string | null;
  image?: string | null;
  sticker?: ProductSticker;
  discountPercentage?: number;
  weight?: number;
  dimensions?: string;
  expirationDate?: string;
  // Atributos
  mainAttributes?: { values: Record<string, string> }[];
  additionalAttributes?: { values: Record<string, string> }[];
  nutritionalAttributes?: { values: Record<string, string> }[];
  servingNote?: string;
}

export interface IProductRepository {
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(input: CreateProductInput): Promise<Product>;
  updateProduct(id: string, input: UpdateProductInput): Promise<Product>;
  updateProductStatus(
    id: string,
    status: string,
    reason?: string,
  ): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  updateStock(id: string, quantity: number): Promise<Product>;
  uploadProductImage(productId: string, file: File): Promise<{ url: string }>;
}
