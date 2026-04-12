'use client';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCoverflow, Pagination } from 'swiper/modules';
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
      if (direction === 'prev') {
        swiperRef.current.swiper.slidePrev();
      } else {
        swiperRef.current.swiper.slideNext();
      }
    }
  };

  const activeIndex = planOrder.indexOf(showcasePlan);
  const isFirst = carouselIndex <= 0;
  const isLast = carouselIndex >= planOrder.length - 1;

  return (
    <div className="relative">
      <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Todos los Planes</h3>
      
      <div className="flex justify-center gap-2 mb-6">
        {planOrder.map((key, idx) => {
          const data = plansData[key]; if (!data) return null;
          const isActive = idx === activeIndex;
          return (
            <button
              key={key}
              className={`h-2 rounded-full transition-all duration-300 ${isActive ? '' : 'w-2 bg-gray-300'}`}
              style={{ 
                width: isActive ? '28px' : '8px',
                background: isActive ? data.cssColor : '#d1d5db'
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
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-30 w-10 h-10 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:text-blue-500 dark:hover:border-[var(--brand-sky)] dark:hover:text-[var(--brand-sky)] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
              onClick={() => handleNavigation('prev')}
              disabled={isFirst}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button 
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-30 w-10 h-10 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:text-blue-500 dark:hover:border-[var(--brand-sky)] dark:hover:text-[var(--brand-sky)] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
              onClick={() => handleNavigation('next')}
              disabled={isLast}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 12 9 18 15 6"/></svg>
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
              <div style={{ textAlign:'center', padding:'40px', color:'#9ca3af', fontSize:'14px', width:'100%' }}>No hay planes configurados aún.</div>
            </SwiperSlide>
          ) : (
            planOrder.map((key, idx) => {
              const isActive = idx === activeIndex;
              return (
                <SwiperSlide 
                  key={key} 
                  style={{ 
                    width: isMobile ? '200px' : '320px', 
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: Math.abs(idx - activeIndex) > 2 ? 0 : 1 - (Math.abs(idx - activeIndex) * 0.25),
                    transform: `scale(${1 - Math.abs(idx - activeIndex) * 0.18}) translateZ(${-(Math.abs(idx - activeIndex) * 80)}px)`,
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
                    offset={idx - activeIndex}
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
  offset: number;
}

function CarouselCard({ planKey, plansData, showcasePlan, currentPlan, claimedPlans, expanded, onSelect, onToggle, onFeatureClick, isActive, offset }: CardProps) {
  const data      = plansData[planKey]; if (!data) return null;
  const isCurrent = planKey === currentPlan;
  const planColor = data.cssColor ?? '#3b82f6';
  const lightBg1  = lightenColor(planColor, 0.75);
  const lightBg2  = lightenColor(planColor, 0.55);
  const lightBg3  = lightenColor(planColor, 0.35);
  const iconTextColor = data.accentColor ?? planColor;
  const showMax = data.features ? (expanded ? data.features.length : (data.compactVisibleCount ?? 5)) : 5;
  const carouselLimit = data.compactVisibleCount ?? 5;

  let priceNode: React.ReactNode;
  if (data.usePriceMode === false && data.priceText) {
    priceNode = <><span style={{ color:planColor, fontSize:'1.75rem', fontWeight:800 }}>{data.priceText}</span>{data.priceSubtext && <span className="text-sm text-gray-400 font-medium ml-1">{data.priceSubtext}</span>}</>;
  } else {
    const carouselPrice = (planKey === 'basic' && data.price === 0) ? 'GRATIS' : (!data.requiresPayment && data.price === 0) ? 'Prueba gratuita' : formatPrice(data.price, data.currency);
    priceNode = <><span style={{ fontSize:'1.75rem', fontWeight:800, color: isActive ? planColor : '#1f2937' }}>{carouselPrice}</span>{(data.price > 0 || data.requiresPayment) ? <span className="text-sm text-gray-400 font-medium ml-1">{data.period ?? '/mes'}</span> : (planKey !== 'basic' && !data.requiresPayment ? <span className="text-sm text-gray-400 font-medium ml-1">/6 meses</span> : null)}</>;
  }

  const borderStyle: React.CSSProperties = isActive
    ? { borderColor:planColor, boxShadow:`0 0 0 1px ${planColor}, 0 8px 25px ${hexToRgba(planColor, 0.45)}` }
    : { borderColor:'transparent', boxShadow:'0 4px 16px rgba(0,0,0,0.05)' };

  const rotateY = offset * (offset > 0 ? -38 : 38);
  const transform = offset !== 0 ? `rotateY(${rotateY}deg)` : undefined;

  return (
    <div 
      role="button"
      tabIndex={0}
      className={`bg-white dark:bg-[var(--bg-card)] rounded-2xl border-2 dark:border-[var(--border-subtle)] overflow-hidden cursor-pointer transition-all duration-300 ${isActive ? 'scale-95' : ''}`}
      style={{ 
        '--plan-color': planColor, 
        ...borderStyle,
        transform,
      } as React.CSSProperties}
      onClick={() => onSelect(planKey)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(planKey); }}
    >
      {data.showBgInCard && data.bgImage ? (
        <div style={{ 
          backgroundImage: `url('${data.bgImage}')`, 
          backgroundSize: data.bgImageFit === 'contain' ? 'contain' : 'cover', 
          backgroundPosition: data.bgImagePosition ?? 'center', 
          position:'relative', 
          overflow:'hidden',
          height: '140px',
        }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.55) 100%)', pointerEvents:'none' }} />
          {data.badge && <span style={{ position:'absolute', top:8, left:8, zIndex:2, fontSize:'9px', fontWeight:800, letterSpacing:'0.5px', color:'#fff', background:'rgba(0,0,0,0.35)', padding:'2px 7px', borderRadius:'20px', backdropFilter:'blur(4px)' }}>{data.badge}</span>}
          <span style={{ position:'absolute', bottom:8, left:10, zIndex:2, fontSize:'29px', fontWeight:800, color:'#fff', textShadow:'0 1px 6px rgba(0,0,0,0.7)', letterSpacing:'0.3px' }}>{data.name}</span>
          <div style={{ position:'absolute', top:8, right:8, zIndex:2, color:'rgba(255,255,255,0.85)', filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }} 
                // ✅ SEGURO: getPlanIconSvg() retorna SVG hardcoded interno
                // availableIcons es un objeto hardcoded, NO viene de user input
                dangerouslySetInnerHTML={{ __html: getPlanIconSvg(planKey, 20, plansData) }} />
        </div>
      ) : (
        <div style={{ 
          background: `linear-gradient(135deg,${lightBg1} 0%,${lightBg2} 50%,${lightBg3} 100%)`,
          padding: '20px',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <span style={{ color:iconTextColor, fontSize:'18px', fontWeight:800 }}>{data.name}</span>
          <div style={{ color:iconTextColor }} 
            // ✅ SEGURO: getPlanIconSvg() retorna SVG hardcoded interno
            dangerouslySetInnerHTML={{ __html: getPlanIconSvg(planKey, 24, plansData) }} />
        </div>
      )}
      <div className="p-5">
        <div className="mb-4">
          {priceNode}
        </div>
        {planKey === 'basic' && data.price === 0 && <div className="text-xs text-gray-500 mb-2"><span>Única vez</span></div>}
        {data.enableClaimLock && <div className="text-xs text-gray-500 mb-2"><span>Solo disponible una única vez</span></div>}
        {data.priceAnnual > 0 && !data.enableClaimLock && data.usePriceMode !== false && <div className="text-xs text-gray-500 mb-2"><span>{formatPrice(data.priceAnnual, data.currency)}{data.periodAnnual ?? '/año'}</span></div>}
        <div className="space-y-2">
          {(data.features ?? []).slice(0, showMax).map((f, i) => (
            <div 
              role="button"
              tabIndex={0}
              key={`${planKey}-cf-${i}-${(f.text ?? '').slice(0,8)}`} 
              className={`flex items-center gap-2 text-xs cursor-pointer ${f.active ? 'text-gray-700' : 'text-gray-300'}`}
              onClick={e => { e.stopPropagation(); onFeatureClick(planKey); }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onFeatureClick(planKey); } }}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${f.active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{f.active ? '✓' : '✕'}</span>
              <span className={f.active ? '' : 'line-through'}>{f.text}</span>
            </div>
          ))}
          {(data.features?.length ?? 0) > carouselLimit && (
            <button 
              className="text-xs text-blue-500 font-medium hover:text-blue-600 cursor-pointer"
              onClick={e => { e.stopPropagation(); onToggle(planKey); }}
            >
              {expanded ? 'Ver menos' : `+${(data.features?.length ?? 0) - carouselLimit} beneficios más`}
            </button>
          )}
        </div>
        {isCurrent && <div className="mt-3 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg text-center">Tu plan actual</div>}
        {data.enableClaimLock && claimedPlans.includes(planKey) && !isCurrent && <div className="mt-3 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg text-center">Ya reclamado</div>}
      </div>
    </div>
  );
}
