'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Icon from '@/components/ui/Icon';

interface Banner {
  url: string;
  titulo?: string;
  link?: string;
}

interface SocialNetwork {
  key: 'instagram' | 'facebook' | 'whatsapp' | 'youtube' | 'twitter' | 'linkedin' | 'pinterest' | 'telegram' | 'web';
  url: string;
}

interface StoreBannerCarouselProps {
  banners?: Banner[];
  redes?: SocialNetwork[];
  autoPlay?: boolean;
  interval?: number;
  plan?: 'basic' | 'premium';
}

const defaultBanners: Banner[] = [
  { url: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 1' },
  { url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 2' },
  { url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 3' },
  { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1400&auto=format&fit=crop', titulo: 'Banner 4' },
];

const redesConfig: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: 'Instagram', color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', label: 'Instagram' },
  facebook: { icon: 'Facebook', color: 'bg-blue-600', label: 'Facebook' },
  whatsapp: { icon: 'MessageCircle', color: 'bg-green-500', label: 'WhatsApp' },
  youtube: { icon: 'Youtube', color: 'bg-red-600', label: 'YouTube' },
  twitter: { icon: 'Twitter', color: 'bg-sky-500', label: 'Twitter' },
  linkedin: { icon: 'Linkedin', color: 'bg-blue-700', label: 'LinkedIn' },
  pinterest: { icon: 'Pin', color: 'bg-red-600', label: 'Pinterest' },
  telegram: { icon: 'Send', color: 'bg-sky-500', label: 'Telegram' },
  web: { icon: 'Globe', color: 'bg-sky-600', label: 'Sitio Web' },
};

const maxBanners = (plan: string = 'premium') => plan === 'premium' ? 4 : 2;
const maxRedes = (plan: string = 'premium') => plan === 'premium' ? 10 : 6;

function SocialIcon({ name }: { name: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    Instagram: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    Facebook: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    MessageCircle: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891-5.967-11.663-11.074 0-8.275 8.196-8.275 16.145 0 5.132 3.396 9.88 8.127 11.758 1.19.23 2.252.373 3.339.373 3.912 0 5.715-4.02 5.715-8.912 0-4.388-3.099-7.376-5.862-7.376-4.192 0-5.89 2.782-5.89 2.782l-.087.08c-3.193 2.485-4.875 5.686-4.875 9.08 0 3.777 2.594 6.52 5.98 6.52 3.49 0 5.464-2.438 5.464-5.638 0-3.013-1.823-4.526-4.29-4.526-2.635 0-4.217 1.734-4.217 4.17 0 .764.303 1.635.858 2.173.375.363.427.544.313 1.073l-.253 1.57c-.416 1.773.16 3.692 1.848 3.692 2.725 0 5.013-3.962 5.013-8.335 0-5.734-4.456-9.738-10.655-9.738-7.91 0-11.13 5.94-11.13 11.155 0 .847.237 1.66.627 2.412l-1.407 5.348z"/>
      </svg>
    ),
    Youtube: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    Twitter: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    Linkedin: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    Pin: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
      </svg>
    ),
    Send: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
      </svg>
    ),
    Globe: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.779 6.043 2.072zm-10.516-.993c1.331 1.742 2.511 3.538 3.537 5.381-2.43.715-5.331 1.082-8.684 1.105.692-2.835 2.601-5.193 5.147-6.486zm-5.44 8.834l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48-1.432-1.719-2.296-3.927-2.296-6.334zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027.928 2.42 1.609 4.91 2.043 7.46-3.349 1.291-6.953.666-9.641-1.433zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.028 5.192-4.279 6.701z"/>
      </svg>
    ),
  };
  return <>{iconMap[name] || <Icon name={name as any} className="w-4 h-4" />}</>;
}

export default function StoreBannerCarousel({ 
  banners = defaultBanners, 
  redes = [],
  autoPlay = true, 
  interval = 5000,
  plan = 'premium'
}: StoreBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const bannersVisibles = banners.slice(0, maxBanners(plan));
  const redesVisibles = redes.slice(0, maxRedes(plan));

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + bannersVisibles.length) % bannersVisibles.length);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % bannersVisibles.length);
  };

  useEffect(() => {
    if (!autoPlay || bannersVisibles.length <= 1) return;
    
    const timer = setInterval(() => {
      next();
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, bannersVisibles.length]);

  if (bannersVisibles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
      {/* Slider del Banner */}
      <div className="flex-1 relative w-full aspect-[16/9] sm:aspect-[1600/585] rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-[var(--bg-card)]">
        {/* Slides */}
        <div 
          className="relative w-full h-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.8s ease',
          }}
        >
          {bannersVisibles.map((banner, idx) => (
            <div 
              key={idx}
              className="absolute inset-0 w-full h-full"
              style={{ left: `${idx * 100}%` }}
            >
              {banner.link ? (
                <Link href={banner.link} className="block w-full h-full">
                  <Image
                    src={banner.url}
                    alt={banner.titulo || `Banner ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 70vw"
                  />
                </Link>
              ) : (
                <Image
                  src={banner.url}
                  alt={banner.titulo || `Banner ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 70vw"
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {bannersVisibles.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all hover:scale-110 z-10"
              aria-label="Banner anterior"
            >
              <ChevronLeft className="w-5 h-5 text-sky-500" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all hover:scale-110 z-10"
              aria-label="Banner siguiente"
            >
              <ChevronRight className="w-5 h-5 text-sky-500" />
            </button>
          </>
        )}

        {/* Indicators */}
        {bannersVisibles.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {bannersVisibles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barra de Redes Sociales */}
      {redesVisibles.length > 0 && (
        <div className="flex flex-row sm:flex-col gap-2 p-2.5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg justify-center self-center order-first sm:order-last">
          {redesVisibles.map((red) => {
            const config = redesConfig[red.key];
            if (!config) return null;
            return (
              <a 
                key={red.key}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${config.color} flex items-center justify-center text-white shadow-md hover:scale-110 hover:shadow-lg transition-all duration-200`}
                title={config.label}
              >
                <SocialIcon name={config.icon} />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
