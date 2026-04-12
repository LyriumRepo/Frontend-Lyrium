import { IHomeRepository } from '../contracts/IHomeRepository';
import { BannersPub, BannerSlide, Categoria, Producto } from '@/types/public';
import { homeData } from '@/data/homeData';

interface WooCategory {
    id: number;
    name: string;
    description: string;
    slug: string;
    image?: { src: string };
}

interface WooProduct {
    id: number;
    name: string;
    price: string;
    regular_price: string;
    images?: { src: string }[];
    categories?: { name: string }[];
    slug: string;
    short_description: string;
    description: string;
}

const WC_KEY = process.env.NEXT_PUBLIC_WP_CS_KEY || '';
const WC_SECRET = process.env.NEXT_PUBLIC_WP_CS_SECRET || '';

function buildWooAuthParams(): string {
    return `consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
}

export class WPHomeRepository implements IHomeRepository {
    private getWooBaseUrl(): string {
        return process.env.NEXT_PUBLIC_WC_API_URL ?? 'https://lyriumbiomarketplace.com/wp-json/wc/v3';
    }

    async getBannersPub(): Promise<BannersPub> {
        const baseUrl = process.env.NEXT_PUBLIC_WP_API_URL ?? 'https://lyriumbiomarketplace.com/wp-json';

        // 1. Intentar /wp/v2/media?include=... (endpoint real de banners)
        try {
            const res = await fetch(
                `${baseUrl}/wp/v2/media?include=85437,85436,85435,85209,85611,85612&orderby=include`,
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (res.ok) {
                const mediaItems = await res.json();
                
                if (Array.isArray(mediaItems) && mediaItems.length > 0) {
                    const imageUrls = mediaItems.map((item: { source_url: string }) => item.source_url);
                    
                    console.log(`[WPHome] ✅ Banners obtenidos: ${imageUrls.length} imágenes`);
                    
                    // Mapear al formato BannersPub
                    const bannersPub: BannersPub = {
                        slider1: [],
                        sliderMedianos1: [
                            { id: 1, imagenes: imageUrls.slice(0, 2) }
                        ],
                        pequenos1: imageUrls.slice(2, 4),
                        sliderMedianos2: [
                            { id: 2, imagenes: imageUrls.slice(4, 6) }
                        ],
                        pequenos2: [],
                    };
                    
                    return bannersPub;
                }
                
                console.warn('[WPHome] /wp/v2/media retorn array vacío');
            } else {
                console.warn(`[WPHome] /wp/v2/media respondió: ${res.status} ${res.statusText}`);
            }
        } catch (e) {
            console.warn(`[WPHome] /wp/v2/media error:`, e);
        }

        // 2. Intentar /custom/v1/home
        try {
            const res = await fetch(`${baseUrl}/custom/v1/home`, {
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (res.ok) {
                console.log('[WPHome] ✅ Endpoint /custom/v1/home respondió correctamente');
                const data = await res.json();
                return data.bannersPub || data;
            }
            console.warn(`[WPHome] /custom/v1/home respondió: ${res.status} ${res.statusText}`);
        } catch (e) {
            console.warn(`[WPHome] /custom/v1/home error:`, e);
        }

        // 3. Si ambos fallan → fallback directo
        console.warn('[WPHome] ❌ Todos los endpoints fallaron, usando fallback homeData.bannersPub');
        return homeData.bannersPub;
    }

    async getCategories(): Promise<Categoria[]> {
        const auth = buildWooAuthParams();
        const url = `${this.getWooBaseUrl()}/products/categories?${auth}&per_page=100`;
        
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        const categories = await res.json() as WooCategory[];
        return categories.map((cat) => ({
            id: cat.id,
            nombre: cat.name.toUpperCase(),
            imagen: cat.image?.src || '/img/no-image.png',
            descripcion: cat.description || '',
            slug: cat.slug,
        }));
    }

    async getProducts(perPage: number = 20): Promise<Producto[]> {
        const auth = buildWooAuthParams();
        const url = `${this.getWooBaseUrl()}/products?${auth}&per_page=${perPage}`;
        
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await res.json() as WooProduct[];
        return products.map((prod) => ({
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
        const auth = buildWooAuthParams();
        const url = `${this.getWooBaseUrl()}/products?${auth}&category=${categoryId}&per_page=${perPage}`;
        
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await res.json() as WooProduct[];
        return products.map((prod) => ({
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
        const auth = buildWooAuthParams();
        const url = `${this.getWooBaseUrl()}/products?${auth}&slug=${encodeURIComponent(slug)}`;
        
        const res = await fetch(url);
        if (!res.ok) {
            return null;
        }
        
        const products = await res.json();
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
    }

    async getCategoryBySlug(slug: string): Promise<Categoria | null> {
        const auth = buildWooAuthParams();
        const url = `${this.getWooBaseUrl()}/products/categories?${auth}&slug=${encodeURIComponent(slug)}`;
        
        const res = await fetch(url);
        if (!res.ok) {
            return null;
        }
        
        const categories = await res.json();
        if (!categories || categories.length === 0) return null;
        
        const cat = categories[0];
        return {
            id: cat.id,
            nombre: cat.name.toUpperCase(),
            imagen: cat.image?.src || '/img/no-image.png',
            descripcion: cat.description || '',
            slug: cat.slug,
        };
    }

    async getHomeSection(slug: string) {
        return null;
    }

    async getHeroes() {
        return homeData.banners;
    }

    async getServiceCategories() {
        return homeData.categorias;
    }

    async getBrands() {
        return homeData.marcas;
    }

    async getOnSaleProducts(perPage?: number) {
        return homeData.ofertasProductos;
    }

    async getNewProducts(perPage?: number) {
        return homeData.productosNuevos;
    }

    async getBenefits() {
        return homeData.beneficios;
    }

    async subscribeNewsletter(email: string) {
        return { success: true, message: 'Suscripción exitosa' };
    }

    async searchProducts(query: string, limit: number = 10): Promise<any[]> {
        return [];
    }

    async searchCategories(query: string, limit: number = 10): Promise<any[]> {
        return [];
    }

    async getProductsByCategorySlug(slug: string, limit: number = 10): Promise<any[]> {
        return [];
    }
}
