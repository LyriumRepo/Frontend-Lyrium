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
      <h3 className="text-xl font-bold text-[var(--text-primary,#1f2937)] mb-5 text-center">Todos los Planes</h3>
      
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
  const hasBgImage = !!(data.showBgInCard && data.bgImage);

  let priceNode: React.ReactNode;
  if (data.usePriceMode === false && data.priceText) {
    priceNode = (
      <>
        <span style={{ color: hasBgImage ? '#fff' : planColor, fontSize:'1.75rem', fontWeight:800 }}>{data.priceText}</span>
        {data.priceSubtext && <span style={{ color: hasBgImage ? 'rgba(255,255,255,0.6)' : undefined }} className="text-sm text-gray-400 font-medium ml-1">{data.priceSubtext}</span>}
      </>
    );
  } else {
    const carouselPrice = (planKey === 'basic' && data.price === 0) ? 'GRATIS' : (!data.requiresPayment && data.price === 0) ? 'Prueba gratuita' : formatPrice(data.price, data.currency);
    const inactiveColor = hasBgImage ? 'rgba(255,255,255,0.88)' : '#1f2937';
    const periodColor   = hasBgImage ? 'rgba(255,255,255,0.55)' : undefined;
    priceNode = (
      <>
        <span style={{ fontSize:'1.75rem', fontWeight:800, color: isActive ? planColor : inactiveColor }}>{carouselPrice}</span>
        {(data.price > 0 || data.requiresPayment)
          ? <span style={{ color: periodColor }} className="text-sm text-gray-400 font-medium ml-1">{data.period ?? '/mes'}</span>
          : (planKey !== 'basic' && !data.requiresPayment ? <span style={{ color: periodColor }} className="text-sm text-gray-400 font-medium ml-1">/6 meses</span> : null)
        }
      </>
    );
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
      className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${isActive ? 'scale-95' : ''}`}
      style={{
        '--plan-color': planColor,
        ...borderStyle,
        transform,
        position: 'relative',
        ...(hasBgImage ? {} : { background: '#fff' }),
      } as React.CSSProperties}
      onClick={() => onSelect(planKey)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(planKey); }}
    >
      {/* Imagen de fondo de toda la tarjeta */}
      {hasBgImage && (
        <>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url('${data.bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }} />
          {/* Overlay degradado para legibilidad */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.62) 55%, rgba(0,0,0,0.82) 100%)',
          }} />
        </>
      )}

      {/* Contenido sobre la imagen */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Cabecera */}
        <div style={{
          padding: '18px 18px 12px',
          background: hasBgImage ? 'transparent' : `linear-gradient(135deg,${lightBg1} 0%,${lightBg2} 50%,${lightBg3} 100%)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            {data.badge && (
              <span style={{
                display: 'inline-block', fontSize: '9px', fontWeight: 800,
                letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '20px', marginBottom: '6px',
                color: hasBgImage ? '#fff' : iconTextColor,
                background: hasBgImage ? 'rgba(255,255,255,0.2)' : hexToRgba(planColor, 0.15),
                backdropFilter: hasBgImage ? 'blur(4px)' : undefined,
              }}>{data.badge}</span>
            )}
            <div style={{
              fontSize: '22px', fontWeight: 800, letterSpacing: '0.3px',
              color: hasBgImage ? '#fff' : iconTextColor,
              textShadow: hasBgImage ? '0 1px 8px rgba(0,0,0,0.5)' : undefined,
            }}>{data.name}</div>
          </div>
          <div style={{
            color: hasBgImage ? 'rgba(255,255,255,0.9)' : iconTextColor,
            filter: hasBgImage ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' : undefined,
            marginTop: '4px',
          }}
            // ✅ SEGURO: getPlanIconSvg() retorna SVG hardcoded interno
            dangerouslySetInnerHTML={{ __html: getPlanIconSvg(planKey, 22, plansData) }}
          />
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '0 18px 18px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: hasBgImage ? '#fff' : undefined }}>{priceNode}</div>
            {planKey === 'basic' && data.price === 0 && (
              <div style={{ fontSize: '11px', color: hasBgImage ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: '2px' }}>Única vez</div>
            )}
            {data.enableClaimLock && (
              <div style={{ fontSize: '11px', color: hasBgImage ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: '2px' }}>Solo disponible una única vez</div>
            )}
            {data.priceAnnual > 0 && !data.enableClaimLock && data.usePriceMode !== false && (
              <div style={{ fontSize: '11px', color: hasBgImage ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: '2px' }}>{formatPrice(data.priceAnnual, data.currency)}{data.periodAnnual ?? '/año'}</div>
            )}
          </div>

          <div className="space-y-2">
            {(data.features ?? []).slice(0, showMax).map((f, i) => (
              <div
                role="button"
                tabIndex={0}
                key={`${planKey}-cf-${i}-${(f.text ?? '').slice(0, 8)}`}
                className="flex items-center gap-2 text-xs cursor-pointer"
                style={{ color: hasBgImage ? (f.active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)') : (f.active ? '#374151' : '#d1d5db') }}
                onClick={e => { e.stopPropagation(); onFeatureClick(planKey); }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onFeatureClick(planKey); } }}
              >
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                  background: f.active
                    ? (hasBgImage ? 'rgba(255,255,255,0.25)' : '#d1fae5')
                    : (hasBgImage ? 'rgba(255,255,255,0.1)' : '#f3f4f6'),
                  color: f.active
                    ? (hasBgImage ? '#fff' : '#059669')
                    : (hasBgImage ? 'rgba(255,255,255,0.4)' : '#9ca3af'),
                }}>{f.active ? '✓' : '✕'}</span>
                <span className={f.active ? '' : 'line-through'}>{f.text}</span>
              </div>
            ))}
            {(data.features?.length ?? 0) > carouselLimit && (
              <button
                style={{ fontSize: '11px', fontWeight: 600, color: hasBgImage ? 'rgba(255,255,255,0.8)' : '#3b82f6', cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); onToggle(planKey); }}
              >
                {expanded ? 'Ver menos' : `+${(data.features?.length ?? 0) - carouselLimit} beneficios más`}
              </button>
            )}
          </div>

          {isCurrent && (
            <div style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 700,
              background: hasBgImage ? 'rgba(255,255,255,0.2)' : '#d1fae5',
              color: hasBgImage ? '#fff' : '#065f46',
              backdropFilter: hasBgImage ? 'blur(4px)' : undefined,
            }}>Tu plan actual</div>
          )}
          {data.enableClaimLock && claimedPlans.includes(planKey) && !isCurrent && (
            <div style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 700,
              background: hasBgImage ? 'rgba(239,68,68,0.3)' : '#fee2e2',
              color: hasBgImage ? '#fff' : '#991b1b',
            }}>Ya reclamado</div>
          )}
        </div>
      </div>
    </div>
  );
}
