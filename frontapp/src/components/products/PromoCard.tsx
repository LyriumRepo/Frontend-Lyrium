'use client';

import Link from 'next/link';
import { Leaf, ShieldCheck, Tag, Star, Store, Sparkles, Heart, Truck, Gift, Megaphone, type LucideIcon } from 'lucide-react';

interface PromoVariant {
  icon: LucideIcon;
  title: string;
  desc: string;
  bg: string;
  href: string;
  badge?: string;
}

const PROMO_VARIANTS: PromoVariant[] = [
  {
    icon: Sparkles,
    title: 'Descubre productos naturales',
    desc: 'Explora +500 tiendas biologicas en Lyrium',
    bg: 'from-emerald-500 to-teal-500',
    href: '/tiendasregistradas',
    badge: 'Novedad',
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura garantizada',
    desc: 'Tus compras protegidas en cada pedido',
    bg: 'from-sky-500 to-indigo-500',
    href: '/',
    badge: 'Lyrium',
  },
  {
    icon: Tag,
    title: 'Ofertas exclusivas',
    desc: 'Los mejores descuentos del mes',
    bg: 'from-amber-500 to-orange-500',
    href: '/tiendasregistradas',
    badge: 'Promo',
  },
  {
    icon: Star,
    title: 'Tiendas destacadas',
    desc: 'Conoce a nuestros mejores vendedores',
    bg: 'from-violet-500 to-purple-500',
    href: '/tiendasregistradas',
    badge: 'Top',
  },
  {
    icon: Store,
    title: 'Vende en Lyrium',
    desc: 'Abre tu tienda online hoy gratis',
    bg: 'from-rose-500 to-pink-500',
    href: '/registro',
    badge: 'Emprende',
  },
  {
    icon: Heart,
    title: 'Lo que amas, natural',
    desc: 'Productos organicos directo a tu hogar',
    bg: 'from-pink-500 to-rose-500',
    href: '/tiendasregistradas',
    badge: 'Bio',
  },
  {
    icon: Truck,
    title: 'Envio a todo el pais',
    desc: 'Recibe en la comodidad de tu hogar',
    bg: 'from-cyan-500 to-blue-500',
    href: '/tiendasregistradas',
    badge: 'Envio',
  },
  {
    icon: Gift,
    title: 'Regalos que inspiran',
    desc: 'Sorprende con detalles unicos y naturales',
    bg: 'from-fuchsia-500 to-purple-500',
    href: '/tiendasregistradas',
    badge: 'Ideas',
  },
  {
    icon: Leaf,
    title: 'Vive verde con Lyrium',
    desc: 'Sostenibilidad en cada compra',
    bg: 'from-lime-500 to-emerald-500',
    href: '/',
    badge: 'Eco',
  },
  {
    icon: Megaphone,
    title: 'Promociones de la semana',
    desc: 'No te pierdas nuestras ofertas',
    bg: 'from-red-500 to-rose-500',
    href: '/tiendasregistradas',
    badge: 'Limitado',
  },
];

interface PromoCardProps {
  variant?: 'product' | 'service';
  index?: number;
}

function ProductStylePromo({ promo, index }: { promo: PromoVariant; index: number }) {
  const Icon = promo.icon;
  return (
    <Link href={promo.href} className="block h-full">
      <article className="group flex flex-col rounded-3xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] transition-all duration-200 hover:border-sky-200 dark:hover:border-[var(--brand-sky)] hover:shadow-[0_18px_52px_rgba(2,132,199,.10)] dark:hover:shadow-[0_18px_52px_rgba(2,132,199,0.15)] hover:-translate-y-0.5 h-full">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[var(--bg-muted)] dark:to-[var(--bg-secondary)]">
          <div className={`absolute inset-0 bg-gradient-to-br ${promo.bg} opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-300`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center gap-2 sm:gap-3">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${promo.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-[var(--text-secondary)] leading-tight max-w-[140px] sm:max-w-[160px]">
              {promo.title}
            </p>
          </div>

          {promo.badge && (
            <div className="absolute top-1.5 right-0 sm:top-4 z-10">
              <div className={`flex items-center justify-center text-center leading-tight text-white w-[46px] h-[24px] sm:w-[100px] sm:h-[50px] pl-1 pr-0.5 sm:pl-2 sm:pr-1 rounded-l-full shadow-lg bg-gradient-to-r ${promo.bg}`}>
                <span className="text-[7px] sm:text-[14px] font-extrabold uppercase tracking-wide line-clamp-1">
                  {promo.badge}
                </span>
              </div>
            </div>
          )}

          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/85 dark:bg-[var(--bg-card)]/85 border border-sky-100 dark:border-[var(--border-subtle)] backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] shadow-sm">
            <Leaf className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Lyrium
          </span>

          <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-50 group-hover:opacity-70 transition-opacity">
            <img src="/img/iconologo.png" alt="" className="w-[90%] h-[90%] object-contain rounded-full" />
          </div>
        </div>

        <div className="p-2 sm:p-4 flex flex-col gap-1 sm:gap-2 flex-1">
          <p className="text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 min-h-[34px] sm:min-h-[42px] text-[13px] sm:text-sm font-medium">
            {promo.desc}
          </p>

          <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
            <span className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${promo.bg} text-white inline-flex items-center gap-1`}>
              <Icon className="w-3 h-3" /> Lyrium
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <span className="py-1.5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white border border-white/20 text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/25 dark:shadow-[#8FC3A1]/70 transition">
              {promo.badge === 'Emprende' ? 'Crear tienda' : 'Explorar'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ServiceStylePromo({ promo, index }: { promo: PromoVariant; index: number }) {
  const Icon = promo.icon;
  return (
    <Link href={promo.href} className="block h-full">
      <div className="group bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-sky-200 dark:hover:border-[#4A7C59]/40 transition-all duration-200 flex flex-col h-full">
        <div className={`relative h-28 sm:h-36 overflow-hidden bg-gradient-to-br ${promo.bg}`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <p className="text-white/90 text-xs sm:text-sm font-bold drop-shadow-lg max-w-[160px] px-2">
              {promo.title}
            </p>
          </div>

          {promo.badge && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/25 backdrop-blur-sm text-white text-xs font-bold rounded-full">
              {promo.badge}
            </span>
          )}

          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/35 backdrop-blur-sm rounded-full px-2 py-1 pointer-events-none select-none">
            <img src="/img/iconologo.png" alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain opacity-90" />
            <span className="text-white text-[10px] font-bold tracking-wide drop-shadow">Lyrium</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 flex-1">
          <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight">
            {promo.desc}
          </p>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-[var(--text-secondary)] mt-auto">
            <span className="flex items-center gap-1">
              <Icon className="w-3.5 h-3.5" />
              Lyrium
            </span>
          </div>

          <span className="block w-full text-center py-2 rounded-xl bg-sky-50 dark:bg-[var(--pd-accent2)]/20 text-sky-600 dark:text-[var(--pd-accent2)] text-xs font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white dark:hover:bg-[var(--pd-accent2)] dark:hover:text-white transition-all mt-1">
            <span className="flex items-center justify-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {promo.badge === 'Emprende' ? 'Crear tienda' : 'Explorar'}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PromoCard({ variant = 'product', index = 0 }: PromoCardProps) {
  const promo = PROMO_VARIANTS[index % PROMO_VARIANTS.length];

  if (variant === 'service') {
    return <ServiceStylePromo promo={promo} index={index} />;
  }
  return <ProductStylePromo promo={promo} index={index} />;
}
