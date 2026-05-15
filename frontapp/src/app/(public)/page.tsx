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

import { LaravelHomeRepository } from '@/shared/lib/api/laravel';
import type { Banner, Categoria, Producto, Marca, Beneficio, BannersPub } from '@/types/public';

const LARAVEL_BASE_URL = 'http://127.0.0.1:8000';

function fixImageUrl(url: string | undefined | null): string {
  if (!url) return '/img/no-image.png';
  if (url.startsWith('http')) return url;

  let cleanUrl = url.trim().replace('/backend/storage', '/storage');

  if (cleanUrl.startsWith('/img/')) return cleanUrl;
  if (!cleanUrl.startsWith('/')) cleanUrl = '/' + cleanUrl;

  return cleanUrl;
}

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
        const [
            heroes,
            serviceCats,
            brands,
            onSaleProducts,
            onSaleServices,
            newProducts,
            benefits,
            bannersPubData,
            productCats
        ] = await Promise.all([
            repo.getHeroes().catch(() => []),
            repo.getServiceCategories().catch(() => []),
            repo.getBrands().catch(() => []),
            repo.getOnSaleProducts(12, 'physical').catch(() => []),
            repo.getOnSaleProducts(12, 'service').catch(() => []),
            repo.getNewProducts(12).catch(() => []),
            repo.getBenefits().catch(() => []),
            repo.getBannersPub?.().catch(() => null) || Promise.resolve(null),
            repo.getCategories().catch(() => []),
        ]);

        banners = heroes;
        categoriasServicios = serviceCats;
        marcas = brands;
        beneficios = benefits;
        bannersPub = bannersPubData || bannersPub;
        ofertasProductos = onSaleProducts;
        ofertasServicios = onSaleServices;
        productosNuevos = newProducts;
        categoriasProductos = productCats;

    } catch (error) {
        console.error('Error fetching home data:', error);
    }

    const dynamicSections = [
        { slug: 'productos-digestion-saludable', titulo: 'Digestión Saludable' },
        { slug: 'productos-belleza', titulo: 'Belleza' },
        { slug: 'servicios-medicos', titulo: 'Servicios Médicos' },
    ];

    const homeSections = await Promise.all(
        dynamicSections.map(async (section) => {
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

            <ProductsGrid 
                categorias={categoriasProductos} 
                titulo="Categorías de productos saludables" 
            />

            <BrandsCarousel marcas={marcas} />

            <OffersSection
                ofertasServicios={ofertasServicios}
                ofertasProductos={ofertasProductos}
                productosNuevos={productosNuevos}
            />

            <AdBanners bannersPub={bannersPub} />

            {homeSections.map((section, index) => {
                if (!section || !section.products?.length) return null;
                return (
                    <ProductSlider
                        key={section.category?.slug || index}
                        productos={section.products}
                        titulo={section.titulo}
                        bannerImage={fixImageUrl(section.banner?.imagen)}
                    />
                );
            })}

            <BenefitsSection beneficios={beneficios} />
            <NewsletterSection />
        </div>
    );
}