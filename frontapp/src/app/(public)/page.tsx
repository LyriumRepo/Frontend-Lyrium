import {
    SearchBar,
    HeroSection,
    ServicesGrid,
    ProductsGrid,
    BrandsCarousel,
    OffersSection,
    AdBanners,
    ProductSlider,
    BenefitsSection,
    NewsletterSection,
} from '@/components/home';

import { home } from '@/shared/lib/api';
import { LaravelHomeRepository } from '@/shared/lib/api/laravel';
import type { HomeSection } from '@/shared/lib/api/laravel/LaravelHomeRepository';
import type { Banner, Categoria, Producto, Marca, Beneficio, BannersPub } from '@/types/public';

const LARAVEL_BASE_URL = (process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api').replace('/api', '');

const HOME_SECTIONS = [
    { slug: 'productos-digestion-saludable', titulo: 'Digestión saludable' },
    { slug: 'productos-belleza', titulo: 'Belleza' },
    { slug: 'servicios-medicos', titulo: 'Servicios Médicos' },
];

const transformUrl = (url: string | undefined | null): string => {
    if (!url) return '/img/no-image.png';
    if (url.startsWith('http')) return url;
    return `${LARAVEL_BASE_URL}${url}`;
};

export default async function HomePage() {
    const repo = new LaravelHomeRepository();

    let banners: Banner[] = [];
    let categoriasServicios: Categoria[] = [];
    let categoriasProductos: Categoria[] = [];
    let marcas: Marca[] = [];
    let beneficios: Beneficio[] = [];
    let bannersPub: BannersPub = { slider1: [], sliderMedianos1: [], pequenos1: [], sliderMedianos2: [], pequenos2: [] };

    let ofertasServicios: Producto[] = [];
    let ofertasProductos: Producto[] = [];
    let productosNuevos: Producto[] = [];

    try {
        const [heroes, serviceCats, brands, onSaleProducts, onSaleServices, newProducts, benefits, bannersPubData, productCats] = await Promise.all([
            repo.getHeroes(),
            repo.getServiceCategories(),
            repo.getBrands(),
            repo.getOnSaleProducts(12, 'physical'),
            repo.getOnSaleProducts(12, 'service'),
            repo.getNewProducts(12),
            repo.getBenefits(),
            home.getBannersPub(),
            repo.getCategories(),
        ]);

        if (heroes.length > 0) banners = heroes;
        if (serviceCats.length > 0) categoriasServicios = serviceCats;
        if (brands.length > 0) marcas = brands;
        if (benefits.length > 0) beneficios = benefits;
        if (bannersPubData) bannersPub = bannersPubData;

        ofertasProductos = onSaleProducts;
        ofertasServicios = onSaleServices;
        productosNuevos = newProducts;

        if (productCats.length > 0) {
            categoriasProductos = productCats;
        }
    } catch (error) {
        console.warn('Error fetching home data:', error);
    }

    const homeSections = await Promise.all(
        HOME_SECTIONS.map(async (section) => {
            try {
                const data = await repo.getHomeSection(section.slug);
                return data ? { ...data, titulo: section.titulo } : null;
            } catch {
                return null;
            }
        })
    );

    return (
        <div className="space-y-8 md:space-y-16 pb-8 md:pb-12">
            <SearchBar categorias={categoriasServicios} />
            <HeroSection banners={banners} />
            <ServicesGrid categorias={categoriasServicios} />
            <ProductsGrid categorias={categoriasProductos} titulo="Categorías de productos saludables" />
            <BrandsCarousel marcas={marcas} />
            <OffersSection
                ofertasServicios={ofertasServicios}
                ofertasProductos={ofertasProductos}
                productosNuevos={productosNuevos}
            />
            <AdBanners bannersPub={bannersPub} />

            {homeSections.map((section, index) => {
                if (!section || section.products.length === 0) return null;
                
                return (
                    <ProductSlider
                        key={section.category.slug || index}
                        productos={section.products}
                        titulo={section.titulo}
                        bannerImage={section.banner.imagen || '/img/no-image.png'}
                    />
                );
            })}

            <BenefitsSection beneficios={beneficios} />
            <NewsletterSection />
        </div>
    );
}
