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
  vertical?: boolean;
}

const defaultBanners: Banner[] = [
  { url: '', titulo: 'Banner en preparación', link: '#' },
  { url: '', titulo: 'Banner en preparación', link: '#' },
  { url: '', titulo: 'Banner en preparación', link: '#' },
];

export default function AdBannersGrid({ banners = defaultBanners, maxBanners = 3, vertical = false }: AdBannersGridProps) {
  const bannersVisibles = banners.slice(0, maxBanners);

  return (
    <div className={`grid gap-4 ${vertical ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
      {bannersVisibles.map((banner, idx) => (
        <Link 
          key={idx}
          href={banner.link || '#'}
          className="group block overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className={`relative overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)] ${vertical ? 'aspect-[3/4]' : 'aspect-[16/9]'}`}>
            {banner.url ? (
              <Image
                src={banner.url}
                alt={banner.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <span className="text-gray-400 dark:text-gray-500 font-bold text-lg">{banner.titulo}</span>
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
