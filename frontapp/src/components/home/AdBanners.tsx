'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { BannersPub } from '@/types/public';

interface Slide {
  id: number;
  imagenes: string[];
}

function MedianoSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full">
            <div className="grid grid-cols-2 gap-4 px-4">
              {slide.imagenes.filter(Boolean).map((img, i) => (
                <div key={`${slide.id}-${i}`} className="rounded-[18px] overflow-hidden shadow-md">
                  <Image src={img || '/img/no-image.png'} alt={`Banner ${slide.id}`} width={600} height={250} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-sky-500' : 'w-2 bg-gray-300'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PequenoSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const maxIndex = Math.max(0, images.length - 3);

  useEffect(() => {
    if (images.length <= 3) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, maxIndex]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative overflow-hidden px-2">
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${current * 33.333333}%)` }}
      >
        {images.map((img, i) => (
          <div
            key={`${img}-${i}`}
            className="flex-shrink-0 w-1/3 px-2"
          >
            <div className="rounded-[18px] overflow-hidden shadow-md">
              <Image
                src={img || '/img/no-image.png'}
                alt="Banner"
                width={380}
                height={200}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        ))}
      </div>
      {images.length > 3 && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: images.length - 2 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-sky-500' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AdBannersProps {
  bannersPub: BannersPub;
}

export default function AdBanners({ bannersPub }: AdBannersProps) {
  // 1er Carrusel: banner_publicitario_1y3 (1.1, 1.2, 1.3, 1.4)
  const medianos1 = [
    {
      id: 1,
      imagenes: [
        '/img/banner_publicitario_1y3/1.1.png',
        '/img/banner_publicitario_1y3/1.2.png',
      ],
    },
    {
      id: 2,
      imagenes: [
        '/img/banner_publicitario_1y3/1.3.png',
        '/img/banner_publicitario_1y3/1.4.png',
      ],
    },
  ];

  // 2do Carrusel: banner_publicitario_2y4 (2.1, 2.2, 2.3)
  const pequenos1 = [
    '/img/banner_publicitario_2y4/2.1.png',
    '/img/banner_publicitario_2y4/2.2.png',
    '/img/banner_publicitario_2y4/2.3.png',
    '/img/banner_publicitario_2y4/2.4.png'
  ];

  // 3er Carrusel: banner_publicitario_1y3 (3.1, 3.2, 3.3)
  const medianos2 = [
    {
      id: 3,
      imagenes: [
        '/img/banner_publicitario_1y3/3.1.png',
        '/img/banner_publicitario_1y3/3.2.png',
      ],
    },
    {
      id: 4,
      imagenes: [
        '/img/banner_publicitario_1y3/3.3.png',
          
      ],
    },
  ];

  // 4to Carrusel: banner_publicitario_2y4 (4.1, 4.2, 4.3)
  const pequenos2 = [
    '/img/banner_publicitario_2y4/4.1.png',
    '/img/banner_publicitario_2y4/4.2.png',
    '/img/banner_publicitario_2y4/4.3.png',
    '/img/banner_publicitario_2y4/4.4.png'
  ];

  return (
    <section className="mt-10 space-y-6 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Banners publicitarios</h2>
      </div>

      <MedianoSlider slides={medianos1} />
      <PequenoSlider images={pequenos1} />
      <MedianoSlider slides={medianos2} />
      <PequenoSlider images={pequenos2} />
    </section>
  );
}
