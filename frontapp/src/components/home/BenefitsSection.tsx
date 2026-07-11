'use client';

import Image from 'next/image';
import {
  Heart,
  Store,
  Tag,
  ShieldCheck,
  Zap,
  Clock,
  Globe,
} from 'lucide-react';
import { Beneficio } from '@/types/public';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  storefront: Store,
  tag: Tag,
  'shield-check': ShieldCheck,
  lightning: Zap,
  clock: Clock,
  globe: Globe,
};

const iconColorMap: Record<string, string> = {
  heart: 'text-sky-600',
  storefront: 'text-emerald-600',
  tag: 'text-amber-600',
  'shield-check': 'text-violet-600',
  lightning: 'text-lime-600',
  clock: 'text-slate-600',
  globe: 'text-rose-600',
};

interface BenefitsSectionProps {
  beneficios: Beneficio[];
}

export default function BenefitsSection({ beneficios }: BenefitsSectionProps) {
  if (beneficios.length === 0) return null;
  const allItems = [...beneficios, ...beneficios];
  return (
    <section className="w-full my-8">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes infiniteScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          animation: infiniteScroll 25s linear infinite;
        }
        .bg-fixed-panel-beneficios {
          background-size: cover;
          background-repeat: no-repeat;
          position: absolute;
          background-attachment: fixed;
          background-position: left center;
        }
        @media (min-width: 500px) and (max-width: 1023px) {
          .bg-fixed-panel-beneficios {
            position: fixed !important;
            background-attachment: scroll !important;
            background-position: -300px bottom !important;
          }
        }
        @media (max-width: 499px) {
          .bg-fixed-panel-beneficios {
            position: fixed !important;
            background-attachment: scroll !important;
            background-position: -300px bottom !important;
          }
        }
      `}} />

      <div className="px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Beneficios</h2>
      </div>

      <div
        className="relative w-full h-[240px] md:h-[340px] overflow-hidden group"
        style={{ backgroundColor: '#8BC34A', clipPath: 'inset(0px)', zIndex: 1 }}
      >
        <div
          className="absolute inset-0 z-0 bg-fixed-panel-beneficios bg-cover"
          style={{ backgroundImage: "url('/img/Inicio/11/1.png')" }}
        />

        <div
          className="absolute inset-0 z-10 flex items-center"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          }}
        >
          <div
            className="flex items-center animate-infinite-scroll"
            style={{ width: 'max-content' }}
          >
            {allItems.map((beneficio, index) => {
              const relativeIndex = index % beneficios.length;
              const imageNum = (relativeIndex % 7) + 2;

              return (
                <div
                  key={`${beneficio.id}-${index}`}
                  className="flex flex-col items-center justify-center text-center w-[150px] md:w-[270px] mx-1 flex-shrink-0 cursor-default"
                >
                  <div className="w-32 h-32 md:w-64 md:h-64 flex items-center justify-center mb-2 md:mb-4 transition-transform duration-300 hover:scale-105 relative">
                    <Image
                      src={`/img/Inicio/11/${imageNum}.png`}
                      alt="Beneficio"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 128px, 256px"
                      priority={index < 6}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}