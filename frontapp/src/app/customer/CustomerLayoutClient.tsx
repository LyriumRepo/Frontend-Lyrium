'use client';

import React, { useEffect, useState, useCallback } from 'react';
import CustomerSidebar from '@/components/layout/customer/CustomerSidebar';
import CustomerHeader from '@/components/layout/customer/CustomerHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/shared/lib/context/AuthContext';
import Icon from '@/components/ui/Icon';
import ChatBotWidget from '@/features/chatbot/components/ChatBotWidget';
import NotificationSidebar from '@/components/shared/notifications/NotificationSidebar';
import { WELCOME_MODAL_LIGHT_TEXT, WELCOME_MODAL_LIGHT_BADGE, WELCOME_MODAL_LIGHT_CARD } from '@/shared/lib/theme/welcomeModalTheme';

interface CustomerLayoutClientProps {
    children: React.ReactNode;
}

// ─── Paleta bienvenida cliente ─────────────────────────────────────────────
const CW_COLORS = ['#10b981', '#34d399', '#06b6d4', '#22d3ee', '#6ee7b7', '#a78bfa'];

// ─── CSS keyframes bienvenida cliente ─────────────────────────────────────
const CW_CSS = `
  @keyframes cwOverlayIn  { from{opacity:0} to{opacity:1} }
  @keyframes cwOverlayOut { from{opacity:1} to{opacity:0} }

  @keyframes cwCardIn {
    0%  { opacity:0; transform:scale(0.82) translateY(40px); }
    55% { opacity:1; transform:scale(1.03) translateY(-6px); }
    75% { transform:scale(0.985) translateY(2px); }
    100%{ opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes cwCardOut {
    from{ opacity:1; transform:scale(1) translateY(0); }
    to  { opacity:0; transform:scale(0.88) translateY(-28px); }
  }
  @keyframes cwLogoFloat {
    0%,100%{ transform:translateY(0px) rotate(-1deg); }
    50%    { transform:translateY(-10px) rotate(1deg); }
  }
  @keyframes cwLogoPulse {
    0%,100%{ filter:drop-shadow(0 0 12px rgba(16,185,129,0.6)) drop-shadow(0 0 28px rgba(6,182,212,0.3)); }
    50%    { filter:drop-shadow(0 0 22px rgba(16,185,129,0.9)) drop-shadow(0 0 48px rgba(6,182,212,0.5)); }
  }
  @keyframes cwGlowPulse {
    0%,100%{ opacity:.5; transform:scale(1); }
    50%    { opacity:1;  transform:scale(1.08); }
  }
  @keyframes cwOrbitCW  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
  @keyframes cwOrbitCCW { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
  @keyframes cwRipple {
    0%  { transform:scale(.65); opacity:.65; }
    100%{ transform:scale(2.8); opacity:0;   }
  }
  @keyframes cwShimmer {
    0%  { transform:translateX(-130%); }
    100%{ transform:translateX(330%);  }
  }
  @keyframes cwRayRotate {
    from{ transform:translateX(-50%) rotate(0deg);   }
    to  { transform:translateX(-50%) rotate(360deg); }
  }
  @keyframes cwBorderPulse {
    0%,100%{ opacity:.65; }
    50%    { opacity:1;   }
  }
  @keyframes cwSlideUp {
    from{ opacity:0; transform:translateY(22px); }
    to  { opacity:1; transform:translateY(0);    }
  }
  @keyframes cwLetterIn {
    0%  { opacity:0; transform:translateY(24px) scale(.6); }
    65% { transform:translateY(-5px) scale(1.12); }
    100%{ opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes cwDrawLine {
    from{ transform:scaleX(0); opacity:0; }
    to  { transform:scaleX(1); opacity:1; }
  }
  @keyframes cwGradientShift {
    0%,100%{ background-position:0% 50%; }
    50%    { background-position:100% 50%; }
  }
  @keyframes cwFloat1 {
    0%,100%{ transform:translate(0,0); }
    33%    { transform:translate(-10px,-15px); }
    66%    { transform:translate(8px,-8px); }
  }
  @keyframes cwFloat2 {
    0%,100%{ transform:translate(0,0); }
    33%    { transform:translate(12px,-11px); }
    66%    { transform:translate(-7px,-16px); }
  }
  @keyframes cwFloat3 {
    0%,100%{ transform:translate(0,0); }
    50%    { transform:translate(-6px,-19px); }
  }
  @keyframes cwSparkle {
    0%,100%{ opacity:0; transform:scale(0) rotate(0deg); }
    40%,60%{ opacity:1; transform:scale(1) rotate(180deg); }
  }
`;

const CW_PARTICLES = [
    { w:5, h:5, color:'#10b981', top: 45,  left:-18,  anim:'cwFloat1', delay:'0ms',   dur:'4.5s' },
    { w:4, h:4, color:'#06b6d4', top:140,  left:-24,  anim:'cwFloat2', delay:'400ms', dur:'5.3s' },
    { w:3, h:3, color:'#34d399', top:270,  left:-14,  anim:'cwFloat3', delay:'850ms', dur:'4.0s' },
    { w:5, h:5, color:'#6ee7b7', top: 55,  right:-20, anim:'cwFloat2', delay:'550ms', dur:'4.8s' },
    { w:4, h:4, color:'#22d3ee', top:195,  right:-26, anim:'cwFloat1', delay:'250ms', dur:'5.5s' },
    { w:3, h:3, color:'#a78bfa', top:305,  right:-12, anim:'cwFloat3', delay:'980ms', dur:'4.2s' },
    { w:4, h:4, color:'#10b981', top:-16,  left: 85,  anim:'cwFloat1', delay:'620ms', dur:'5.7s' },
    { w:3, h:3, color:'#06b6d4', top:385,  right: 75, anim:'cwFloat2', delay:'420ms', dur:'5.0s' },
] as const;

const CW_SPARKLES = [
    { size:11, top:'12%', left:'9%',   delay:'0.5s', dur:'3.3s' },
    { size: 8, top:'7%',  right:'17%', delay:'1.2s', dur:'2.9s' },
    { size:10, top:'70%', left:'7%',   delay:'0.9s', dur:'3.6s' },
    { size: 7, top:'76%', right:'9%',  delay:'1.7s', dur:'3.1s' },
    { size:10, top:'43%', left:'2%',   delay:'2.1s', dur:'2.7s' },
    { size: 7, top:'38%', right:'3%',  delay:'0.7s', dur:'3.9s' },
] as const;

function CwStarSVG({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
        </svg>
    );
}

// ─── CustomerWelcomeToast ──────────────────────────────────────────────────
function CustomerWelcomeToast() {
    const { user } = useAuth();
    const [visible,   setVisible]   = useState(false);
    const [exiting,   setExiting]   = useState(false);
    const [nameReady, setNameReady] = useState(true);
    const [tilt,      setTilt]      = useState({ x: 0, y: 0 });
    const [isDark,    setIsDark]    = useState(true);

    // Detectar modo día/noche — observa clase "dark" en <html>
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
                colors: CW_COLORS, scalar: 1.1, gravity: 0.8,
            });
        });
        close();
    }, [close]);

    useEffect(() => {
        if (!user) return;
        const key = 'lyrium_customer_welcome_session';
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');

        setExiting(false);
        setNameReady(true);
        setVisible(true);

        const confettiTimer = setTimeout(() => {
            import('canvas-confetti').then(({ default: confetti }) => {
                confetti({ particleCount: 120, spread: 170, origin: { x: 0.5, y: 0.38 }, colors: CW_COLORS, scalar: 1.2, gravity: 0.72, zIndex: 10000 });
                setTimeout(() => {
                    confetti({ particleCount: 70, angle: 60,  spread: 70, origin: { x: 0, y: 0.45 }, colors: CW_COLORS, scalar: 1.1, zIndex: 10000 });
                    confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.45 }, colors: CW_COLORS, scalar: 1.1, zIndex: 10000 });
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

    const firstName = user?.display_name?.split(' ')[0] ?? 'Cliente';

    const D = {
        logo:     360,
        orb:      460,
        label:    600,
        subtitle: 700 + firstName.length * 46 + 160,
        divider:  700 + firstName.length * 46 + 340,
    };

    const T = isDark ? {
        overlay:     'radial-gradient(ellipse 72% 62% at 50% 38%, rgba(16,185,129,0.08) 0%, rgba(0,0,0,0.78) 82%)',
        cardBg:      'linear-gradient(158deg, rgba(8,18,14,0.97) 0%, rgba(6,14,22,0.97) 55%, rgba(8,16,14,0.96) 100%)',
        cardShadow:  'inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 80px rgba(16,185,129,0.07), 0 44px 100px rgba(0,0,0,0.72), 0 0 160px rgba(16,185,129,0.05)',
        glowTop:     'radial-gradient(ellipse at 50% -20%, rgba(16,185,129,0.14) 0%, transparent 70%)',
        shimmer:     'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.05) 50%, transparent 72%)',
        badgeBg:     'rgba(6,182,212,0.1)',
        badgeBorder: '1px solid rgba(6,182,212,0.25)',
        badgeColor:  'rgba(103,232,249,0.85)',
        label:       'rgba(255,255,255,0.45)',
        subtitle:    'rgba(255,255,255,0.34)',
        closeBg:     'rgba(255,255,255,0.06)',
        closeBorder: '1px solid rgba(255,255,255,0.1)',
        closeIcon:   'text-white/45',
        closeHover:  'rgba(16,185,129,0.2)',
        logoBg:      'rgba(16,185,129,0.08)',
        logoBorder:  '1px solid rgba(16,185,129,0.2)',
        logoSrc:     '/img/logo_lyrium_blanco_01-scaled.webp',
        divider:     'linear-gradient(90deg, transparent, rgba(52,211,153,0.4), rgba(6,182,212,0.3), transparent)',
        spark1:      'rgba(52,211,153,0.5)',
        spark2:      'rgba(6,182,212,0.4)',
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
        divider:     'linear-gradient(90deg, transparent, rgba(16,185,129,0.45), rgba(6,182,212,0.3), transparent)',
        spark1:      'rgba(16,185,129,0.5)',
        spark2:      'rgba(6,182,212,0.45)',
    };

    return (
        <>
            <style>{CW_CSS}</style>

            {/* Overlay */}
            <div
                data-lyrium-welcome-toast=""
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{
                    backdropFilter: 'blur(22px) saturate(160%)',
                    background: T.overlay,
                    animation: `${exiting ? 'cwOverlayOut .54s' : 'cwOverlayIn .6s'} ease both`,
                }}
                onClick={handleOverlayClick}
            >
                {/* Card wrapper — tilt 3D */}
                <div
                    className="relative w-full max-w-[480px]"
                    style={{
                        transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                        transition: 'transform 0.14s ease-out',
                        animation: `${exiting ? 'cwCardOut .54s' : 'cwCardIn .74s'} cubic-bezier(0.34,1.56,0.64,1) both`,
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Partículas flotantes */}
                    {CW_PARTICLES.map((p, i) => (
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
                        animation: 'cwGlowPulse 3.4s ease-in-out infinite',
                    }} />

                    {/* Anillo orbital 1 */}
                    <div className="absolute pointer-events-none" style={{
                        inset: '-24px', borderRadius: '50%',
                        border: '1px solid rgba(16,185,129,0.18)',
                        animation: 'cwOrbitCW 16s linear infinite',
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
                        border: '1px solid rgba(6,182,212,0.12)',
                        animation: 'cwOrbitCCW 24s linear infinite',
                    }}>
                        <div style={{
                            position:'absolute', bottom:'-3px', right:'28%',
                            width:5, height:5, borderRadius:'50%', background:'#06b6d4',
                            boxShadow:'0 0 8px #06b6d4, 0 0 16px rgba(6,182,212,0.5)',
                        }} />
                    </div>

                    {/* Borde degradado */}
                    <div style={{
                        padding: '1.5px', borderRadius: '40px',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(6,182,212,0.5) 35%, rgba(167,139,250,0.6) 65%, rgba(52,211,153,0.5) 100%)',
                        animation: 'cwBorderPulse 3.2s ease-in-out infinite',
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
                                animation: 'cwShimmer 5s ease-in-out 1.4s infinite',
                            }} />

                            {/* Rayos cónicos */}
                            <div className="absolute pointer-events-none" style={{
                                top: 0, left: '50%',
                                width: '320px', height: '320px', marginTop: '-55px',
                                borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.06) 25deg, transparent 50deg, rgba(6,182,212,0.04) 85deg, transparent 110deg, rgba(52,211,153,0.05) 145deg, transparent 170deg, rgba(167,139,250,0.04) 205deg, transparent 230deg, rgba(16,185,129,0.04) 265deg, transparent 290deg, rgba(6,182,212,0.05) 330deg, transparent 360deg)',
                                animation: 'cwRayRotate 26s linear infinite',
                            }} />

                            {/* Destellos estelares */}
                            {CW_SPARKLES.map((s, i) => (
                                <div key={i} className="absolute pointer-events-none" style={{
                                    top: s.top,
                                    ...('left'  in s ? { left:  (s as any).left  } : {}),
                                    ...('right' in s ? { right: (s as any).right } : {}),
                                    color: i % 2 === 0 ? T.spark1 : T.spark2,
                                    animation: `cwSparkle ${s.dur} ease-in-out ${s.delay} infinite`,
                                }}>
                                    <CwStarSVG size={s.size} />
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
                                    animation: `cwSlideUp .5s cubic-bezier(.22,1,.36,1) ${D.logo}ms both`,
                                }}>
                                    <div className="relative flex flex-col items-center gap-3">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="absolute rounded-full pointer-events-none" style={{
                                                inset: `${-(i * 18 + 12)}px`,
                                                border: `1px solid rgba(16,185,129,${0.25 - i * 0.06})`,
                                                animation: `cwRipple ${2.8 + i * 0.5}s ease-out ${i * 0.7}s infinite`,
                                            }} />
                                        ))}
                                        <div className="absolute inset-0 pointer-events-none" style={{
                                            transform: 'scale(2.2)',
                                            background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(6,182,212,0.2) 45%, transparent 78%)',
                                            filter: 'blur(24px)',
                                            animation: 'cwGlowPulse 4s ease-in-out infinite',
                                        }} />
                                        <div className="relative flex items-center justify-center px-5 py-3 rounded-2xl" style={{
                                            background: T.logoBg,
                                            border: T.logoBorder,
                                            animation: 'cwLogoFloat 4.5s ease-in-out infinite, cwLogoPulse 4.5s ease-in-out infinite',
                                        }}>
                                            <img
                                                src={T.logoSrc}
                                                alt="Lyrium"
                                                style={{ height: 40, objectFit: 'contain', opacity: 0.9 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2 — Badge "Panel de Cliente" */}
                                <div className="flex justify-center mb-6" style={{
                                    animation: `cwSlideUp .48s cubic-bezier(.22,1,.36,1) ${D.orb}ms both`,
                                }}>
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
                                        background: T.badgeBg,
                                        border: T.badgeBorder,
                                    }}>
                                        <span style={{ fontSize: '13px' }}>🛍️</span>
                                        <p className="text-[10px] font-bold tracking-[0.26em] uppercase"
                                           style={{ color: T.badgeColor }}>
                                            Panel de Cliente
                                        </p>
                                    </div>
                                </div>

                                {/* 3 — Tipografía */}
                                <div className="text-center mb-7">
                                    <p className="text-[14px] font-medium mb-2 tracking-wide" style={{
                                        color: T.label,
                                        animation: `cwSlideUp .48s ease ${D.label}ms both`,
                                    }}>
                                        ¡Bienvenido/a de vuelta,
                                    </p>

                                    {/* Nombre — hero, letra por letra */}
                                    <h2 className="text-[50px] font-black leading-none mb-4 flex justify-center flex-wrap"
                                        style={{ letterSpacing: '-0.025em' }}>
                                        {firstName.split('').map((char, i) => (
                                            <span key={i} className="inline-block" style={{
                                                backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 28%, #06b6d4 60%, #a78bfa 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                opacity: nameReady ? undefined : 0,
                                                animation: nameReady
                                                    ? `cwLetterIn .52s cubic-bezier(.34,1.56,.64,1) ${i * 46}ms both`
                                                    : 'none',
                                            }}>
                                                {char === ' ' ? ' ' : char}
                                            </span>
                                        ))}
                                        <span className="ml-2 inline-block" style={{
                                            opacity: nameReady ? undefined : 0,
                                            animation: nameReady
                                                ? `cwLetterIn .52s cubic-bezier(.34,1.56,.64,1) ${firstName.length * 46 + 55}ms both`
                                                : 'none',
                                        }}>✨</span>
                                    </h2>

                                    {/* Subtítulo */}
                                    <p className="text-[13px] leading-relaxed" style={{
                                        color: T.subtitle,
                                        animation: `cwSlideUp .48s ease ${D.subtitle}ms both`,
                                    }}>
                                        Descubre los mejores productos bio para ti 🌿
                                    </p>
                                </div>

                                {/* Divisor */}
                                <div style={{
                                    height: '1px', transformOrigin: 'center',
                                    background: T.divider,
                                    animation: `cwDrawLine .9s ease-out ${D.divider}ms both`,
                                }} />
                            </div>

                            {/* Barra inferior animada */}
                            <div style={{
                                height: '4px',
                                background: 'linear-gradient(90deg, #10b981, #06b6d4, #a78bfa, #34d399, #10b981)',
                                backgroundSize: '200% auto',
                                animation: 'cwGradientShift 3s linear infinite',
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Paleta confeti cumpleaños ─────────────────────────────────────────────
const BDAY_COLORS = ['#10b981', '#34d399', '#06b6d4', '#22d3ee', '#6ee7b7', '#fbbf24'];

// ─── Keyframes inyectados — React 19 soporta <style> en componentes ───────
const BDAY_CSS = `
  @keyframes bdayOverlayIn  { from{opacity:0} to{opacity:1} }
  @keyframes bdayOverlayOut { from{opacity:1} to{opacity:0} }

  @keyframes bdayCardIn {
    0%  { opacity:0; transform:scale(0.84) translateY(36px); }
    58% { opacity:1; transform:scale(1.025) translateY(-5px); }
    78% { transform:scale(0.988) translateY(2px); }
    100%{ opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes bdayCardOut {
    from{ opacity:1; transform:scale(1) translateY(0); }
    to  { opacity:0; transform:scale(0.9) translateY(-24px); }
  }

  @keyframes bdayGlowPulse {
    0%,100%{ opacity:.55; transform:scale(1); }
    50%    { opacity:1;   transform:scale(1.07); }
  }
  @keyframes bdayOrbitCW  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
  @keyframes bdayOrbitCCW { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }

  @keyframes bdayRipple {
    0%  { transform:scale(.7);  opacity:.7; }
    100%{ transform:scale(2.6); opacity:0;  }
  }
  @keyframes bdayOrbPulse {
    0%,100%{ transform:scale(1);    }
    50%    { transform:scale(1.06); }
  }
  @keyframes bdayShimmer {
    0%  { transform:translateX(-120%); }
    100%{ transform:translateX(320%);  }
  }
  @keyframes bdayRayRotate {
    from{ transform:translateX(-50%) rotate(0deg);   }
    to  { transform:translateX(-50%) rotate(360deg); }
  }
  @keyframes bdayBorderPulse {
    0%,100%{ opacity:.7; }
    50%    { opacity:1;  }
  }
  @keyframes bdaySlideUp {
    from{ opacity:0; transform:translateY(20px); }
    to  { opacity:1; transform:translateY(0);    }
  }
  @keyframes bdayLetterIn {
    0%  { opacity:0; transform:translateY(22px) scale(.65); }
    65% { transform:translateY(-4px) scale(1.1); }
    100%{ opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes bdayDrawLine {
    from{ transform:scaleX(0); opacity:0; }
    to  { transform:scaleX(1); opacity:1; }
  }
  @keyframes bdayGradientShift {
    0%,100%{ background-position:0% 50%; }
    50%    { background-position:100% 50%; }
  }
  @keyframes bdayFloat1 {
    0%,100%{ transform:translate(0,0); }
    33%    { transform:translate(-9px,-14px); }
    66%    { transform:translate(7px,-7px); }
  }
  @keyframes bdayFloat2 {
    0%,100%{ transform:translate(0,0); }
    33%    { transform:translate(11px,-10px); }
    66%    { transform:translate(-6px,-15px); }
  }
  @keyframes bdayFloat3 {
    0%,100%{ transform:translate(0,0); }
    50%    { transform:translate(-5px,-18px); }
  }
  @keyframes bdaySparkle {
    0%,100%{ opacity:0; transform:scale(0) rotate(0deg); }
    40%,60%{ opacity:1; transform:scale(1) rotate(180deg); }
  }
`;

// ─── Partículas flotantes alrededor del card ───────────────────────────────
const PARTICLES = [
    { w:5, h:5, color:'#10b981', top: 48,  left:-16,  anim:'bdayFloat1', delay:'0ms',   dur:'4.3s' },
    { w:4, h:4, color:'#06b6d4', top:145,  left:-22,  anim:'bdayFloat2', delay:'350ms', dur:'5.2s' },
    { w:3, h:3, color:'#34d399', top:280,  left:-12,  anim:'bdayFloat3', delay:'800ms', dur:'3.9s' },
    { w:5, h:5, color:'#6ee7b7', top: 60,  right:-18, anim:'bdayFloat2', delay:'500ms', dur:'4.7s' },
    { w:4, h:4, color:'#22d3ee', top:205,  right:-24, anim:'bdayFloat1', delay:'200ms', dur:'5.4s' },
    { w:3, h:3, color:'#fbbf24', top:315,  right:-10, anim:'bdayFloat3', delay:'950ms', dur:'4.1s' },
    { w:4, h:4, color:'#a78bfa', top:-14,  left: 80,  anim:'bdayFloat1', delay:'600ms', dur:'5.6s' },
    { w:3, h:3, color:'#10b981', top:400,  right: 70, anim:'bdayFloat2', delay:'400ms', dur:'4.9s' },
] as const;

// ─── Destellos estelares interiores ───────────────────────────────────────
const SPARKLES = [
    { size:12, top:'14%', left:'10%',   delay:'0.4s', dur:'3.2s' },
    { size: 9, top:'8%',  right:'18%',  delay:'1.1s', dur:'2.8s' },
    { size:10, top:'72%', left:'8%',    delay:'0.8s', dur:'3.5s' },
    { size: 8, top:'78%', right:'10%',  delay:'1.6s', dur:'3.0s' },
    { size:11, top:'45%', left:'3%',    delay:'2.0s', dur:'2.6s' },
    { size: 8, top:'40%', right:'4%',   delay:'0.6s', dur:'3.8s' },
] as const;

function StarSVG({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
        </svg>
    );
}

// ─── BirthdayToast ─────────────────────────────────────────────────────────
function BirthdayToast() {
    const { user } = useAuth();
    const [visible,   setVisible]   = useState(false);
    const [exiting,   setExiting]   = useState(false);
    const [nameReady, setNameReady] = useState(false);
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
        setTimeout(() => setVisible(false), 530);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        setTilt({
            x:  ((e.clientX - cx) / (rect.width  / 2)) * 8,
            y: -((e.clientY - cy) / (rect.height / 2)) * 8,
        });
    }, []);

    const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

    const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
                particleCount: 60, spread: 100, zIndex: 10000,
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                colors: BDAY_COLORS, scalar: 1.1, gravity: 0.85,
            });
        });
        close();
    }, [close]);

    const triggerToast = useCallback(() => {
        const today = new Date();
        const key = `lyrium_bday_${today.getFullYear()}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
        setExiting(false);
        setNameReady(false);
        setVisible(true);

        const nameTimer = setTimeout(() => setNameReady(true), 720);

        const confettiTimer = setTimeout(() => {
            import('canvas-confetti').then(({ default: confetti }) => {
                confetti({ particleCount: 160, spread: 190, origin: { x: 0.5, y: 0.35 }, colors: BDAY_COLORS, scalar: 1.3, gravity: 0.7, zIndex: 10000 });
                setTimeout(() => {
                    confetti({ particleCount: 90, angle: 60,  spread: 75, origin: { x: 0, y: 0.42 }, colors: BDAY_COLORS, scalar: 1.2, zIndex: 10000 });
                    confetti({ particleCount: 90, angle: 120, spread: 75, origin: { x: 1, y: 0.42 }, colors: BDAY_COLORS, scalar: 1.2, zIndex: 10000 });
                }, 220);
                setTimeout(() => {
                    confetti({ particleCount: 55, spread: 360, startVelocity: 22, origin: { x: 0.5, y: 0.38 }, colors: ['#fbbf24', '#ffffff', '#34d399', '#06b6d4'], shapes: ['star'], scalar: 1.6, gravity: 0.4, zIndex: 10000 });
                }, 480);
                const end = Date.now() + 3800;
                const rain = () => {
                    confetti({ particleCount: 6, angle: 65,  spread: 48, origin: { x: 0, y: 0.5 }, colors: BDAY_COLORS, zIndex: 10000, scalar: 0.9 });
                    confetti({ particleCount: 6, angle: 115, spread: 48, origin: { x: 1, y: 0.5 }, colors: BDAY_COLORS, zIndex: 10000, scalar: 0.9 });
                    if (Date.now() < end) requestAnimationFrame(rain);
                };
                setTimeout(rain, 750);
            });
        }, 680);

        const autoClose = setTimeout(close, 8500);
        return () => {
            clearTimeout(nameTimer);
            clearTimeout(confettiTimer);
            clearTimeout(autoClose);
        };
    }, [close]);

    // Escucha el evento que dispara la página de perfil cuando detecta cumpleaños hoy
    useEffect(() => {
        const handler = () => triggerToast();
        window.addEventListener('lyrium:birthday', handler);
        return () => window.removeEventListener('lyrium:birthday', handler);
    }, [triggerToast]);

    // También se dispara si el auth context ya trae birthday = hoy
    useEffect(() => {
        if (!user?.birthday) return;
        const today = new Date();
        const [, bdayMonth, bdayDay] = user.birthday.split(/[-T]/);
        const isToday =
            today.getMonth() + 1 === parseInt(bdayMonth, 10) &&
            today.getDate()       === parseInt(bdayDay,   10);
        if (!isToday) return;
        triggerToast();
    }, [user, triggerToast]);


    if (!visible) return null;

    const firstName = user?.display_name?.split(' ')[0] ?? 'amigo';

    const D = {
        logo:     380,
        orb:      480,
        label:    620,
        subtitle: 760 + firstName.length * 48 + 180,
        divider:  760 + firstName.length * 48 + 420,
    };

    const T = isDark ? {
        overlay:    'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(16,185,129,0.07) 0%, rgba(0,0,0,0.76) 80%)',
        cardBg:     'linear-gradient(158deg, rgba(11,26,16,0.95) 0%, rgba(6,36,22,0.97) 55%, rgba(10,20,18,0.94) 100%)',
        cardShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 70px rgba(16,185,129,0.08), 0 40px 90px rgba(0,0,0,0.65), 0 0 140px rgba(16,185,129,0.06)',
        glowTop:    'radial-gradient(ellipse at 50% -20%, rgba(16,185,129,0.16) 0%, transparent 70%)',
        shimmer:    'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.055) 50%, transparent 72%)',
        logoBg:     'rgba(16,185,129,0.09)',
        logoBorder: '1px solid rgba(16,185,129,0.22)',
        logoText:   'rgba(52,211,153,0.85)',
        orbBg:      'linear-gradient(145deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.14) 50%, rgba(11,26,16,0.88) 100%)',
        orbBorder:  '1.5px solid rgba(16,185,129,0.38)',
        orbShadow:  'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 32px rgba(16,185,129,0.22)',
        label:      'rgba(255,255,255,0.48)',
        subtitle:   'rgba(255,255,255,0.36)',
        closeBg:    'rgba(255,255,255,0.06)',
        closeBorder:'1px solid rgba(255,255,255,0.1)',
        closeIcon:  'text-white/45',
        closeHover: 'rgba(16,185,129,0.22)',
        divider:    'linear-gradient(90deg, transparent, rgba(52,211,153,0.45), rgba(6,182,212,0.35), transparent)',
        spark1:     'rgba(52,211,153,0.55)',
        spark2:     'rgba(6,182,212,0.45)',
    } : {
        overlay:    'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(13,148,136,0.18) 0%, rgba(15,23,42,0.60) 80%)',
        cardShadow: 'inset 0 0 0 1px rgba(16,185,129,0.14), inset 0 0 70px rgba(16,185,129,0.05), 0 32px 80px rgba(0,0,0,0.22), 0 0 120px rgba(16,185,129,0.08)',
        glowTop:    'radial-gradient(ellipse at 50% -20%, rgba(16,185,129,0.10) 0%, transparent 70%)',
        ...WELCOME_MODAL_LIGHT_CARD,
        logoBg:     'rgba(16,185,129,0.07)',
        logoBorder: '1px solid rgba(16,185,129,0.18)',
        logoText:   'rgba(5,150,105,0.85)',
        orbBg:      'linear-gradient(145deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.10) 50%, rgba(240,252,246,0.92) 100%)',
        orbBorder:  '1.5px solid rgba(16,185,129,0.32)',
        orbShadow:  'inset 0 1px 0 rgba(255,255,255,0.5), 0 0 32px rgba(16,185,129,0.15)',
        ...WELCOME_MODAL_LIGHT_TEXT,
        closeBg:    'rgba(0,0,0,0.05)',
        closeBorder:'1px solid rgba(0,0,0,0.1)',
        closeIcon:  'text-black/40',
        closeHover: 'rgba(16,185,129,0.15)',
        divider:    'linear-gradient(90deg, transparent, rgba(16,185,129,0.45), rgba(6,182,212,0.3), transparent)',
        spark1:     'rgba(16,185,129,0.5)',
        spark2:     'rgba(6,182,212,0.45)',
    };

    return (
        <>
            <style>{BDAY_CSS}</style>

            {/* ── Overlay ─────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{
                    backdropFilter: 'blur(20px) saturate(160%)',
                    background: T.overlay,
                    animation: `${exiting ? 'bdayOverlayOut .53s' : 'bdayOverlayIn .6s'} ease both`,
                }}
                onClick={handleOverlayClick}
            >
                {/* ── Card wrapper — perspectiva 3D + tilt ────────────────── */}
                <div
                    className="relative w-full max-w-[468px]"
                    style={{
                        transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                        transition: 'transform 0.14s ease-out',
                        animation: `${exiting ? 'bdayCardOut .53s' : 'bdayCardIn .72s'} cubic-bezier(0.34,1.56,0.64,1) both`,
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Partículas luminosas flotando alrededor */}
                    {PARTICLES.map((p, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: p.w, height: p.h,
                                background: p.color,
                                top: p.top,
                                ...('left'  in p ? { left:  (p as any).left  } : {}),
                                ...('right' in p ? { right: (p as any).right } : {}),
                                boxShadow: `0 0 ${p.w * 3}px ${p.color}, 0 0 ${p.w * 6}px ${p.color}40`,
                                animation: `${p.anim} ${p.dur} ease-in-out ${p.delay} infinite`,
                            }}
                        />
                    ))}

                    {/* Halo de glow exterior pulsante */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            inset: '-36px',
                            borderRadius: '60px',
                            background: 'radial-gradient(ellipse, rgba(16,185,129,0.32) 0%, rgba(6,182,212,0.18) 45%, transparent 75%)',
                            filter: 'blur(28px)',
                            animation: 'bdayGlowPulse 3.2s ease-in-out infinite',
                        }}
                    />

                    {/* Anillo orbital 1 — horario */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            inset: '-22px',
                            borderRadius: '50%',
                            border: '1px solid rgba(16,185,129,0.2)',
                            animation: 'bdayOrbitCW 14s linear infinite',
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '-4px', left: '50%', marginLeft: '-4px',
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#10b981',
                            boxShadow: '0 0 10px #10b981, 0 0 20px rgba(16,185,129,0.55)',
                        }} />
                    </div>

                    {/* Anillo orbital 2 — antihorario, más lento */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            inset: '-44px',
                            borderRadius: '50%',
                            border: '1px solid rgba(6,182,212,0.13)',
                            animation: 'bdayOrbitCCW 22s linear infinite',
                        }}
                    >
                        <div style={{
                            position: 'absolute', bottom: '-3px', right: '28%', marginRight: '-3px',
                            width: 5, height: 5, borderRadius: '50%',
                            background: '#06b6d4',
                            boxShadow: '0 0 8px #06b6d4, 0 0 16px rgba(6,182,212,0.5)',
                        }} />
                    </div>

                    {/* ── Borde degradado luminoso (1.5px de relleno) ─────── */}
                    <div style={{
                        padding: '1.5px',
                        borderRadius: '38px',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(6,182,212,0.5) 35%, rgba(52,211,153,0.65) 65%, rgba(16,185,129,0.45) 100%)',
                        animation: 'bdayBorderPulse 3s ease-in-out infinite',
                    }}>

                        {/* Card */}
                        <div
                            className="relative overflow-hidden"
                            style={{
                                borderRadius: '37px',
                                background: T.cardBg,
                                backdropFilter: 'blur(44px) saturate(180%)',
                                boxShadow: T.cardShadow,
                            }}
                        >
                            {/* Glow radial superior */}
                            <div className="absolute top-0 inset-x-0 pointer-events-none" style={{
                                height: '180px',
                                background: T.glowTop,
                            }} />

                            {/* Shimmer */}
                            <div className="absolute inset-0 pointer-events-none" style={{
                                background: T.shimmer,
                                width: '75%',
                                animation: 'bdayShimmer 4.5s ease-in-out 1.2s infinite',
                            }} />

                            {/* Rayos cónicos giratorios */}
                            <div className="absolute pointer-events-none" style={{
                                top: 0, left: '50%',
                                width: '300px', height: '300px',
                                marginTop: '-50px',
                                borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.07) 25deg, transparent 50deg, rgba(6,182,212,0.05) 85deg, transparent 110deg, rgba(52,211,153,0.06) 145deg, transparent 170deg, rgba(16,185,129,0.05) 205deg, transparent 230deg, rgba(6,182,212,0.04) 265deg, transparent 290deg, rgba(16,185,129,0.06) 330deg, transparent 360deg)',
                                animation: 'bdayRayRotate 22s linear infinite',
                            }} />

                            {/* Destellos estelares */}
                            {SPARKLES.map((s, i) => (
                                <div key={i} className="absolute pointer-events-none" style={{
                                    top: s.top,
                                    ...('left'  in s ? { left:  (s as any).left  } : {}),
                                    ...('right' in s ? { right: (s as any).right } : {}),
                                    color: i % 2 === 0 ? T.spark1 : T.spark2,
                                    animation: `bdaySparkle ${s.dur} ease-in-out ${s.delay} infinite`,
                                }}>
                                    <StarSVG size={s.size} />
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

                            {/* ── Contenido coreografiado ───────────────────── */}
                            <div className="px-8 pt-10 pb-8 relative">

                                {/* 1 — Logo pill */}
                                <div className="flex justify-center mb-7" style={{
                                    animation: `bdaySlideUp .5s cubic-bezier(.22,1,.36,1) ${D.logo}ms both`,
                                }}>
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
                                        background: T.logoBg,
                                        border: T.logoBorder,
                                    }}>
                                        <img src="/img/iconologo.png" alt="" className="w-4 h-4 opacity-75" />
                                        <p className="text-[10px] font-bold tracking-[0.26em] uppercase"
                                           style={{ color: T.logoText }}>
                                            Lyrium te celebra
                                        </p>
                                    </div>
                                </div>

                                {/* 2 — Orb central con ripples */}
                                <div className="flex justify-center mb-8" style={{
                                    animation: `bdaySlideUp .58s cubic-bezier(.34,1.56,.64,1) ${D.orb}ms both`,
                                }}>
                                    <div className="relative flex items-center justify-center">
                                        {/* Anillos ripple expansivos */}
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="absolute rounded-full pointer-events-none" style={{
                                                inset: `${-(i * 16 + 10)}px`,
                                                border: `1px solid rgba(16,185,129,${0.28 - i * 0.07})`,
                                                animation: `bdayRipple ${2.6 + i * 0.45}s ease-out ${i * 0.65}s infinite`,
                                            }} />
                                        ))}
                                        {/* Glow detrás del orb */}
                                        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                                            transform: 'scale(2)',
                                            background: 'radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(6,182,212,0.25) 45%, transparent 80%)',
                                            filter: 'blur(22px)',
                                            animation: 'bdayOrbPulse 3.8s ease-in-out infinite',
                                        }} />
                                        {/* El orb */}
                                        <div className="relative flex items-center justify-center" style={{
                                            width: 96, height: 96,
                                            borderRadius: '50%',
                                            background: T.orbBg,
                                            border: T.orbBorder,
                                            boxShadow: T.orbShadow,
                                            backdropFilter: 'blur(12px)',
                                            fontSize: '3rem',
                                            animation: 'bdayOrbPulse 4.2s ease-in-out infinite',
                                        }}>
                                            🎂
                                        </div>
                                    </div>
                                </div>

                                {/* 3 — Tipografía escalonada */}
                                <div className="text-center mb-7">
                                    <p className="text-[14px] font-medium mb-2 tracking-wide" style={{
                                        color: T.label,
                                        animation: `bdaySlideUp .48s ease ${D.label}ms both`,
                                    }}>
                                        ¡Feliz Cumpleaños,
                                    </p>

                                    {/* Nombre — HERO, letra por letra */}
                                    <h2
                                        className="text-[52px] font-black leading-none mb-4 flex justify-center flex-wrap"
                                        style={{ letterSpacing: '-0.025em' }}
                                    >
                                        {firstName.split('').map((char, i) => (
                                            <span
                                                key={i}
                                                className="inline-block"
                                                style={{
                                                    backgroundImage: 'linear-gradient(135deg, #10b981 0%, #34d399 30%, #06b6d4 65%, #6ee7b7 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    opacity: nameReady ? undefined : 0,
                                                    animation: nameReady
                                                        ? `bdayLetterIn .52s cubic-bezier(.34,1.56,.64,1) ${i * 48}ms both`
                                                        : 'none',
                                                }}
                                            >
                                                {char === ' ' ? ' ' : char}
                                            </span>
                                        ))}
                                        <span
                                            className="ml-2 inline-block"
                                            style={{
                                                opacity: nameReady ? undefined : 0,
                                                animation: nameReady
                                                    ? `bdayLetterIn .52s cubic-bezier(.34,1.56,.64,1) ${firstName.length * 48 + 60}ms both`
                                                    : 'none',
                                            }}
                                        >🎉</span>
                                    </h2>

                                    <p className="text-[13px] leading-relaxed" style={{
                                        color: T.subtitle,
                                        animation: `bdaySlideUp .48s ease ${D.subtitle}ms both`,
                                    }}>
                                        Que este día sea tan especial como tú ✨
                                    </p>
                                </div>

                                {/* Divisor */}
                                <div style={{
                                    height: '1px',
                                    transformOrigin: 'center',
                                    background: T.divider,
                                    animation: `bdayDrawLine .9s ease-out ${D.divider}ms both`,
                                }} />
                            </div>

                            {/* Barra inferior animada */}
                            <div style={{
                                height: '4px',
                                background: 'linear-gradient(90deg, #10b981, #06b6d4, #34d399, #22d3ee, #10b981)',
                                backgroundSize: '200% auto',
                                animation: 'bdayGradientShift 3s linear infinite',
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Layout ────────────────────────────────────────────────────────────────
export function CustomerLayoutClient({ children }: CustomerLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

    return (
        <DashboardLayout
            header={<CustomerHeader onOpenMenu={toggleSidebar} />}
            sidebar={<CustomerSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-4 md:p-8 bg-[var(--bg-secondary)]"
        >
            {children}
            <NotificationSidebar />
            <ChatBotWidget />
            <CustomerWelcomeToast />
            <BirthdayToast />
        </DashboardLayout>
    );
}
