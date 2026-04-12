'use client';

import StoreHeader from '@/components/store/StoreHeader';
import StoreBannerCarousel from '@/components/store/StoreBannerCarousel';
import AdBannersGrid from '@/components/store/AdBannersGrid';
import StoreInfoCard from '@/components/store/StoreInfoCard';
import { Layout1, Layout2, Layout3, BasicLayout } from '@/components/store/layouts';
import { Tienda, Producto } from '@/types/public';

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

interface StorePageData {
  store: Tienda & {
    layout?: '1' | '2' | '3';
  };
  stats: {
    products: number;
    rating: number;
    reviews: number;
  };
  banners: Banner[];
  redes: SocialNetwork[];
  horarios: Record<string, Horario>;
  products: Producto[];
  open: boolean;
}

export default function TiendaPage({ params }: { params: Promise<{ slug: string }> }) {
  // Datos de ejemplo - estos vendrán de la API
  const storeData: StorePageData = {
    store: {
      id: 1,
      nombre: 'Vida Natural',
      slug: 'vida-natural',
      descripcion: 'Tu tienda de productos naturales y suplementos de calidad',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Iconic_image_of_a_leaf.svg/256px-Iconic_image_of_a_leaf.svg.png',
      categoria: 'Salud y Bienestar',
      direccion: 'Urb. Los Educadores Mz M Lt 04, Piura',
      plan: 'basico',
      telefono: '+51 912 345 678',
      correo: 'contacto@vidanatural.com',
      valoracion: 4.9,
      reviews: 128,
      layout: '3', // El vendedor elige: '1', '2', '3'
    },
    stats: {
      products: 24,
      rating: 4.9,
      reviews: 128,
    },
    banners: [
      { url: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 1' },
      { url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 2' },
      { url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 3' },
      { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 4' },
    ],
    redes: [
      { key: 'instagram', url: 'https://instagram.com/vidanatural' },
      { key: 'facebook', url: 'https://facebook.com/vidanatural' },
      { key: 'whatsapp', url: 'https://wa.me/51912345678' },
      { key: 'youtube', url: 'https://youtube.com/vidanatural' },
    ],
    horarios: {
      lunes: { apertura: '09:00', cierre: '18:00' },
      martes: { apertura: '09:00', cierre: '18:00' },
      miercoles: { apertura: '09:00', cierre: '18:00' },
      jueves: { apertura: '09:00', cierre: '18:00' },
      viernes: { apertura: '09:00', cierre: '18:00' },
      sabado: { apertura: '09:00', cierre: '14:00' },
      domingo: { cerrado: true },
    },
    products: [
      { id: 1, titulo: 'Vitamina C 1000mg', precio: 45.90, precioAnterior: 59.90, imagen: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', tag: 'oferta', reviews: 24, stock: 50, categoria: 'Vitaminas', descripcion: 'Vitamina C de alta potencia' },
      { id: 2, titulo: 'Omega 3 Fish Oil', precio: 89.90, imagen: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300', tag: 'promo', reviews: 18, stock: 30, categoria: 'Suplementos', descripcion: 'Aceite de pescado rico en Omega 3' },
      { id: 3, titulo: 'Proteína Vegana', precio: 125.00, imagen: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300', tag: 'nuevo', reviews: 32, stock: 25, categoria: 'Proteínas', descripcion: 'Proteína 100% vegetal' },
      { id: 4, titulo: 'Colágeno Hidrolizado', precio: 78.50, imagen: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300', tag: '', reviews: 15, stock: 40, categoria: 'Belleza', descripcion: 'Colágeno para piel y uñas' },
      { id: 5, titulo: 'Maca Andina Premium', precio: 35.00, imagen: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300', tag: 'limitado', reviews: 45, stock: 15, categoria: 'Energía', descripcion: 'Maca peruana de alta calidad' },
      { id: 6, titulo: 'Multivitamínico', precio: 55.00, imagen: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300', tag: '', reviews: 28, stock: 60, categoria: 'Vitaminas', descripcion: 'Complejo multivitamínico' },
      { id: 7, titulo: 'Zinc + Vitamina D', precio: 38.50, imagen: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300', tag: 'nuevo', reviews: 19, stock: 45, categoria: 'Vitaminas', descripcion: 'Combinación de Zinc y Vitamina D' },
      { id: 8, titulo: 'Probióticos Premium', precio: 92.00, imagen: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300', tag: 'promo', reviews: 56, stock: 35, categoria: 'Digestivo', descripcion: 'Probióticos de alta potencia' },
    ] as Producto[],
    open: true,
  };

  // Seleccionar layout según config del vendedor
  // IMPORTANTE: Siempre usa el layout configurado (igual que PHP legacy línea 30)
  // $modelo_layout = ($plan === 'premium') ? $tienda['layout_modelo'] : 3;
  const LayoutComponent = {
    '1': Layout1,
    '2': Layout2,
    '3': Layout3,
  }[storeData.store.layout || '3'];

  const FinalLayout = LayoutComponent;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D]">
      <StoreHeader
        store={{
          id: storeData.store.id,
          name: storeData.store.nombre,
          logo: storeData.store.logo || '',
          category: storeData.store.categoria || '',
          address: storeData.store.direccion || '',
          open: storeData.open,
          plan: storeData.store.plan === 'premium' ? 'premium' : 'basic',
        }}
        stats={storeData.stats}
        onSearch={(query) => console.log('Buscar:', query)}
      />
      
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* tienda-secciones-principales */}
        <div className="tienda-secciones-principales space-y-6">
          
          {/* Banner Carrusel + Redes Sociales */}
          <StoreBannerCarousel 
            banners={storeData.banners}
            redes={storeData.redes}
            plan={storeData.store.plan === 'premium' ? 'premium' : 'basic'}
          />
          
          {/* Publicidad Horizontal - 3 Cards */}
          <AdBannersGrid />
          
          {/* Info Tienda - Solo Premium */}
          {storeData.store.plan === 'premium' && (
            <StoreInfoCard 
              tienda={storeData.store}
              horarios={storeData.horarios}
            />
          )}
          
          {/* Separador */}
          <hr className="border-gray-200 dark:border-[var(--border-subtle)] my-8" />
          
          {/* LAYOUT DINÁMICO - Según elección del vendedor */}
          <FinalLayout 
            store={storeData.store}
            products={storeData.products}
            plan={storeData.store.plan || 'basico'}
          />
          
        </div>
      </main>
    </div>
  );
}
