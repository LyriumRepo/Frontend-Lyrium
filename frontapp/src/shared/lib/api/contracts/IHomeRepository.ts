import { Banner, Categoria, Producto, Marca, Beneficio, BannersPub } from '@/types/public';
import { HomeSection } from '../laravel/LaravelHomeRepository';

export interface IHomeRepository {
    getBannersPub(): Promise<BannersPub>;
    getCategories(): Promise<Categoria[]>;
    getProducts(perPage?: number): Promise<Producto[]>;
    getProductsByCategory(categoryId: number, perPage?: number): Promise<Producto[]>;
    getProductBySlug(slug: string): Promise<Producto | null>;
    getCategoryBySlug(slug: string): Promise<Categoria | null>;
    getHomeSection(slug: string): Promise<HomeSection | null>;
    getHeroes(): Promise<Banner[]>;
    getServiceCategories(): Promise<Categoria[]>;
    getBrands(): Promise<Marca[]>;
    getOnSaleProducts(perPage?: number): Promise<Producto[]>;
    getNewProducts(perPage?: number): Promise<Producto[]>;
    getBenefits(): Promise<Beneficio[]>;
    subscribeNewsletter(email: string): Promise<{ success: boolean; message?: string }>;
    searchProducts(query: string, limit?: number): Promise<any[]>;
    searchCategories(query: string, limit?: number): Promise<any[]>;
    getProductsByCategorySlug(slug: string, limit?: number): Promise<any[]>;
}
