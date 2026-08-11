'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Banner {
  url: string;
  titulo: string;
  link?: string;
  orientation?: 'horizontal' | 'vertical';
}

interface AdBannersCarouselProps {
  banners?: Banner[];
  maxBanners?: number;
  startIndex?: number;
  vertical?: boolean;
  fallback?: number;
  /**
   * Cuando se pasa, filtra `banners` por su `orientation` ANTES de aplicar
   * startIndex/maxBanners, en vez de repartir la lista completa de banners
   * en bloques posicionales sin importar su forma real. Los banners sin
   * `orientation` (subidos antes de este campo) cuentan como 'horizontal'
   * para no perder banners ya existentes.
   */
  filterOrientation?: 'horizontal' | 'vertical';
  /**
   * Alto real (px) de una fila de la grilla de productos/servicios vecina
   * (medido por ScrollableSection). En modo vertical, cada slide se fija a
   * esta altura para que el slide 1 coincida con la fila 1 y el slide 2 con
   * la fila 2, en vez de estirarse o usar un alto fijo arbitrario.
   */
  rowHeight?: number;
}

const DEFAULT_VERTICAL_ROW_HEIGHT = 427; // (866 - 12 de espacio) / 2, alto original por slide
// Alto total fijo del banner vertical cuando no se le pasa `rowHeight` (diseño original).
export const VERTICAL_BANNER_FIXED_HEIGHT = DEFAULT_VERTICAL_ROW_HEIGHT * 2 + 12;

const LYRIUM_DEFAULTS: Banner[] = [
  { url: '/img/BANNER_GRANDE_INICIO/1.png', titulo: 'Lyrium', link: '/' },
  { url: '/img/BANNER_GRANDE_INICIO/5.png', titulo: 'Lyrium', link: '/' },
  { url: '/img/BANNER_GRANDE_INICIO/6.png', titulo: 'Lyrium', link: '/' },
];

function padWithDefaults(banners: Banner[], target: number): Banner[] {
  const result = [...banners];
  for (let i = 0; result.length < target; i++) {
    result.push({ ...LYRIUM_DEFAULTS[i % LYRIUM_DEFAULTS.length] });
  }
  return result;
}

export default function AdBannersCarousel({ banners = [], maxBanners = 4, startIndex = 0, vertical = false, fallback, filterOrientation, rowHeight }: AdBannersCarouselProps) {
  const pool = filterOrientation
    ? banners.filter((b) => (b.orientation || 'horizontal') === filterOrientation)
    : banners;
  const visible = pool.slice(startIndex, startIndex + maxBanners);
  const allBanners: Banner[] = fallback && visible.length < fallback
    ? padWithDefaults(visible, fallback)
    : visible;
  if (!allBanners.length) return null;

  if (vertical) {
    const vSlidesPerView = 2;
    const canNavigate = allBanners.length > vSlidesPerView;
    // Alto fijo total = 2 filas reales (slide 1 = fila 1, slide 2 = fila 2) + el
    // espacio entre ellas. Si aún no se midió la fila vecina, usa el alto original.
    const singleRowHeight = rowHeight ?? DEFAULT_VERTICAL_ROW_HEIGHT;
    const totalHeight = singleRowHeight * vSlidesPerView + 12 * (vSlidesPerView - 1);
    return (
      <div className="w-full" style={{ height: totalHeight }}>
        <Swiper
          modules={canNavigate ? [Navigation, Pagination, Autoplay] : []}
          direction="vertical"
          spaceBetween={12}
          slidesPerView={vSlidesPerView}
          {...(canNavigate ? {
            navigation: true,
            pagination: { clickable: true },
            autoplay: { delay: 5000, disableOnInteraction: false },
          } : {})}
          loop={canNavigate}
          className="w-full h-full rounded-2xl [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:scale-[0.4] [&_.swiper-button-prev]:scale-[0.4] [&_.swiper-pagination-bullet]:bg-white/60 [&_.swiper-pagination-bullet-active]:bg-white"
          style={{ height: totalHeight }}
        >
          {allBanners.map((banner, idx) => (
            <SwiperSlide key={idx} className="h-full">
              <Link
                href={banner.link || '#'}
                className="group block relative w-full h-full rounded-2xl overflow-hidden"
              >
                {banner.url ? (
                  <Image
                    src={banner.url}
                    alt={banner.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="300px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <span className="text-gray-400 dark:text-gray-500 font-bold text-lg">{banner.titulo}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-white font-semibold text-xs drop-shadow-lg block leading-tight">
                      {banner.titulo}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/35 backdrop-blur-sm rounded-full px-2 py-1 pointer-events-none select-none">
                  <Image
                    src="/img/iconologo.png"
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain opacity-90"
                  />
                  <span className="text-white text-[10px] font-bold tracking-wide drop-shadow">Lyrium</span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  const hSlidesPerView = 1;
  const canNavigate = allBanners.length > hSlidesPerView;
  return (
    <Swiper
      modules={canNavigate ? [Navigation, Pagination, Autoplay] : []}
      spaceBetween={16}
      slidesPerView={hSlidesPerView}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      {...(canNavigate ? {
        navigation: true,
        pagination: { clickable: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
      } : {})}
      loop={canNavigate}
      className="w-full rounded-2xl [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:scale-[0.5] [&_.swiper-button-prev]:scale-[0.5] [&_.swiper-pagination-bullet]:bg-white/60 [&_.swiper-pagination-bullet-active]:bg-white"
    >
      {allBanners.map((banner, idx) => (
        <SwiperSlide key={idx}>
          <Link
            href={banner.link || '#'}
            className="group block relative aspect-[16/9] rounded-2xl overflow-hidden"
          >
            {banner.url ? (
              <Image
                src={banner.url}
                alt={banner.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <span className="text-gray-400 dark:text-gray-500 font-bold text-lg">{banner.titulo}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-white font-semibold text-sm drop-shadow-lg">
                  {banner.titulo}
                </span>
              </div>
            </div>
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-black/35 backdrop-blur-sm rounded-full px-2.5 py-1.5 pointer-events-none select-none">
              <Image
                src="/img/iconologo.png"
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 object-contain opacity-90"
              />
              <span className="text-white text-xs font-bold tracking-wide drop-shadow">Lyrium</span>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
