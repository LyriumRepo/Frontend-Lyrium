import { Product, ProductSticker } from '@/features/seller/catalog/types';
import { IProductRepository, ProductFilters, CreateProductInput, UpdateProductInput } from '../contracts/IProductRepository';
import { API_CONFIG } from '@/shared/lib/config/api';

const wcClient = axios.create({
    baseURL: API_CONFIG.wcApiUrl,
    headers: { 'Content-Type': 'application/json' },
});

import axios from 'axios';

export class WPProductRepository implements IProductRepository {
    private getAuthHeaders() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async getProducts(filters?: ProductFilters): Promise<Product[]> {
        throw new Error('TODO Tarea 3: Conectar endpoint real de WooCommerce');
    }

    async getProductById(id: string): Promise<Product | null> {
        throw new Error('TODO Tarea 3: Conectar endpoint real');
    }

    async createProduct(input: CreateProductInput): Promise<Product> {
        throw new Error('TODO Tarea 3: Conectar endpoint real');
    }

    async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
        throw new Error('TODO Tarea 3: Conectar endpoint real');
    }

    async deleteProduct(id: string): Promise<boolean> {
        throw new Error('TODO Tarea 3: Conectar endpoint real');
    }

    async updateStock(id: string, quantity: number): Promise<Product> {
        throw new Error('TODO Tarea 3: Conectar endpoint real');
    }

    async updateProductStatus(id: string, status: string, reason?: string): Promise<Product> {
        throw new Error('TODO Tarea 3: Conectar endpoint real');
    }

    async uploadProductImage(productId: string, file: File): Promise<{ url: string }> {
        throw new Error('Not implemented for WooCommerce');
    }
}
