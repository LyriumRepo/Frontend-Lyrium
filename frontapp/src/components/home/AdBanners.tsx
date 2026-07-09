'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { BannersPub } from '@/types/public';

interface Slide {
  id: number;
  imagenes: string[];
}

function MedianoSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const update = () => {
      if (window.innerWidth < 540) setItemsPerView(1);
      else setItemsPerView(2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, images.length - itemsPerView);

  useEffect(() => {
    if (images.length <= itemsPerView) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, maxIndex, itemsPerView]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative overflow-hidden px-2">
      <div
        className="flex transition-transform duration-700"
        style={
          isMounted
            ? { transform: `translateX(-${current * (100 / itemsPerView)}%)` }
            : {}
        }
      >
        {images.map((img, i) => (
          <div
            key={`${img}-${i}`}
            className="flex-shrink-0 w-full min-[540px]:w-1/2 snap-start px-2"
          >
            <div className="rounded-[18px] overflow-hidden shadow-md">
              <Image
                src={img || '/img/no-image.png'}
                alt="Banner"
                width={600}
                height={250}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        ))}
      </div>
      {images.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: images.length - itemsPerView + 1 }).map((_, i) => (
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

function PequenoSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const update = () => {
      if (window.innerWidth < 540) setItemsPerView(1);
      else setItemsPerView(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, images.length - itemsPerView);

  useEffect(() => {
    if (images.length <= itemsPerView) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, maxIndex, itemsPerView]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative overflow-hidden px-2">
      <div
        className="flex transition-transform duration-700"
        style={
          isMounted
            ? { transform: `translateX(-${current * (100 / itemsPerView)}%)` }
            : {}
        }
      >
        {images.map((img, i) => (
          <div
            key={`${img}-${i}`}
            className="flex-shrink-0 w-full min-[540px]:w-1/3 snap-start px-2"
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
      {images.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: images.length - itemsPerView + 1 }).map((_, i) => (
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
    '/img/banner_publicitario_1y3/1.1.png',
    '/img/banner_publicitario_1y3/1.2.png',
    '/img/banner_publicitario_1y3/1.3.png',
    '/img/banner_publicitario_1y3/1.4.png',
  ];
  // 2do Carrusel: banner_publicitario_2y4 (2.1, 2.2, 2.3, 2.4)
  const pequenos1 = [
    '/img/banner_publicitario_2y4/2.1.png',
    '/img/banner_publicitario_2y4/2.2.png',
    '/img/banner_publicitario_2y4/2.3.png',
    '/img/banner_publicitario_2y4/2.4.png',
  ];
  // 3er Carrusel: banner_publicitario_1y3 (3.1, 3.2, 3.3)
  const medianos2 = [
    '/img/banner_publicitario_1y3/3.1.png',
    '/img/banner_publicitario_1y3/3.2.png',
    '/img/banner_publicitario_1y3/3.3.png',
  ];
  // 4to Carrusel: banner_publicitario_2y4 (4.1, 4.2, 4.3, 4.4)
  const pequenos2 = [
    '/img/banner_publicitario_2y4/4.1.png',
    '/img/banner_publicitario_2y4/4.2.png',
    '/img/banner_publicitario_2y4/4.3.png',
    '/img/banner_publicitario_2y4/4.4.png',
  ];

  return (
    <section className="mt-10 w-full overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Banners publicitarios</h2>
      </div>
      <div className="w-[1600px] max-w-full px-4 md:px-8 space-y-6">
        <MedianoSlider images={medianos1} /> 
        <PequenoSlider images={pequenos1} />
        <MedianoSlider images={medianos2} />  
        <PequenoSlider images={pequenos2} />
      </div>
    </section>
  );
}
