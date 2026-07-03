'use client';

import { useEffect, useState } from 'react';
import StoreHeader from '@/components/store/StoreHeader';
import StoreBannerCarousel from '@/components/store/StoreBannerCarousel';
import StoreInfoCard from '@/components/store/StoreInfoCard';
import { Layout1, Layout2, Layout3, LayoutEmprende } from '@/components/store/layouts';

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

function mapPlan(planSlug: string | null | undefined): 'basic' | 'premium' {
  if (!planSlug) return 'basic';
  const slug = planSlug.toLowerCase();
  if (slug === 'especial' || slug === 'premium' || slug === 'enterprise') return 'premium';
  return 'basic';
}

export default function TiendaPage({ params }: StorePageProps) {
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevant' | 'priceDesc' | 'priceAsc' | 'nameAsc'>('relevant');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { slug } = await params;

        const [storeRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/stores/slug/${slug}`),
          fetch(`${API_URL}/products?store_slug=${slug}&per_page=50`),
        ]);

        if (!storeRes.ok) {
          setError('Tienda no encontrada');
          setLoading(false);
          return;
        }

        const storeJson = await storeRes.json();
        const storeData = storeJson.data;

        let rawProducts: any[] = [];
        if (productsRes.ok) {
          const productsJson = await productsRes.json();
          rawProducts = productsJson.data || [];
        }

        const servicesRes = await fetch(`${API_URL}/services?store_id=${storeData.id}&per_page=50`);
        let rawServices: any[] = [];
        if (servicesRes.ok) {
          const servicesJson = await servicesRes.json();
          rawServices = servicesJson.data || [];
        }

        const plan = mapPlan(storeData.subscription?.plan?.slug);

        const store = {
          id: Number(storeData.id),
          nombre: storeData.storeName || storeData.nombre_comercial || storeData.slug,
          slug: storeData.slug,
          store_name: storeData.storeName,
          logo: storeData.logo || '',
          logo_marketplace: storeData.logo_marketplace || '',
          cover: storeData.banner2 || storeData.banner || '',
          banner: storeData.banner || '',
          descripcion: storeData.description || '',
          actividad: storeData.activity || '',
          direccion: storeData.address || '',
          categoria: storeData.category?.name || '',
          category_id: storeData.category_id,
          telefono: storeData.phone || '',
          correo: storeData.email || '',
          valoracion: storeData.rating || 0,
          reviews: 0,
          plan: plan === 'premium' ? 'premium' as const : 'basico' as const,
          instagram: storeData.instagram,
          facebook: storeData.facebook,
          tiktok: storeData.tiktok,
          whatsapp: storeData.whatsapp,
          gallery: storeData.gallery || [],
          status: storeData.status,
          layout: storeData.layout || '1',
          policies: {
            shipping: storeData.policyFiles?.shipping || storeData.policies?.shipping_pdf || null,
            returns: storeData.policyFiles?.return || storeData.policies?.return_pdf || null,
            privacy: storeData.policyFiles?.privacy || storeData.policies?.privacy_pdf || null,
          },
          branches: (storeData.branches || []).map((b: any) => ({
            name: b.name || '',
            address: b.address || '',
            department: b.department || '',
            phone: b.phone || '',
            hours: b.hours || '',
            mapsUrl: b.maps_url || b.mapsUrl || '',
          })),
        };

        const products = rawProducts.map((p: any) => ({
          id: Number(p.id),
          titulo: p.name || 'Sin nombre',
          slug: p.slug,
          precio: Number(p.price || 0),
          precioOferta: Number(p.price || p.regular_price || 0),
          precioAnterior: (p.regular_price && Number(p.regular_price) > Number(p.price)) ? Number(p.regular_price) : undefined,
          imagen: p.images?.[0]?.src || '/img/no-image.png',
          stock: p.stock || 0,
          categoria: p.categories?.[0]?.name || '',
          categorias: (p.categories || []).map((c: any) => c.name),
          descripcionCorta: p.short_description || '',
          estrellas: p.rating?.average ? String(p.rating.average) : undefined,
          reviews: p.rating?.count || 0,
          sku: p.sku || '',
          tag: p.sticker || undefined,
          store_logo_marketplace: store.logo_marketplace || undefined,
          vendedor: p.store ? { slug: p.store.slug, nombre: p.store.name } : undefined,
          tipo: p.type === 'service' ? 'service' as const : 'product' as const,
        }));

        const services = rawServices.map((s: any) => ({
          id: Number(s.id),
          titulo: s.name || 'Sin nombre',
          slug: s.slug,
          precio: Number(s.price || 0),
          precioOferta: Number(s.price || 0),
          precioAnterior: undefined,
          imagen: s.image || '/img/no-image.png',
          stock: 0,
          categoria: s.category || '',
          categorias: s.category ? [s.category] : [],
          descripcion: s.description || '',
          vendedor: s.store_name ? { slug: store.slug, nombre: s.store_name } : undefined,
          tipo: 'service' as const,
          duration_minutes: s.duration_minutes,
        }));

        const allProducts = [...products, ...services];

        const redes = [
          ...(storeData.instagram ? [{ key: 'instagram' as const, url: storeData.instagram }] : []),
          ...(storeData.facebook ? [{ key: 'facebook' as const, url: storeData.facebook }] : []),
          ...(storeData.tiktok ? [{ key: 'tiktok' as const, url: storeData.tiktok }] : []),
          ...(storeData.whatsapp ? [{ key: 'whatsapp' as const, url: storeData.whatsapp }] : []),
          ...(storeData.youtube ? [{ key: 'youtube' as const, url: storeData.youtube }] : []),
          ...(storeData.twitter ? [{ key: 'twitter' as const, url: storeData.twitter }] : []),
          ...(storeData.linkedin ? [{ key: 'linkedin' as const, url: storeData.linkedin }] : []),
          ...(storeData.website ? [{ key: 'web' as const, url: storeData.website }] : []),
        ];

        const adBanners = (storeData.ad_banners || [])
          .filter((b: any) => b && (b.url || typeof b === 'string'))
          .map((b: any) => ({
            url: typeof b === 'string' ? b : (b.url || ''),
            titulo: b.title || 'Banner promocional',
            link: b.link || '',
          }))
          .filter((b: { url: string }) => b.url);

        const banners = [
          ...(storeData.banner ? [{ url: storeData.banner, titulo: 'Banner principal' }] : []),
          ...(storeData.banner2 ? [{ url: storeData.banner2, titulo: 'Banner secundario' }] : []),
          ...((storeData.gallery || []).slice(0, 2).map((img: string, i: number) => ({
            url: img, titulo: `Galería ${i + 1}`
          }))),
        ];

        console.log('=== DIAGNÓSTICO SERVICIOS ===');
        console.log('Productos desde API:', rawProducts.length);
        console.log('Servicios desde API:', rawServices.length);
        console.log('Total combinado:', allProducts.length);
        console.log('tipo===service:', allProducts.filter((p:any) => p.tipo === 'service').length);
        console.log('tipo!==service:', allProducts.filter((p:any) => p.tipo !== 'service').length);
        console.log('Servicio ejemplo:', JSON.stringify(services[0] || 'N/A'));

        setStoreData({
          store,
          products: allProducts,
          banners,
          adBanners,
          redes,
          stats: {
            products: allProducts.length,
            rating: storeData.rating || 0,
            reviews: 0,
          },
        });
      } catch (err: any) {
        console.error('Error al cargar tienda:', err);
        setError(err.message || 'Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const filteredProducts = [...(storeData?.products || [])]
    .filter(p =>
      p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoria || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'priceDesc') return b.precio - a.precio;
      if (sortBy === 'priceAsc') return a.precio - b.precio;
      if (sortBy === 'nameAsc') return a.titulo.localeCompare(b.titulo, 'es');
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Tienda no encontrada</h2>
          <p className="text-gray-500 mb-6">{error || 'La tienda que buscas no existe o no está disponible.'}</p>
          <a
            href="/tiendasregistradas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors"
          >
            Ver tiendas registradas
          </a>
        </div>
      </div>
    );
  }

  const { store, banners, adBanners, redes } = storeData;
  const planHeader = store.plan === 'premium' ? 'premium' : 'basic';
  const planLayout = store.plan || 'basico';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D]">
      <StoreHeader
        store={{
          id: store.id || 1,
          name: store.nombre || store.slug || 'Tienda',
          logo: store.logo || '',
          cover: store.cover || '',
          category: store.categoria || '',
          address: store.direccion || '',
          open: true,
          plan: planHeader,
        }}
        stats={storeData.stats}
        onSearch={setSearchQuery}
      />

      <main className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="space-y-8">
          <StoreBannerCarousel banners={banners} redes={redes} plan={planHeader} logo={store.logo} storeId={store.id} />

          <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border">
            <div className="text-sm text-gray-600">
              Mostrando <strong>{filteredProducts.length}</strong> productos
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevant">Más relevantes</option>
                <option value="priceDesc">Precio: Mayor a Menor</option>
                <option value="priceAsc">Precio: Menor a Mayor</option>
                <option value="nameAsc">Nombre (A - Z)</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {searchQuery ? 'No se encontraron productos para tu búsqueda' : 'No hay productos disponibles'}
            </div>
          ) : (
            <>
              {store.layout === 'emprende' && <LayoutEmprende store={store} products={filteredProducts} plan={planLayout} banners={adBanners} />}
              {store.layout === '1' && <Layout1 store={store} products={filteredProducts} plan={planLayout} banners={adBanners} />}
              {store.layout === '2' && <Layout2 store={store} products={filteredProducts} plan={planLayout} banners={adBanners} />}
              {(!store.layout || store.layout === '3') && <Layout3 store={store} products={filteredProducts} plan={planLayout} banners={adBanners} />}
            </>
          )}

          <hr className="border-gray-200 dark:border-gray-800" />

          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Información de la tienda</h3>

            {planLayout === 'premium' && <StoreInfoCard tienda={store} horarios={{}} />}

            {store.descripcion && (
              <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-6 border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sobre Nosotros</p>
                <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed">{store.descripcion}</p>
              </div>
            )}

            {(store.actividad || store.telefono || store.correo) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.actividad && (
                  <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-5 border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Actividad</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">{store.actividad}</p>
                  </div>
                )}
                {(store.telefono || store.correo) && (
                  <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-5 border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contacto</p>
                    {store.telefono && (
                      <a href={`tel:${store.telefono}`} className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-[var(--text-primary)] hover:text-sky-600 transition-colors">
                        📞 {store.telefono}
                      </a>
                    )}
                    {store.correo && (
                      <a href={`mailto:${store.correo}`} className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline">
                        ✉️ {store.correo}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            <hr className="border-gray-200 dark:border-gray-800" />

            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Información operativa</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(store.policies.shipping || store.policies.returns || store.policies.privacy) && (
                <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-5 border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Políticas</p>
                  {store.policies.shipping && (
                    <a href={store.policies.shipping} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline">
                      📦 Política de envíos
                    </a>
                  )}
                  {store.policies.returns && (
                    <a href={store.policies.returns} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline">
                      🔄 Política de devoluciones
                    </a>
                  )}
                  {store.policies.privacy && (
                    <a href={store.policies.privacy} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline">
                      🔒 Política de privacidad
                    </a>
                  )}
                </div>
              )}
              {store.branches.length > 0 && (
                <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-5 border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sucursales</p>
                  <div className="space-y-3">
                    {store.branches.slice(0, 3).map((b: any, i: number) => (
                      <div key={i} className="text-xs font-bold text-gray-700 dark:text-[var(--text-primary)]">
                        <p className="font-black">{b.name}</p>
                        <p className="text-gray-500 dark:text-[var(--text-secondary)] font-medium">{b.address}{b.department ? `, ${b.department}` : ''}</p>
                        {b.hours && <p className="text-gray-400 font-medium">{b.hours}</p>}
                        {b.mapsUrl && (
                          <a href={b.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">Ver en mapa</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}