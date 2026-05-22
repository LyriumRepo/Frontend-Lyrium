import { Product } from '@/features/seller/catalog/types';
import { IProductRepository, ProductFilters, CreateProductInput, UpdateProductInput } from '../contracts/IProductRepository';

export class LaravelProductRepository implements IProductRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    
    // ✅ FIX: La cookie es httpOnly — solo es accesible desde el servidor.
    // Siempre usar next/headers, nunca document.cookie.
    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();

        return {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private async getToken(): Promise<string | null> {
        // CLIENTE
        if (typeof window !== 'undefined') {

            return localStorage.getItem('laravel_token');
        }

        // SERVIDOR
        try {
            const { cookies } = await import('next/headers');

            const cookieStore = await cookies();

            return cookieStore.get('laravel_token')?.value ?? null;

        } catch {

            return null;
        }
    }


    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const baseUrl = this.getBaseUrl();
        const authHeaders = await this.getAuthHeaders();
        

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers,
            },
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
                type: data.type || '',
                category: data.categories?.[0]?.slug || '',
                price: parseFloat(data.price || '0'),
                stock: data.stock || 0,
                weight: data.weight,
                dimensions: data.dimensions,
                description: data.description || '',
                image: data.images?.[0]?.src || '',
                sticker: data.sticker || null,
                mainAttributes: data.mainAttributes || [],
                additionalAttributes: data.additionalAttributes || [],
                createdAt: data.created_at || new Date().toISOString(),
            };
        } catch {
            return null;
        }
    }

    async createProduct(input: CreateProductInput): Promise<Product> {
        const image = input.image && !input.image.startsWith('data:') ? input.image : null;

        // Limpiar mainAttributes cuidando que values es un Record<string, string>
        const cleanMainAttributes = (input.mainAttributes || [])
            .map(attr => {
                // Convertimos el objeto values { key: value } en un array de [key, value]
                const filteredEntries = Object.entries(attr.values || {})
                    .filter(([_, value]) => value && value.trim() !== '');

                return {
                    ...attr,
                    // Volvemos a transformar el array filtrado en un objeto Record
                    values: Object.fromEntries(filteredEntries)
                };
            })
            // Opcional: Eliminamos el atributo por completo si su objeto values quedó vacío
            .filter(attr => Object.keys(attr.values).length > 0);

        // Limpiar additionalAttributes cuidando que values es un Record<string, string>
        const cleanAdditionalAttributes = (input.additionalAttributes || [])
            .map(attr => {
                const filteredEntries = Object.entries(attr.values || {})
                    .filter(([_, value]) => value && value.trim() !== '');

                return {
                    ...attr,
                    values: Object.fromEntries(filteredEntries)
                };
            })
            .filter(attr => Object.keys(attr.values).length > 0);

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
                mainAttributes: cleanMainAttributes,
                additionalAttributes: cleanAdditionalAttributes,
            }),
        });
    }

    async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
        const updateData: Record<string, unknown> = {};

        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description ?? '';
        if (input.price !== undefined) updateData.price = Number(input.price);
        if (input.stock !== undefined) updateData.stock = Number(input.stock);
        if (input.category !== undefined) updateData.category = input.category || null;

        if (input.image !== undefined && input.image !== null && !input.image.startsWith('data:')) {
            updateData.image = input.image;
        }

        if (input.discountPercentage !== undefined) updateData.discountPercentage = input.discountPercentage;
        if (input.sticker !== undefined) updateData.sticker = input.sticker;
        if (input.weight !== undefined) updateData.weight = input.weight ? Number(input.weight) : null;
        if (input.dimensions !== undefined) updateData.dimensions = input.dimensions || null;
        if (input.mainAttributes !== undefined) updateData.mainAttributes = input.mainAttributes;
        if (input.additionalAttributes !== undefined) updateData.additionalAttributes = input.additionalAttributes;

        return this.request<Product>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    async deleteProduct(id: string): Promise<boolean> {
        await this.request(`/products/${id}`, { method: 'DELETE' });
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
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();
        return { url: data.data?.url || '' };
    }
}