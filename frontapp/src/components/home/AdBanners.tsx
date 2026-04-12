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

  useEffect(() => {
    if (images.length <= 3) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 3) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  const getVisibleImages = () => {
    if (images.length <= 3) return images;
    const visible = images.slice(current, current + 3);
    if (visible.length < 3) {
      return [...visible, ...images.slice(0, 3 - visible.length)];
    }
    return visible;
  };

  return (
    <div className="relative overflow-hidden">
      <div className="grid grid-cols-3 gap-4 px-4">
        {getVisibleImages().filter(Boolean).map((img, i) => (
          <div key={`${img}-${i}`} className="rounded-[18px] overflow-hidden shadow-md">
            <Image src={img || '/img/no-image.png'} alt="Banner" width={380} height={200} className="w-full h-auto object-cover" />
          </div>
        ))}
      </div>
      {images.length > 3 && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: Math.ceil(images.length / 3) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i * 3)}
              className={`h-2 rounded-full transition-all ${current >= i * 3 && current < (i + 1) * 3 ? 'w-6 bg-sky-500' : 'w-2 bg-gray-300'}`}
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
  const medianos1 = bannersPub.sliderMedianos1 || [];
  const pequenos1 = bannersPub.pequenos1 || [];
  const medianos2 = bannersPub.sliderMedianos2 || [];
  const pequenos2 = bannersPub.pequenos2 || [];

  if (medianos1.length === 0 && pequenos1.length === 0 && medianos2.length === 0 && pequenos2.length === 0) {
    return null;
  }

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
