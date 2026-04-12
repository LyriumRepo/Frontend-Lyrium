'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  url: string;
  titulo: string;
  link?: string;
}

interface AdBannersGridProps {
  banners?: Banner[];
  maxBanners?: number;
}

const defaultBanners: Banner[] = [
  { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop', titulo: 'Promoción Especial', link: '#' },
  { url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=400&fit=crop', titulo: 'Ofertas Destacadas', link: '#' },
  { url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=400&fit=crop', titulo: 'Nuevos Productos', link: '#' },
];

export default function AdBannersGrid({ banners = defaultBanners, maxBanners = 3 }: AdBannersGridProps) {
  const bannersVisibles = banners.slice(0, maxBanners);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {bannersVisibles.map((banner, idx) => (
        <Link 
          key={idx}
          href={banner.link || '#'}
          className="group block overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative aspect-[16/9] md:aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)]">
            {banner.url ? (
              <Image
                src={banner.url}
                alt={banner.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-500">
                <span className="text-white font-bold text-lg">{banner.titulo}</span>
              </div>
            )}
            {/* Overlay con título al hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-white font-semibold text-sm drop-shadow-lg">
                  {banner.titulo}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
