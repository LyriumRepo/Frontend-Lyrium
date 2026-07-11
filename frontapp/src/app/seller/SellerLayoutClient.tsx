'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SellerSidebar from '@/components/layout/seller/SellerSidebar';
import SellerHeader from '@/components/layout/seller/SellerHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';
import { InventoryAlertsProvider } from '@/features/seller/inventario/context/InventoryAlertsContext';
import NotificationSidebar from '@/components/shared/notifications/NotificationSidebar';
import ChatBotWidget from '@/features/chatbot/components/ChatBotWidget';
import { useAuth } from '@/shared/lib/context/AuthContext';
import Icon from '@/components/ui/Icon';
import { WELCOME_MODAL_LIGHT_TEXT, WELCOME_MODAL_LIGHT_BADGE, WELCOME_MODAL_LIGHT_CARD } from '@/shared/lib/theme/welcomeModalTheme';

// ─── Paleta ────────────────────────────────────────────────────────────────
const SELLER_COLORS = ['#10b981', '#34d399', '#06b6d4', '#22d3ee', '#6ee7b7', '#a78bfa'];

// ─── CSS keyframes ─────────────────────────────────────────────────────────
const WELCOME_CSS = `
  @keyframes swOverlayIn  { from{opacity:0} to{opacity:1} }
  @keyframes swOverlayOut { from{opacity:1} to{opacity:0} }

  @keyframes swCardIn {
    0%  { opacity:0; transform:scale(0.82) translateY(40px); }
    55% { opacity:1; transform:scale(1.03) translateY(-6px); }
    75% { transform:scale(0.985) translateY(2px); }
    100%{ opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes swCardOut {
    from{ opacity:1; transform:scale(1) translateY(0); }
    to  { opacity:0; transform:scale(0.88) translateY(-28px); }
  }

  @keyframes swLogoFloat {
    0%,100%{ transform:translateY(0px) rotate(-1deg); }
    50%    { transform:translateY(-10px) rotate(1deg); }
  }
  @keyframes swLogoPulse {
    0%,100%{ filter:drop-shadow(0 0 12px rgba(16,185,129,0.6)) drop-shadow(0 0 28px rgba(6,182,212,0.3)); }
    50%    { filter:drop-shadow(0 0 22px rgba(16,185,129,0.9)) drop-shadow(0 0 48px rgba(6,182,212,0.5)); }
  }
  @keyframes swGlowPulse {
    0%,100%{ opacity:.5; transform:scale(1); }
    50%    { opacity:1;  transform:scale(1.08); }
  }
  @keyframes swOrbitCW  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
  @keyframes swOrbitCCW { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
  @keyframes swRipple {
    0%  { transform:scale(.65); opacity:.65; }
    100%{ transform:scale(2.8); opacity:0;   }
  }
  @keyframes swShimmer {
    0%  { transform:translateX(-130%); }
    100%{ transform:translateX(330%);  }
  }
  @keyframes swRayRotate {
    from{ transform:translateX(-50%) rotate(0deg);   }
    to  { transform:translateX(-50%) rotate(360deg); }
  }
  @keyframes swBorderPulse {
    0%,100%{ opacity:.65; }
    50%    { opacity:1;   }
  }
  @keyframes swSlideUp {
    from{ opacity:0; transform:translateY(22px); }
    to  { opacity:1; transform:translateY(0);    }
  }
  @keyframes swLetterIn {
    0%  { opacity:0; transform:translateY(24px) scale(.6); }
    65% { transform:translateY(-5px) scale(1.12); }
    100%{ opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes swDrawLine {
    from{ transform:scaleX(0); opacity:0; }
    to  { transform:scaleX(1); opacity:1; }
  }
  @keyframes swGradientShift {
    0%,100%{ background-position:0% 50%; }
    50%    { background-position:100% 50%; }
  }
  @keyframes swFloat1 {
    0%,100%{ transform:translate(0,0); }
    33%    { transform:translate(-10px,-15px); }
    66%    { transform:translate(8px,-8px); }
  }
  @keyframes swFloat2 {
    0%,100%{ transform:translate(0,0); }
    33%    { transform:translate(12px,-11px); }
    66%    { transform:translate(-7px,-16px); }
  }
  @keyframes swFloat3 {
    0%,100%{ transform:translate(0,0); }
    50%    { transform:translate(-6px,-19px); }
  }
  @keyframes swSparkle {
    0%,100%{ opacity:0; transform:scale(0) rotate(0deg); }
    40%,60%{ opacity:1; transform:scale(1) rotate(180deg); }
  }
  @keyframes swIconSpin {
    0%  { transform:rotateY(0deg); }
    50% { transform:rotateY(180deg); }
    100%{ transform:rotateY(360deg); }
  }
  @keyframes swStoreIcon {
    0%,100%{ transform:scale(1) rotate(0deg); }
    25%    { transform:scale(1.12) rotate(-4deg); }
    75%    { transform:scale(1.08) rotate(4deg); }
  }
  @keyframes swParticleRise {
    0%   { transform:translateY(0) scale(1); opacity:.9; }
    100% { transform:translateY(-60px) scale(0); opacity:0; }
  }
`;

const SW_PARTICLES = [
    { w:5, h:5, color:'#10b981', top: 45,  left:-18,  anim:'swFloat1', delay:'0ms',   dur:'4.5s' },
    { w:4, h:4, color:'#06b6d4', top:140,  left:-24,  anim:'swFloat2', delay:'400ms', dur:'5.3s' },
    { w:3, h:3, color:'#34d399', top:270,  left:-14,  anim:'swFloat3', delay:'850ms', dur:'4.0s' },
    { w:5, h:5, color:'#6ee7b7', top: 55,  right:-20, anim:'swFloat2', delay:'550ms', dur:'4.8s' },
    { w:4, h:4, color:'#22d3ee', top:195,  right:-26, anim:'swFloat1', delay:'250ms', dur:'5.5s' },
    { w:3, h:3, color:'#a78bfa', top:305,  right:-12, anim:'swFloat3', delay:'980ms', dur:'4.2s' },
    { w:4, h:4, color:'#10b981', top:-16,  left: 85,  anim:'swFloat1', delay:'620ms', dur:'5.7s' },
    { w:3, h:3, color:'#06b6d4', top:385,  right: 75, anim:'swFloat2', delay:'420ms', dur:'5.0s' },
] as const;

const SW_SPARKLES = [
    { size:11, top:'12%', left:'9%',   delay:'0.5s', dur:'3.3s' },
    { size: 8, top:'7%',  right:'17%', delay:'1.2s', dur:'2.9s' },
    { size:10, top:'70%', left:'7%',   delay:'0.9s', dur:'3.6s' },
    { size: 7, top:'76%', right:'9%',  delay:'1.7s', dur:'3.1s' },
    { size:10, top:'43%', left:'2%',   delay:'2.1s', dur:'2.7s' },
    { size: 7, top:'38%', right:'3%',  delay:'0.7s', dur:'3.9s' },
] as const;

function SwStarSVG({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
        </svg>
    );
}

// ─── SellerWelcomeToast ────────────────────────────────────────────────────
function SellerWelcomeToast() {
    const { user } = useAuth();
    const [visible,   setVisible]   = useState(false);
    const [exiting,   setExiting]   = useState(false);
    const [nameReady, setNameReady] = useState(true);
    const [tilt,      setTilt]      = useState({ x: 0, y: 0 });
    const [isDark,    setIsDark]    = useState(true);

    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const close = useCallback(() => {
        setExiting(true);
        setTimeout(() => setVisible(false), 540);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        setTilt({
            x:  ((e.clientX - cx) / (rect.width  / 2)) * 7,
            y: -((e.clientY - cy) / (rect.height / 2)) * 7,
        });
    }, []);

    const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

    const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
                particleCount: 55, spread: 90, zIndex: 10000,
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                colors: SELLER_COLORS, scalar: 1.1, gravity: 0.8,
            });
        });
        close();
    }, [close]);

    useEffect(() => {
        if (!user) return;
        const key = 'lyrium_seller_welcome_session';
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');

        setExiting(false);
        setNameReady(true);
        setVisible(true);

        const confettiTimer = setTimeout(() => {
            import('canvas-confetti').then(({ default: confetti }) => {
                confetti({ particleCount: 120, spread: 170, origin: { x: 0.5, y: 0.38 }, colors: SELLER_COLORS, scalar: 1.2, gravity: 0.72, zIndex: 10000 });
                setTimeout(() => {
                    confetti({ particleCount: 70, angle: 60,  spread: 70, origin: { x: 0, y: 0.45 }, colors: SELLER_COLORS, scalar: 1.1, zIndex: 10000 });
                    confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.45 }, colors: SELLER_COLORS, scalar: 1.1, zIndex: 10000 });
                }, 240);
                setTimeout(() => {
                    confetti({ particleCount: 40, spread: 360, startVelocity: 20, origin: { x: 0.5, y: 0.4 }, colors: ['#fbbf24','#ffffff','#34d399','#a78bfa'], shapes: ['star'], scalar: 1.5, gravity: 0.35, zIndex: 10000 });
                }, 500);
            });
        }, 700);

        const autoClose = setTimeout(close, 7500);

        return () => {
            clearTimeout(confettiTimer);
            clearTimeout(autoClose);
        };
    }, [user, close]);

    if (!visible) return null;

    const firstName = user?.display_name?.split(' ')[0] ?? 'Vendedor';
    const storeName = (user as any)?.storeName;

    const T = isDark ? {
        overlay:     'radial-gradient(ellipse 72% 62% at 50% 38%, rgba(16,185,129,0.08) 0%, rgba(0,0,0,0.78) 82%)',
        cardBg:      'linear-gradient(158deg, rgba(11,26,16,0.96) 0%, rgba(8,20,32,0.97) 55%, rgba(10,20,18,0.95) 100%)',
        cardShadow:  'inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 80px rgba(16,185,129,0.07), 0 44px 100px rgba(0,0,0,0.68), 0 0 160px rgba(16,185,129,0.05)',
        glowTop:     'radial-gradient(ellipse at 50% -20%, rgba(16,185,129,0.14) 0%, transparent 70%)',
        shimmer:     'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.05) 50%, transparent 72%)',
        badgeBg:     'rgba(167,139,250,0.1)',
        badgeBorder: '1px solid rgba(167,139,250,0.25)',
        badgeColor:  'rgba(196,181,253,0.85)',
        label:       'rgba(255,255,255,0.45)',
        subtitle:    'rgba(255,255,255,0.34)',
        closeBg:     'rgba(255,255,255,0.06)',
        closeBorder: '1px solid rgba(255,255,255,0.1)',
        closeIcon:   'text-white/45',
        closeHover:  'rgba(16,185,129,0.2)',
        logoBg:      'rgba(16,185,129,0.08)',
        logoBorder:  '1px solid rgba(16,185,129,0.2)',
        logoSrc:     '/img/logo_lyrium_blanco_01-scaled.webp',
        storeBg:     'rgba(16,185,129,0.1)',
        storeBorder: '1px solid rgba(16,185,129,0.2)',
        storeColor:  'rgba(52,211,153,0.75)',
        divider:     'linear-gradient(90deg, transparent, rgba(52,211,153,0.4), rgba(167,139,250,0.3), transparent)',
        spark1:      'rgba(52,211,153,0.5)',
        spark2:      'rgba(167,139,250,0.4)',
    } : {
        overlay:     'radial-gradient(ellipse 72% 62% at 50% 38%, rgba(13,148,136,0.22) 0%, rgba(15,23,42,0.76) 82%)',
        cardShadow:  'inset 0 0 0 1.5px rgba(16,185,129,0.35), inset 0 0 80px rgba(16,185,129,0.05), 0 32px 80px rgba(0,0,0,0.38), 0 0 120px rgba(16,185,129,0.12)',
        glowTop:     'radial-gradient(ellipse at 50% -20%, rgba(16,185,129,0.10) 0%, transparent 70%)',
        ...WELCOME_MODAL_LIGHT_CARD,
        ...WELCOME_MODAL_LIGHT_BADGE,
        ...WELCOME_MODAL_LIGHT_TEXT,
        closeBg:     'rgba(0,0,0,0.05)',
        closeBorder: '1px solid rgba(0,0,0,0.1)',
        closeIcon:   'text-black/40',
        closeHover:  'rgba(16,185,129,0.15)',
        logoBg:      'rgba(16,185,129,0.07)',
        logoBorder:  '1px solid rgba(16,185,129,0.18)',
        logoSrc:     '/img/iconologo.png',
        storeBg:     'rgba(16,185,129,0.12)',
        storeBorder: '1px solid rgba(16,185,129,0.35)',
        storeColor:  '#047857',
        divider:     'linear-gradient(90deg, transparent, rgba(16,185,129,0.45), rgba(167,139,250,0.3), transparent)',
        spark1:      'rgba(16,185,129,0.5)',
        spark2:      'rgba(167,139,250,0.45)',
    };

    const D = {
        logo:     360,
        orb:      460,
        label:    600,
        subtitle: 700 + firstName.length * 46 + 160,
        store:    700 + firstName.length * 46 + 320,
        divider:  700 + firstName.length * 46 + 480,
    };

    return (
        <>
            <style>{WELCOME_CSS}</style>

            {/* Overlay */}
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{
                    backdropFilter: 'blur(22px) saturate(160%)',
                    background: T.overlay,
                    animation: `${exiting ? 'swOverlayOut .54s' : 'swOverlayIn .6s'} ease both`,
                }}
                onClick={handleOverlayClick}
            >
                {/* Card wrapper — tilt 3D */}
                <div
                    className="relative w-full max-w-[480px]"
                    style={{
                        transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                        transition: 'transform 0.14s ease-out',
                        animation: `${exiting ? 'swCardOut .54s' : 'swCardIn .74s'} cubic-bezier(0.34,1.56,0.64,1) both`,
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Partículas flotantes */}
                    {SW_PARTICLES.map((p, i) => (
                        <div key={i} className="absolute rounded-full pointer-events-none" style={{
                            width: p.w, height: p.h,
                            background: p.color,
                            top: p.top,
                            ...('left'  in p ? { left:  (p as any).left  } : {}),
                            ...('right' in p ? { right: (p as any).right } : {}),
                            boxShadow: `0 0 ${p.w * 3}px ${p.color}, 0 0 ${p.w * 6}px ${p.color}40`,
                            animation: `${p.anim} ${p.dur} ease-in-out ${p.delay} infinite`,
                        }} />
                    ))}

                    {/* Halo exterior */}
                    <div className="absolute pointer-events-none" style={{
                        inset: '-38px', borderRadius: '62px',
                        background: 'radial-gradient(ellipse, rgba(16,185,129,0.3) 0%, rgba(6,182,212,0.16) 45%, transparent 78%)',
                        filter: 'blur(30px)',
                        animation: 'swGlowPulse 3.4s ease-in-out infinite',
                    }} />

                    {/* Anillo orbital 1 */}
                    <div className="absolute pointer-events-none" style={{
                        inset: '-24px', borderRadius: '50%',
                        border: '1px solid rgba(16,185,129,0.18)',
                        animation: 'swOrbitCW 16s linear infinite',
                    }}>
                        <div style={{
                            position:'absolute', top:'-4px', left:'50%', marginLeft:'-4px',
                            width:8, height:8, borderRadius:'50%', background:'#10b981',
                            boxShadow:'0 0 10px #10b981, 0 0 22px rgba(16,185,129,0.55)',
                        }} />
                    </div>

                    {/* Anillo orbital 2 */}
                    <div className="absolute pointer-events-none" style={{
                        inset: '-46px', borderRadius: '50%',
                        border: '1px solid rgba(167,139,250,0.12)',
                        animation: 'swOrbitCCW 24s linear infinite',
                    }}>
                        <div style={{
                            position:'absolute', bottom:'-3px', right:'28%',
                            width:5, height:5, borderRadius:'50%', background:'#a78bfa',
                            boxShadow:'0 0 8px #a78bfa, 0 0 16px rgba(167,139,250,0.5)',
                        }} />
                    </div>

                    {/* Borde degradado */}
                    <div style={{
                        padding: '1.5px', borderRadius: '40px',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(167,139,250,0.5) 35%, rgba(6,182,212,0.65) 65%, rgba(52,211,153,0.5) 100%)',
                        animation: 'swBorderPulse 3.2s ease-in-out infinite',
                    }}>
                        {/* Card */}
                        <div className="relative overflow-hidden" style={{
                            borderRadius: '39px',
                            background: T.cardBg,
                            backdropFilter: 'blur(46px) saturate(185%)',
                            boxShadow: T.cardShadow,
                        }}>
                            {/* Glow superior */}
                            <div className="absolute top-0 inset-x-0 pointer-events-none" style={{
                                height: '200px',
                                background: T.glowTop,
                            }} />

                            {/* Shimmer sweep */}
                            <div className="absolute inset-0 pointer-events-none" style={{
                                background: T.shimmer,
                                width: '75%',
                                animation: 'swShimmer 5s ease-in-out 1.4s infinite',
                            }} />

                            {/* Rayos cónicos */}
                            <div className="absolute pointer-events-none" style={{
                                top: 0, left: '50%',
                                width: '320px', height: '320px', marginTop: '-55px',
                                borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.06) 25deg, transparent 50deg, rgba(167,139,250,0.04) 85deg, transparent 110deg, rgba(6,182,212,0.05) 145deg, transparent 170deg, rgba(52,211,153,0.05) 205deg, transparent 230deg, rgba(16,185,129,0.04) 265deg, transparent 290deg, rgba(6,182,212,0.05) 330deg, transparent 360deg)',
                                animation: 'swRayRotate 26s linear infinite',
                            }} />

                            {/* Destellos estelares */}
                            {SW_SPARKLES.map((s, i) => (
                                <div key={i} className="absolute pointer-events-none" style={{
                                    top: s.top,
                                    ...('left'  in s ? { left:  (s as any).left  } : {}),
                                    ...('right' in s ? { right: (s as any).right } : {}),
                                    color: i % 2 === 0 ? T.spark1 : T.spark2,
                                    animation: `swSparkle ${s.dur} ease-in-out ${s.delay} infinite`,
                                }}>
                                    <SwStarSVG size={s.size} />
                                </div>
                            ))}

                            {/* Botón cerrar */}
                            <button
                                onClick={e => { e.stopPropagation(); close(); }}
                                className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-full transition-all duration-200 active:scale-90"
                                style={{
                                    width: 34, height: 34,
                                    background: T.closeBg,
                                    border: T.closeBorder,
                                    backdropFilter: 'blur(8px)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = T.closeHover)}
                                onMouseLeave={e => (e.currentTarget.style.background = T.closeBg)}
                            >
                                <Icon name="X" className={`w-3.5 h-3.5 ${T.closeIcon}`} />
                            </button>

                            {/* Contenido */}
                            <div className="px-8 pt-10 pb-8 relative">

                                {/* 1 — Logo Lyrium animado flotando */}
                                <div className="flex justify-center mb-6" style={{
                                    animation: `swSlideUp .5s cubic-bezier(.22,1,.36,1) ${D.logo}ms both`,
                                }}>
                                    <div className="relative flex flex-col items-center gap-3">
                                        {/* Ripples detrás del logo */}
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="absolute rounded-full pointer-events-none" style={{
                                                inset: `${-(i * 18 + 12)}px`,
                                                border: `1px solid rgba(16,185,129,${0.25 - i * 0.06})`,
                                                animation: `swRipple ${2.8 + i * 0.5}s ease-out ${i * 0.7}s infinite`,
                                            }} />
                                        ))}
                                        {/* Glow detrás del logo */}
                                        <div className="absolute inset-0 pointer-events-none" style={{
                                            transform: 'scale(2.2)',
                                            background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(6,182,212,0.2) 45%, transparent 78%)',
                                            filter: 'blur(24px)',
                                            animation: 'swGlowPulse 4s ease-in-out infinite',
                                        }} />
                                        {/* Logo con fondo pill */}
                                        <div className="relative flex items-center justify-center px-5 py-3 rounded-2xl" style={{
                                            background: T.logoBg,
                                            border: T.logoBorder,
                                            animation: 'swLogoFloat 4.5s ease-in-out infinite, swLogoPulse 4.5s ease-in-out infinite',
                                        }}>
                                            <img
                                                src={T.logoSrc}
                                                alt="Lyrium"
                                                style={{ height: 40, objectFit: 'contain', opacity: 0.9 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2 — Badge "Panel de Vendedor" */}
                                <div className="flex justify-center mb-6" style={{
                                    animation: `swSlideUp .48s cubic-bezier(.22,1,.36,1) ${D.orb}ms both`,
                                }}>
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
                                        background: T.badgeBg,
                                        border: T.badgeBorder,
                                    }}>
                                        <span style={{ fontSize: '13px' }}>🏪</span>
                                        <p className="text-[10px] font-bold tracking-[0.26em] uppercase"
                                           style={{ color: T.badgeColor }}>
                                            Panel de Vendedor
                                        </p>
                                    </div>
                                </div>

                                {/* 3 — Tipografía */}
                                <div className="text-center mb-7">
                                    <p className="text-[14px] font-medium mb-2 tracking-wide" style={{
                                        color: T.label,
                                        animation: `swSlideUp .48s ease ${D.label}ms both`,
                                    }}>
                                        ¡Bienvenido a tu tienda,
                                    </p>

                                    {/* Nombre — hero, letra por letra */}
                                    <h2 className="text-[50px] font-black leading-none mb-4 flex justify-center flex-wrap"
                                        style={{ letterSpacing: '-0.025em' }}>
                                        {firstName.split('').map((char, i) => (
                                            <span key={i} className="inline-block" style={{
                                                backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 28%, #a78bfa 60%, #06b6d4 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                opacity: nameReady ? undefined : 0,
                                                animation: nameReady
                                                    ? `swLetterIn .52s cubic-bezier(.34,1.56,.64,1) ${i * 46}ms both`
                                                    : 'none',
                                            }}>
                                                {char === ' ' ? ' ' : char}
                                            </span>
                                        ))}
                                        <span className="ml-2 inline-block" style={{
                                            opacity: nameReady ? undefined : 0,
                                            animation: nameReady
                                                ? `swLetterIn .52s cubic-bezier(.34,1.56,.64,1) ${firstName.length * 46 + 55}ms both`
                                                : 'none',
                                        }}>🚀</span>
                                    </h2>

                                    {/* Subtítulo */}
                                    <p className="text-[13px] leading-relaxed" style={{
                                        color: T.subtitle,
                                        animation: `swSlideUp .48s ease ${D.subtitle}ms both`,
                                    }}>
                                        Todo listo para que hagas crecer tu negocio ✨
                                    </p>

                                    {/* Nombre de tienda si está disponible */}
                                    {storeName && (
                                        <div className="mt-3 flex justify-center" style={{
                                            animation: `swSlideUp .48s ease ${D.store}ms both`,
                                        }}>
                                            <span className="text-[11px] px-3 py-1 rounded-full" style={{
                                                background: T.storeBg,
                                                border: T.storeBorder,
                                                color: T.storeColor,
                                                letterSpacing: '0.05em',
                                            }}>
                                                🌿 {storeName}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Divisor */}
                                <div style={{
                                    height: '1px', transformOrigin: 'center',
                                    background: T.divider,
                                    animation: `swDrawLine .9s ease-out ${D.divider}ms both`,
                                }} />
                            </div>

                            {/* Barra inferior animada */}
                            <div style={{
                                height: '4px',
                                background: 'linear-gradient(90deg, #10b981, #a78bfa, #06b6d4, #34d399, #10b981)',
                                backgroundSize: '200% auto',
                                animation: 'swGradientShift 3s linear infinite',
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ──────────────────────────────────────────────────────────────────────────
interface SellerLayoutClientProps {
    children: React.ReactNode;
}

export function SellerLayoutClient({ children }: SellerLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();
    const router = useRouter();
    const pathname = usePathname();
    const [storeChecked, setStoreChecked] = useState(false);

    useEffect(() => {
        // Skip check if already on pending page
        if (pathname === '/seller/pending') {
            setStoreChecked(true);
            return;
        }

        const checkStoreStatus = async () => {
            const timeout = new Promise<void>(resolve => setTimeout(() => resolve(), 5000));
            const check = async () => {
                try {
                    const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
                    const token = localStorage.getItem('laravel_token');
                    if (!token) return;

                    const controller = new AbortController();
                    const abort = setTimeout(() => controller.abort(), 4500);

                    const response = await fetch(`${LARAVEL_API}/stores/me`, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    clearTimeout(abort);

                    if (response.status === 403 || response.status === 404) {
                        router.replace('/seller/pending');
                        return;
                    }

                    if (response.ok) {
                        const data = await response.json();
                        const store = data.data;
                        if (!store || store.status !== 'approved') {
                            router.replace('/seller/pending');
                            return;
                        }
                    }
                } catch {
                    // Network error or timeout — allow access
                }
            };
            await Promise.race([check(), timeout]);
            setStoreChecked(true);
        };

        checkStoreStatus();
    }, [pathname, router]);

    if (!storeChecked && pathname !== '/seller/pending') {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
                {/* Header skeleton */}
                <div className="h-14 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center px-5 gap-4 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                    <div className="w-28 h-4 rounded-full bg-[var(--bg-muted)] animate-pulse" />
                    <div className="flex-1" />
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] animate-pulse" />
                </div>
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar skeleton */}
                    <div className="hidden md:flex flex-col w-56 shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] p-4 gap-3">
                        <div className="w-full h-9 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                        <div className="w-4/5 h-9 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                        <div className="w-full h-9 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                        <div className="w-3/4 h-9 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                        <div className="w-full h-9 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                    </div>
                    {/* Content skeleton */}
                    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
                        <div className="h-24 rounded-2xl bg-[var(--bg-card)] animate-pulse" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl bg-[var(--bg-card)] animate-pulse" />
                            ))}
                        </div>
                        <div className="h-48 rounded-2xl bg-[var(--bg-card)] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <InventoryAlertsProvider>
        <DashboardLayout
            header={<SellerHeader onOpenMenu={toggleSidebar} />}
            sidebar={<SellerSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-4 md:p-8"
        >
            {children}
            <NotificationSidebar />
            <ChatBotWidget />
            <SellerWelcomeToast />
        </DashboardLayout>
        </InventoryAlertsProvider>
    );
}

