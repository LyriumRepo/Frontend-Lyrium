import { Product } from '@/features/seller/catalog/types';
import { IProductRepository, ProductFilters, CreateProductInput, UpdateProductInput } from '../contracts/IProductRepository';

export class LaravelProductRepository implements IProductRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const baseUrl = this.getBaseUrl();

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Laravel API Error:', response.status, errorText);
            throw new Error(`Laravel API Error: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    async getProducts(filters?: ProductFilters): Promise<Product[]> {
        const params = new URLSearchParams();
        if (filters?.search) params.set('search', filters.search);
        if (filters?.category) params.set('category', filters.category);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request<Product[]>(`/products${query}`);
    }

    async getProductById(id: string): Promise<Product | null> {
        try {
            const data = await this.request<any>(`/products/${id}`);
            return {
                id: data.id?.toString() || id,
                name: data.name || '',
                category: data.categories?.[0]?.name || 'Sin categoría',
                price: parseFloat(data.price || '0'),
                stock: data.stock || 0,
                weight: data.weight,
                dimensions: data.dimensions,
                description: data.description || '',
                image: data.images?.[0]?.src || '',
                sticker: data.sticker || null,
                mainAttributes: [],
                additionalAttributes: [],
                createdAt: data.created_at || new Date().toISOString(),
            };
        } catch {
            return null;
        }
    }

    async createProduct(input: CreateProductInput): Promise<Product> {
        // No enviar imagen si es base64 (muy grande para la DB)
        const image = input.image && !input.image.startsWith('data:') ? input.image : null;
        
        return this.request<Product>('/products', {
            method: 'POST',
            body: JSON.stringify({
                type: 'physical',
                name: input.name,
                description: input.description || '',
                price: Number(input.price),
                stock: Number(input.stock) || 0,
                category: input.category || null,
                image: image,
                weight: input.weight ? Number(input.weight) : null,
                dimensions: input.dimensions || null,
                mainAttributes: input.mainAttributes || [],
                additionalAttributes: input.additionalAttributes || [],
            }),
        });
    }

    async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
        const updateData: Record<string, unknown> = {};
        
        // Always send these fields
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description ?? '';
        if (input.price !== undefined) updateData.price = Number(input.price);
        if (input.stock !== undefined) updateData.stock = Number(input.stock);
        if (input.category !== undefined) updateData.category = input.category || null;
        
        // Handle image - only send if not base64 and not empty
        if (input.image !== undefined && input.image !== null && !input.image.startsWith('data:')) {
            updateData.image = input.image;
        }
        
        if (input.discountPercentage !== undefined) updateData.discountPercentage = input.discountPercentage;
        
        // Sticker
        if (input.sticker !== undefined) updateData.sticker = input.sticker;
        
        // Physical fields
        if (input.weight !== undefined) updateData.weight = input.weight ? Number(input.weight) : null;
        if (input.dimensions !== undefined) updateData.dimensions = input.dimensions || null;
        
        // Attributes
        if (input.mainAttributes !== undefined) updateData.mainAttributes = input.mainAttributes;
        if (input.additionalAttributes !== undefined) updateData.additionalAttributes = input.additionalAttributes;

        return this.request<Product>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    async deleteProduct(id: string): Promise<boolean> {
        await this.request(`/products/${id}`, {
            method: 'DELETE',
        });
        return true;
    }

    async updateStock(id: string, quantity: number): Promise<Product> {
        return this.request<Product>(`/products/${id}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ stock_quantity: quantity }),
        });
    }

    async updateProductStatus(id: string, status: string, reason?: string): Promise<Product> {
        return this.request<Product>(`/products/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reason }),
        });
    }

    async uploadProductImage(productId: string, file: File): Promise<{ url: string }> {
        const token = await this.getToken();
        const baseUrl = this.getBaseUrl();
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${baseUrl}/products/${productId}/media`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();
        return { url: data.data?.url || '' };
    }
}
