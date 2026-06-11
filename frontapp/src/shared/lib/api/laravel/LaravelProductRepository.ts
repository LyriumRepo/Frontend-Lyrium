import { Product } from '@/features/seller/catalog/types';
import { IProductRepository, ProductFilters, CreateProductInput, UpdateProductInput } from '../contracts/IProductRepository';

export class LaravelProductRepository implements IProductRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();

        return {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private async getToken(): Promise<string | null> {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('laravel_token');
        }

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

    private toProduct(raw: any): Product {
        const data = raw.data ?? raw;

        return {
            id: String(data.id ?? ''),
            name: data.name ?? '',
            slug: data.slug ?? '',
            sku: data.sku ?? null,
            type: data.type ?? 'physical',
            description: data.description ?? '',
            short_description: data.short_description ?? null,
            price: parseFloat(data.price ?? '0'),
            regularPrice: parseFloat(data.regular_price ?? data.price ?? '0'),
            stock: parseInt(data.stock ?? '0', 10),
            status: data.status ?? 'draft',
            sticker: data.sticker ?? null,
            discountPercentage: data.discount_percentage ? parseFloat(data.discount_percentage) : null,

            image: data.images?.[0]?.src ?? '',
            images: data.images ?? [],

            category: data.categories?.[0]?.slug ?? '',
            categories: data.categories ?? [],

            weight: data.weight ?? null,
            dimensions: data.dimensions ?? null,
            expirationDate: data.expirationDate ?? null,

            downloadUrl: data.downloadUrl ?? null,
            downloadLimit: data.downloadLimit ?? null,
            fileType: data.fileType ?? null,
            fileSize: data.fileSize ?? null,

            serviceDuration: data.serviceDuration ?? null,
            serviceModality: data.serviceModality ?? null,
            serviceLocation: data.serviceLocation ?? null,

            mainAttributes: (data.characteristics ?? []).map((c: any) => ({
                values: [c.label ?? '', c.value ?? ''],
            })),
            additionalAttributes: (data.additional_info ?? []).map((c: any) => ({
                values: [c.label ?? '', c.value ?? ''],
            })),

            nutritionalAttributes: (data.nutritional_info?.rows ?? []).map((r: any) => ({
                values: { label: r.label ?? '', value: r.value ?? '', daily_value: r.daily_value ?? null },
            })),
            servingNote: data.nutritional_info?.serving_note ?? null,

            createdAt: data.created_at ?? new Date().toISOString(),
            updatedAt: data.updated_at ?? new Date().toISOString(),
        };
    }

    async getProducts(filters?: ProductFilters): Promise<Product[]> {
        const params = new URLSearchParams();
        params.set('per_page', '100');
        if (filters?.search) params.set('search', filters.search);
        if (filters?.category) params.set('category', filters.category);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await this.request<any>(`/products${query}`);
        const items = res.data ?? res ?? [];
        return (Array.isArray(items) ? items : []).map((item: any) => this.toProduct(item));
    }

    async getProductById(id: string): Promise<Product | null> {
        try {
            const res = await this.request<any>(`/products/${id}`);
            return this.toProduct(res);
        } catch {
            return null;
        }
    }

    async createProduct(input: CreateProductInput): Promise<Product> {
        // No enviar imagen si es base64 (muy grande para la DB)
        const image = input.image && !input.image.startsWith('data:') ? input.image : null;

        const cleanMainAttributes = (input.mainAttributes || [])
            .map(attr => {
                const filteredEntries = Object.entries(attr.values || {})
                    .filter(([_, value]) => value && value.trim() !== '');
                return {
                    ...attr,
                    values: Object.fromEntries(filteredEntries),
                };
            })
            .filter(attr => Object.keys(attr.values).length > 0);

        const cleanAdditionalAttributes = (input.additionalAttributes || [])
            .map(attr => {
                const filteredEntries = Object.entries(attr.values || {})
                    .filter(([_, value]) => value && value.trim() !== '');
                return {
                    ...attr,
                    values: Object.fromEntries(filteredEntries),
                };
            })
            .filter(attr => Object.keys(attr.values).length > 0);

        const cleanNutritionalAttributes = (input.nutritionalAttributes || [])
            .map(attr => {
                const filteredEntries = Object.entries(attr.values || {})
                    .filter(([_, value]) => value && value.trim() !== '');
                return {
                    ...attr,
                    values: Object.fromEntries(filteredEntries),
                };
            })
            .filter(attr => Object.keys(attr.values).length > 0);

        const payload: Record<string, unknown> = {
            type: input.type || 'physical',
            name: input.name,
            description: input.description || '',
            short_description: input.short_description || null,
            price: Number(input.price),
            stock: Number(input.stock) || 0,
            category: input.category || null,
            image: image,
            sticker: (input as any).sticker || null,
            discountPercentage: (input as any).discountPercentage ?? null,
            weight: input.weight ? Number(input.weight) : null,
            dimensions: input.dimensions || null,
            mainAttributes: cleanMainAttributes,
            additionalAttributes: cleanAdditionalAttributes,
        };

        if (cleanNutritionalAttributes.length > 0) {
            payload.nutritionalAttributes = cleanNutritionalAttributes;
            payload.servingNote = (input as any).servingNote || null;
        }

        if (input.expirationDate) payload.expirationDate = input.expirationDate;

        const res = await this.request<any>('/products', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return this.toProduct(res);
    }

    async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
        const updateData: Record<string, unknown> = {};
        
        // Always send these fields
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description ?? '';
        if (input.price !== undefined) updateData.price = Number(input.price);
        if (input.stock !== undefined) updateData.stock = Number(input.stock);
        if (input.category !== undefined) updateData.category = input.category || null;
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
        if (input.servingNote !== undefined) updateData.servingNote = input.servingNote;
        if (input.nutritionalAttributes !== undefined) updateData.nutritionalAttributes = input.nutritionalAttributes;
        if (input.type !== undefined) updateData.type = input.type;
        if (input.short_description !== undefined) updateData.short_description = input.short_description;

        const res = await this.request<any>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });

        return this.toProduct(res);
    }

    async deleteProduct(id: string): Promise<boolean> {
        await this.request(`/products/${id}`, {
            method: 'DELETE',
        });
        return true;
    }

    async updateStock(id: string, quantity: number): Promise<Product> {
        const res = await this.request<any>(`/products/${id}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ stock_quantity: quantity }),
        });
        return this.toProduct(res);
    }

    async updateProductStatus(id: string, status: string, reason?: string): Promise<Product> {
        const res = await this.request<any>(`/products/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reason }),
        });
        return this.toProduct(res);
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
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();
        return { url: data.data?.url || '' };
    }
}
