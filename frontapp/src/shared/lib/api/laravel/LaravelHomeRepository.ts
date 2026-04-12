import { IHomeRepository } from '../contracts/IHomeRepository';
import { Banner, Categoria, Producto, Marca, Beneficio, BannersPub } from '@/types/public';

export interface HomeSection {
    category: {
        id: number;
        name: string;
        slug: string;
    };
    banner: {
        imagen: string;
        enlace: string;
    };
    products: Producto[];
}

export class LaravelHomeRepository implements IHomeRepository {
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
        });

        if (!response.ok) {
            throw new Error(`Laravel API Error: ${response.status}`);
        }

        return response.json();
    }

    async getBannersPub(): Promise<BannersPub> {
        try {
            const response = await fetch(`${this.getBaseUrl()}/home/banners-pub`);
            const json = await response.json();
            
            const data = json.success !== undefined && json.data !== undefined ? json.data : json;
            const baseUrl = this.getBaseUrl().replace('/api', '');
            
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            const transformSlides = (slides: any): { id: number; imagenes: string[] }[] => {
                if (!slides || !Array.isArray(slides)) return [];
                return slides.map((slide: any) => ({
                    id: slide.id || 0,
                    imagenes: Array.isArray(slide.imagenes) 
                        ? slide.imagenes.map((img: string) => transformUrl(img))
                        : [],
                }));
            };

            const transformImages = (arr: any): string[] => {
                if (!arr || !Array.isArray(arr)) return [];
                return arr.map((url: string) => transformUrl(url));
            };

            return {
                slider1: transformSlides(data?.slider1),
                sliderMedianos1: transformSlides(data?.sliderMedianos1),
                pequenos1: transformImages(data?.pequenos1),
                sliderMedianos2: transformSlides(data?.sliderMedianos2),
                pequenos2: transformImages(data?.pequenos2),
            };
        } catch {
            return {
                slider1: [],
                sliderMedianos1: [],
                pequenos1: [],
                sliderMedianos2: [],
                pequenos2: [],
            };
        }
    }

    async getCategories(): Promise<Categoria[]> {
        try {
            const response = await this.request<any>('/categories');
            const categories = response.data || response;
            
            const baseUrl = this.getBaseUrl().replace('/api', '');
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '/img/no-image.png';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            return categories.map((cat: any) => ({
                id: cat.id,
                nombre: cat.name?.toUpperCase() || '',
                imagen: transformUrl(cat.image?.src),
                descripcion: cat.description || '',
                slug: cat.slug,
            }));
        } catch {
            return [];
        }
    }

    async getBenefits(): Promise<Beneficio[]> {
        try {
            const response = await this.request<any>('/benefits');
            const data = response.data || response;
            const benefits = Array.isArray(data) ? data : [];
            
            return benefits.map((b: any) => ({
                id: b.id,
                icono: b.icono || b.icon || 'heart',
                titulo: b.titulo || b.title || '',
                descripcion: b.descripcion || b.description || '',
            }));
        } catch {
            return [];
        }
    }

    async getProducts(perPage: number = 20): Promise<Producto[]> {
        const products = await this.request<any[]>(`/products?per_page=${perPage}`);
        return products.map(prod => ({
            id: prod.id,
            titulo: prod.name,
            precio: parseFloat(prod.price || prod.regular_price || '0'),
            imagen: prod.images?.[0]?.src || '/img/no-image.png',
            categoria: prod.categories?.[0]?.name || '',
            slug: prod.slug,
            descripcion: prod.short_description || prod.description,
            enlace: `/producto/${prod.slug}`,
        }));
    }

    async getProductsByCategory(categoryId: number, perPage: number = 20): Promise<Producto[]> {
        const products = await this.request<any[]>(`/products?category=${categoryId}&per_page=${perPage}`);
        return products.map(prod => ({
            id: prod.id,
            titulo: prod.name,
            precio: parseFloat(prod.price || prod.regular_price || '0'),
            imagen: prod.images?.[0]?.src || '/img/no-image.png',
            categoria: prod.categories?.[0]?.name || '',
            slug: prod.slug,
            descripcion: prod.short_description || prod.description,
            enlace: `/producto/${prod.slug}`,
        }));
    }

    async getProductBySlug(slug: string): Promise<Producto | null> {
        try {
            const products = await this.request<any[]>(`/products?slug=${encodeURIComponent(slug)}`);
            if (!products || products.length === 0) return null;
            
            const prod = products[0];
            return {
                id: prod.id,
                titulo: prod.name,
                precio: parseFloat(prod.price || prod.regular_price || '0'),
                imagen: prod.images?.[0]?.src || '/img/no-image.png',
                categoria: prod.categories?.[0]?.name || '',
                slug: prod.slug,
                descripcion: prod.short_description || prod.description,
                enlace: `/producto/${prod.slug}`,
            };
        } catch {
            return null;
        }
    }

    async getCategoryBySlug(slug: string): Promise<Categoria | null> {
        try {
            const categories = await this.request<any[]>(`/categories?slug=${encodeURIComponent(slug)}`);
            if (!categories || categories.length === 0) return null;
            
            const cat = categories[0];
            return {
                id: cat.id,
                nombre: cat.name?.toUpperCase() || '',
                imagen: cat.image?.src || '/img/no-image.png',
                descripcion: cat.description || '',
                slug: cat.slug,
            };
        } catch {
            return null;
        }
    }

    async getHomeSection(slug: string): Promise<HomeSection | null> {
        try {
            const response = await fetch(`${this.getBaseUrl()}/home/section/${encodeURIComponent(slug)}`);
            const json = await response.json();
            
            if (!response.ok || json.success === false) {
                return null;
            }

            const data = json.data;
            const baseUrl = this.getBaseUrl().replace('/api', '');

            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            const mapProduct = (prod: any): Producto => ({
                id: prod.id,
                titulo: prod.name,
                precio: parseFloat(prod.price || '0'),
                imagen: transformUrl(prod.images?.[0]?.src),
                slug: prod.slug,
                tag: prod.sticker,
                vendedor: prod.storeName ? { slug: '', nombre: prod.storeName } : undefined,
                estrellas: prod.ratingPromedio ? '★'.repeat(Math.floor(prod.ratingPromedio)) : undefined,
                reviews: prod.ratingCount,
            });

            return {
                category: {
                    id: data.category?.id || 0,
                    name: data.category?.name || '',
                    slug: data.category?.slug || '',
                },
                banner: {
                    imagen: transformUrl(data.banner?.imagen),
                    enlace: data.banner?.enlace || '#',
                },
                products: Array.isArray(data.products) ? data.products.map(mapProduct) : [],
            };
        } catch {
            return null;
        }
    }

    async getHeroes(): Promise<Banner[]> {
        try {
            const response = await this.request<any>('/home/heroes');
            const baseUrl = this.getBaseUrl().replace('/api', '');
            
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            // El backend retorna { success: true, data: [...], meta: {...} }
            const data = response.data || response;
            const heroes = Array.isArray(data) ? data : [];

            return heroes.map((h: any) => ({
                id: h.id || 0,
                titulo: h.titulo || h.title || '',
                descripcion: h.descripcion || h.description || '',
                imagen: transformUrl(h.images?.desktop || h.imagenes?.[0]),
                imagenMobile: transformUrl(h.images?.mobile || h.imagenes?.[1]),
            }));
        } catch {
            return [];
        }
    }

    async getServiceCategories(): Promise<Categoria[]> {
        try {
            const response = await this.request<any>('/categories?type=service');
            const baseUrl = this.getBaseUrl().replace('/api', '');
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '/img/no-image.png';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };
            
            // El backend retorna { success: true, data: [...], meta: {...} }
            const data = response.data || response;
            const categories = Array.isArray(data) ? data : [];
            
            return categories
                .map((cat: any) => ({
                    id: cat.id,
                    nombre: cat.name?.toUpperCase() || '',
                    imagen: transformUrl(cat.image?.src),
                    descripcion: cat.description || '',
                    slug: cat.slug,
                }));
        } catch {
            return [];
        }
    }

    async getBrands(): Promise<Marca[]> {
        try {
            const response = await this.request<any>('/brands');
            const data = response.data || response;
            const brands = Array.isArray(data) ? data : [];
            
            const baseUrl = this.getBaseUrl().replace('/api', '');
            
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            return brands.map((b: any) => ({
                id: b.id,
                nombre: b.nombre || b.name || '',
                logo: transformUrl(b.logo),
            }));
        } catch {
            return [];
        }
    }

    async getOnSaleProducts(perPage: number = 12, type?: 'physical' | 'digital' | 'service'): Promise<Producto[]> {
        try {
            const typeParam = type ? `&type=${type}` : '';
            const response = await this.request<any>(`/products?on_sale=true&per_page=${perPage}${typeParam}`);
            const products = response.data || response;
            
            const baseUrl = this.getBaseUrl().replace('/api', '');
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            return products.map((prod: any) => ({
                id: prod.id,
                titulo: prod.name,
                precio: parseFloat(prod.sale_price || prod.price || '0'),
                imagen: transformUrl(prod.images?.[0]?.src),
                slug: prod.slug,
                tag: prod.sticker,
                estrellas: prod.ratingPromedio ? '★'.repeat(Math.floor(prod.ratingPromedio)) : undefined,
                reviews: prod.ratingCount,
                precioOferta: prod.sale_price ? parseFloat(prod.sale_price) : undefined,
                precioAnterior: prod.sale_price ? parseFloat(prod.regular_price || prod.price) : undefined,
                vendedor: prod.storeName ? { slug: prod.storeSlug || '', nombre: prod.storeName } : undefined,
                categorias: prod.categories?.map((c: any) => c.name) || [],
            }));
        } catch {
            return [];
        }
    }

    async getNewProducts(perPage: number = 12): Promise<Producto[]> {
        try {
            const response = await this.request<any>(`/products?sticker=nuevo&per_page=${perPage}`);
            const products = response.data || response;
            
            const baseUrl = this.getBaseUrl().replace('/api', '');
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            return products.map((prod: any) => ({
                id: prod.id,
                titulo: prod.name,
                precio: parseFloat(prod.price || '0'),
                imagen: transformUrl(prod.images?.[0]?.src),
                slug: prod.slug,
                tag: prod.sticker,
                estrellas: prod.ratingPromedio ? '★'.repeat(Math.floor(prod.ratingPromedio)) : undefined,
                reviews: prod.ratingCount,
                vendedor: prod.storeName ? { slug: prod.storeSlug || '', nombre: prod.storeName } : undefined,
            }));
        } catch {
            return [];
        }
    }

    async subscribeNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${this.getBaseUrl()}/newsletter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            return {
                success: data.success !== false,
                message: data.message || data.error || 'Suscripción exitosa',
            };
        } catch {
            return { success: false, message: 'Error de conexión' };
        }
    }

    async searchProducts(query: string, limit: number = 10): Promise<any[]> {
        try {
            const response = await this.request<any>(`/products?search=${encodeURIComponent(query)}&per_page=${limit}`);
            const products = response.data || response;
            
            const baseUrl = this.getBaseUrl().replace('/api', '');
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            return products.map((prod: any) => ({
                id: prod.id,
                name: prod.name,
                price: parseFloat(prod.price || '0'),
                regular_price: parseFloat(prod.regular_price || '0'),
                images: prod.images || [],
                slug: prod.slug,
                categories: prod.categories || [],
            }));
        } catch {
            return [];
        }
    }

    async searchCategories(query: string, limit: number = 10): Promise<any[]> {
        try {
            const response = await this.request<any>(`/categories?search=${encodeURIComponent(query)}&per_page=${limit}`);
            const categories = response.data || response;
            
            const baseUrl = this.getBaseUrl().replace('/api', '');
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            return categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name || cat.nombre,
                slug: cat.slug,
                image: cat.image || { src: '/img/no-image.png' },
                description: cat.description || '',
            }));
        } catch {
            return [];
        }
    }

    async getProductsByCategorySlug(slug: string, limit: number = 10): Promise<any[]> {
        try {
            const response = await this.request<any>(`/products?category=${encodeURIComponent(slug)}&per_page=${limit}`);
            const products = response.data || response;
            
            const baseUrl = this.getBaseUrl().replace('/api', '');
            const transformUrl = (url: string | undefined): string => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${baseUrl}${url}`;
            };

            return products.map((prod: any) => ({
                id: prod.id,
                name: prod.name,
                price: parseFloat(prod.price || '0'),
                regular_price: parseFloat(prod.regular_price || '0'),
                images: prod.images || [],
                slug: prod.slug,
                categories: prod.categories || [],
            }));
        } catch {
            return [];
        }
    }
}
