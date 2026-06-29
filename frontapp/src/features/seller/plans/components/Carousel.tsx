'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCoverflow } from 'swiper/modules';
import { hexToRgba, lightenColor, formatPrice } from '@/features/seller/plans/lib/helpers';
import { availableIcons } from '@/features/seller/plans/lib/icons';
import type { PlansMap } from '@/features/seller/plans/types';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function getPlanIconSvg(planKey: string, size: number, plansData: PlansMap): string {
  const data = plansData[planKey];
  const iconKey = (data?.timelineIcon && availableIcons[data.timelineIcon]) ? data.timelineIcon : 'star';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${availableIcons[iconKey]}</svg>`;
}

interface Props {
  planOrder: string[]; plansData: PlansMap; showcasePlan: string;
  carouselIndex: number; currentPlan: string; claimedPlans: string[];
  expandedCards: Record<string, boolean>;
  onSelect: (plan: string) => void;
  onStep: (delta: number) => void;
  onToggleCard: (key: string) => void;
  onFeatureClick: (key: string) => void;
}

export default function Carousel({ planOrder, plansData, showcasePlan, carouselIndex, currentPlan, claimedPlans, expandedCards, onSelect, onStep, onToggleCard, onFeatureClick }: Props) {
  const swiperRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideTo(carouselIndex, 0, false);
    }
  }, [carouselIndex]);

  const handleSlideChange = (swiper: any) => {
    onStep(swiper.activeIndex - carouselIndex);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (swiperRef.current?.swiper) {
      if (direction === 'prev') swiperRef.current.swiper.slidePrev();
      else swiperRef.current.swiper.slideNext();
    }
  };

  const activeIndex = planOrder.indexOf(showcasePlan);
  const isFirst = carouselIndex <= 0;
  const isLast = carouselIndex >= planOrder.length - 1;

  return (
    <div className="relative mt-8">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center mb-6 uppercase tracking-wider">Todos los Planes</h3>

      <div className="flex justify-center gap-2 mb-6">
        {planOrder.map((key, idx) => {
          const data = plansData[key]; if (!data) return null;
          const isActive = idx === activeIndex;
          return (
            <button
              key={key}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: isActive ? '28px' : '8px',
                background: isActive ? (data.cssColor || '#14b8a6') : '#d1d5db'
              }}
              onClick={() => onSelect(key)}
            />
          );
        })}
      </div>

      <div className="relative" style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}>
        {planOrder.length > 1 && (
          <>
            <button
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-30 w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-black/5 ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
              onClick={() => handleNavigation('prev')}
              disabled={isFirst}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-30 w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-black/5 ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
              onClick={() => handleNavigation('next')}
              disabled={isLast}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        )}

        <Swiper
          ref={swiperRef}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          initialSlide={activeIndex}
          coverflowEffect={{
            rotate: 0,
            stretch: isMobile ? 60 : 100,
            depth: isMobile ? 200 : 280,
            modifier: 1,
            scale: 0.85,
            slideShadows: false,
          }}
          navigation={false}
          pagination={false}
          modules={[Navigation, EffectCoverflow]}
          className="plans-carousel"
          onSlideChange={handleSlideChange}
          style={{ overflow: 'visible' }}
        >
          {planOrder.length === 0 ? (
            <SwiperSlide style={{ width: '100%' }}>
              <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">No hay planes configurados aún.</div>
            </SwiperSlide>
          ) : (
            planOrder.map((key, idx) => {
              const isActive = idx === activeIndex;
              return (
                <SwiperSlide
                  key={key}
                  style={{
                    width: isMobile ? '200px' : '300px',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 20 - Math.abs(idx - activeIndex),
                  }}
                >
                  <CarouselCard
                    planKey={key}
                    plansData={plansData}
                    showcasePlan={showcasePlan}
                    currentPlan={currentPlan}
                    claimedPlans={claimedPlans}
                    expanded={!!expandedCards[key]}
                    onSelect={onSelect}
                    onToggle={onToggleCard}
                    onFeatureClick={onFeatureClick}
                    isActive={isActive}
                  />
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
      </div>
    </div>
  );
}

interface CardProps {
  planKey: string; plansData: PlansMap; showcasePlan: string; currentPlan: string;
  claimedPlans: string[]; expanded: boolean;
  onSelect: (k: string) => void; onToggle: (k: string) => void; onFeatureClick: (k: string) => void;
  isActive: boolean;
}

function CarouselCard({ planKey, plansData, showcasePlan, currentPlan, claimedPlans, expanded, onSelect, onToggle, onFeatureClick, isActive }: CardProps) {
  const data = plansData[planKey]; if (!data) return null;
  const isCurrent = planKey === currentPlan;
  const planColor = data.cssColor ?? '#14b8a6';
  const lightBg1 = lightenColor(planColor, 0.75);
  const lightBg2 = lightenColor(planColor, 0.55);
  const lightBg3 = lightenColor(planColor, 0.35);
  const iconTextColor = data.accentColor ?? planColor;
  const showMax = data.features ? (expanded ? data.features.length : (data.compactVisibleCount ?? 5)) : 5;
  const carouselLimit = data.compactVisibleCount ?? 5;

  let priceNode: React.ReactNode;
  if (data.usePriceMode === false && data.priceText) {
    priceNode = <><span className="text-xl font-extrabold" style={{ color: planColor }}>{data.priceText}</span>{data.priceSubtext && <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">{data.priceSubtext}</span>}</>;
  } else {
    const carouselPrice = (planKey === 'basic' && data.price === 0) ? 'GRATIS' : (!data.requiresPayment && data.price === 0) ? 'Gratis' : formatPrice(data.price, data.currency);
    priceNode = <><span className="text-xl font-extrabold" style={{ color: isActive ? planColor : undefined }}>{carouselPrice}</span>{(data.price > 0 || data.requiresPayment) ? <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">{data.period ?? '/mes'}</span> : (planKey !== 'basic' && !data.requiresPayment ? <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">/6 meses</span> : null)}</>;
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      role="button"
      tabIndex={0}
      className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 flex flex-col"
      style={{
        borderColor: isActive ? planColor : 'transparent',
        boxShadow: isActive
          ? `0 0 0 1px ${planColor}, 0 8px 25px ${hexToRgba(planColor, 0.15)}`
          : '0 4px 16px rgba(0,0,0,0.05)',
      }}
      onClick={() => onSelect(planKey)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(planKey); }}
    >
      {data.showBgInCard && data.bgImage ? (
        <div className="relative h-[120px] overflow-hidden" style={{
          backgroundImage: `url('${data.bgImage}')`,
          backgroundSize: data.bgImageFit === 'contain' ? 'contain' : (data.bgImageFit ?? 'cover'),
          backgroundPosition: data.bgImagePosition ?? 'center',
        }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {data.badge && (
            <span className="absolute top-2 left-2 z-10 text-[9px] font-bold text-white bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {data.badge}
            </span>
          )}
          <span className="absolute bottom-2 left-3 z-10 text-sm font-bold text-white drop-shadow-lg">{data.name}</span>
          <div className="absolute top-2 right-2 z-10 text-white/80 drop-shadow-lg"
            dangerouslySetInnerHTML={{ __html: getPlanIconSvg(planKey, 18, plansData) }} />
        </div>
      ) : (
        <div style={{
          background: `linear-gradient(135deg,${lightBg1} 0%,${lightBg2} 50%,${lightBg3} 100%)`,
          padding: '18px',
          height: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <span className="text-sm font-bold" style={{ color: iconTextColor }}>{data.name}</span>
          <div style={{ color: iconTextColor }}
            dangerouslySetInnerHTML={{ __html: getPlanIconSvg(planKey, 20, plansData) }} />
        </div>
      )}
      <div className="p-4">
        <div className="mb-3">{priceNode}</div>
        {planKey === 'basic' && data.price === 0 && <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Única vez</div>}
        {data.enableClaimLock && <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Solo disponible una única vez</div>}
        {data.priceAnnual > 0 && !data.enableClaimLock && data.usePriceMode !== false && <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">{formatPrice(data.priceAnnual, data.currency)}{data.periodAnnual ?? '/año'}</div>}

        <div className="space-y-1.5">
          {(data.features ?? []).slice(0, showMax).map((f, i) => (
            <div
              key={`${planKey}-cf-${i}-${(f.text ?? '').slice(0, 8)}`}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-1.5 text-[11px] cursor-pointer ${f.active ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
              onClick={e => { e.stopPropagation(); onFeatureClick(planKey); }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onFeatureClick(planKey); } }}
            >
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${
                f.active
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {f.active ? (
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </span>
              <span className={f.active ? '' : 'line-through'}>{f.text}</span>
            </div>
          ))}
          {(data.features?.length ?? 0) > carouselLimit && (
            <button
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              onClick={e => { e.stopPropagation(); onToggle(planKey); }}
            >
              {expanded ? 'Ver menos' : `+${(data.features?.length ?? 0) - carouselLimit} más`}
            </button>
          )}
        </div>

        {isCurrent && (
          <div className="mt-2 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-lg text-center border border-emerald-200 dark:border-emerald-700/30">
            Tu plan actual
          </div>
        )}
        {data.enableClaimLock && claimedPlans.includes(planKey) && !isCurrent && (
          <div className="mt-2 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-lg text-center border border-amber-200 dark:border-amber-700/30">
            Ya reclamado
          </div>
        )}
      </div>
    </motion.div>
  );
}
