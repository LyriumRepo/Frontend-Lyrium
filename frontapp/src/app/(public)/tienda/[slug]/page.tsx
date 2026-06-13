'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StoreHeader from '@/components/store/StoreHeader';
import StoreBannerCarousel from '@/components/store/StoreBannerCarousel';
import AdBannersGrid from '@/components/store/AdBannersGrid';
import StoreInfoCard from '@/components/store/StoreInfoCard';
import { Layout1, Layout2, Layout3, BasicLayout } from '@/components/store/layouts';
import { Tienda, Producto } from '@/types/public';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

interface Horario {
  apertura?: string;
  cierre?: string;
  cerrado?: boolean;
}

interface Banner {
  url: string;
  titulo?: string;
  link?: string;
}

interface SocialNetwork {
  key: 'instagram' | 'facebook' | 'whatsapp' | 'youtube' | 'twitter' | 'linkedin' | 'pinterest' | 'telegram' | 'web';
  url: string;
}

interface StoreResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    banner2: string | null;
    gallery: string[];
    address: string | null;
    phone: string | null;
    email: string | null;
    category: string | null;
    category_id: number | null;
    rating: number;
    layout: string;
    plan: string;
    open: boolean;
    social: Record<string, string | null>;
    branches: Array<{
      id: number;
      name: string;
      address: string;
      city: string;
      phone: string;
      hours: string | null;
      is_principal: boolean;
      maps_url: string | null;
    }>;
    stats: {
      products: number;
      rating: number;
      reviews: number;
    };
  };
}

interface ProductResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    regular_price: number;
    stock: number;
    sticker: string | null;
    images: Array<{ src: string; thumb?: string }>;
    categories: Array<{ name: string; slug: string }>;
    rating: { average: number; count: number };
  }>;
}

const DAYS_MAP: Record<string, string> = {
  monday: 'lunes', tuesday: 'martes', wednesday: 'miercoles', thursday: 'jueves',
  friday: 'viernes', saturday: 'sabado', sunday: 'domingo',
};

function parseHours(hoursStr: string | null): Record<string, Horario> {
  const result: Record<string, Horario> = {};
  if (!hoursStr) return result;
  try {
    const parsed = JSON.parse(hoursStr);
    for (const [day, h] of Object.entries(parsed)) {
      const entry = h as any;
      const dayKey = DAYS_MAP[day] || day;
      result[dayKey] = {
        apertura: entry.apertura || entry.open || undefined,
        cierre: entry.cierre || entry.close || undefined,
        cerrado: entry.cerrado || entry.closed || false,
      };
    }
  } catch {}
  return result;
}

function socialToArray(social: Record<string, string | null>): SocialNetwork[] {
  const valid: SocialNetwork[] = [];
  const map: Record<string, string> = {
    instagram: 'instagram', facebook: 'facebook', whatsapp: 'whatsapp',
    youtube: 'youtube', twitter: 'twitter', linkedin: 'linkedin',
    tiktok: 'tiktok', website: 'web',
  };
  for (const [key, url] of Object.entries(social)) {
    if (url && map[key]) {
      valid.push({ key: map[key] as SocialNetwork['key'], url });
    }
  }
  return valid;
}

const LAYOUT_MAP: Record<string, React.ComponentType<any>> = {
  '1': Layout1,
  '2': Layout2,
  '3': Layout3,
};

export default function TiendaPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [storeData, setStoreData] = useState<StoreResponse['data'] | null>(null);
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetch(`${LARAVEL_API_URL}/store/${slug}`)
      .then(r => r.json())
      .then(async (storeJson: StoreResponse) => {
        if (!storeJson.success) {
          setError('Tienda no encontrada');
          setLoading(false);
          return;
        }
        setStoreData(storeJson.data);
        try {
          const prodRes = await fetch(`${LARAVEL_API_URL}/products?store_id=${storeJson.data.id}&per_page=50&status=approved`);
          const prodJson: ProductResponse = await prodRes.json();
          if (prodJson.success) {
            setProducts(prodJson.data.map(p => ({
              id: parseInt(p.id),
              titulo: p.name,
              precio: p.price,
              imagen: p.images?.[0]?.src || '/img/product-placeholder.webp',
              categoria: p.categories?.[0]?.name || undefined,
              tag: p.sticker || undefined,
              slug: p.slug,
              descripcion: p.description,
              precioAnterior: p.regular_price !== p.price ? p.regular_price : undefined,
              reviews: p.rating?.count || 0,
              stock: p.stock,
            })));
          }
        } catch {}
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar la tienda');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D] flex items-center justify-center">
      <div className="text-gray-400 text-lg">Cargando tienda...</div>
    </div>;
  }

  if (error || !storeData) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D] flex items-center justify-center">
      <div className="text-red-500 text-lg">{error || 'Tienda no encontrada'}</div>
    </div>;
  }

  const store: Tienda & { layout?: '1' | '2' | '3' } = {
    id: storeData.id,
    nombre: storeData.name,
    slug: storeData.slug,
    descripcion: storeData.description || undefined,
    logo: storeData.logo || undefined,
    banner: storeData.banner || undefined,
    categoria: storeData.category || undefined,
    category_id: storeData.category_id ?? undefined,
    direccion: storeData.address || undefined,
    telefono: storeData.phone || undefined,
    correo: storeData.email || undefined,
    valoracion: storeData.rating,
    plan: storeData.plan as 'basico' | 'premium',
    layout: storeData.layout as '1' | '2' | '3',
    gallery: storeData.gallery,
    instagram: storeData.social.instagram || undefined,
    facebook: storeData.social.facebook || undefined,
    tiktok: storeData.social.tiktok || undefined,
  };

  const banners: Banner[] = [
    ...(storeData.banner ? [{ url: storeData.banner, titulo: 'Banner principal' }] : []),
    ...(storeData.banner2 ? [{ url: storeData.banner2, titulo: 'Banner secundario' }] : []),
    ...(storeData.gallery?.map((url, i) => ({ url, titulo: `Galería ${i + 1}` })) || []),
  ];

  const redes = socialToArray(storeData.social);
  const LayoutComponent = LAYOUT_MAP[storeData.layout] || Layout1;

  let horarios: Record<string, Horario> = {};
  if (storeData.branches && storeData.branches.length > 0) {
    const principal = storeData.branches.find(b => b.is_principal) || storeData.branches[0];
    horarios = parseHours(principal.hours);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D]">
      <StoreHeader
        store={{
          id: store.id,
          name: store.nombre,
          logo: store.logo || '',
          category: store.categoria || '',
          address: store.direccion || '',
          open: storeData.open,
          plan: storeData.plan === 'premium' ? 'premium' : 'basic',
        }}
        stats={{
          products: products.length,
          rating: storeData.rating,
          reviews: 0,
        }}
        onSearch={(query) => console.log('Buscar:', query)}
      />

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="tienda-secciones-principales space-y-6">
          <StoreBannerCarousel
            banners={banners.length > 0 ? banners : [{ url: '/img/stores/default-cover.webp', titulo: store.nombre }]}
            redes={redes}
            plan={storeData.plan === 'premium' ? 'premium' : 'basic'}
          />

          <AdBannersGrid />

          {storeData.plan === 'premium' && (
            <StoreInfoCard
              tienda={store}
              horarios={horarios}
            />
          )}

          <hr className="border-gray-200 dark:border-[var(--border-subtle)] my-8" />

          <LayoutComponent
            store={store}
            products={products}
            plan={storeData.plan || 'basico'}
          />
        </div>
      </main>
    </div>
  );
}
