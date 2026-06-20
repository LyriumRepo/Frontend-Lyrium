'use client';

import React, { useEffect, useState, useCallback } from 'react';
import CustomerSidebar from '@/components/layout/customer/CustomerSidebar';
import CustomerHeader from '@/components/layout/customer/CustomerHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/shared/lib/context/AuthContext';
import Icon from '@/components/ui/Icon';
import ChatBotWidget from '@/features/chatbot/components/ChatBotWidget';

interface CustomerLayoutClientProps {
    children: React.ReactNode;
}

// ─── Paleta confeti ────────────────────────────────────────────────────────
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

    // Delays de coreografía en ms
    const D = {
        logo:     380,
        orb:      480,
        label:    620,
        // nombre: nameReady se activa en 720ms por estado
        subtitle: 760 + firstName.length * 48 + 180,
        divider:  760 + firstName.length * 48 + 420,
    };

    return (
        <>
            <style>{BDAY_CSS}</style>

            {/* ── Overlay ─────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{
                    backdropFilter: 'blur(20px) saturate(160%)',
                    background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(16,185,129,0.07) 0%, rgba(0,0,0,0.74) 80%)',
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

                        {/* ── Card glassmorphism ──────────────────────────── */}
                        <div
                            className="relative overflow-hidden"
                            style={{
                                borderRadius: '37px',
                                background: 'linear-gradient(158deg, rgba(11,26,16,0.94) 0%, rgba(6,36,22,0.96) 55%, rgba(10,20,18,0.93) 100%)',
                                backdropFilter: 'blur(44px) saturate(180%)',
                                boxShadow: [
                                    'inset 0 0 0 1px rgba(255,255,255,0.04)',
                                    'inset 0 0 70px rgba(16,185,129,0.08)',
                                    '0 40px 90px rgba(0,0,0,0.65)',
                                    '0 0 140px rgba(16,185,129,0.06)',
                                ].join(', '),
                            }}
                        >
                            {/* Glow radial superior interior */}
                            <div className="absolute top-0 inset-x-0 pointer-events-none" style={{
                                height: '180px',
                                background: 'radial-gradient(ellipse at 50% -20%, rgba(16,185,129,0.16) 0%, transparent 70%)',
                            }} />

                            {/* Sweep de shimmer */}
                            <div className="absolute inset-0 pointer-events-none" style={{
                                background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.055) 50%, transparent 72%)',
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
                                    color: i % 2 === 0 ? 'rgba(52,211,153,0.55)' : 'rgba(6,182,212,0.45)',
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
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(8px)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.22)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                            >
                                <Icon name="X" className="w-3.5 h-3.5 text-white/45" />
                            </button>

                            {/* ── Contenido coreografiado ───────────────────── */}
                            <div className="px-8 pt-10 pb-8 relative">

                                {/* 1 — Logo pill */}
                                <div className="flex justify-center mb-7" style={{
                                    animation: `bdaySlideUp .5s cubic-bezier(.22,1,.36,1) ${D.logo}ms both`,
                                }}>
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
                                        background: 'rgba(16,185,129,0.09)',
                                        border: '1px solid rgba(16,185,129,0.22)',
                                    }}>
                                        <img src="/img/iconologo.png" alt="" className="w-4 h-4 opacity-75" />
                                        <p className="text-[10px] font-bold tracking-[0.26em] uppercase"
                                           style={{ color: 'rgba(52,211,153,0.85)' }}>
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
                                            background: 'linear-gradient(145deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.14) 50%, rgba(11,26,16,0.88) 100%)',
                                            border: '1.5px solid rgba(16,185,129,0.38)',
                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 32px rgba(16,185,129,0.22)',
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
                                    {/* "¡Feliz Cumpleaños," — ligero, sutil */}
                                    <p className="text-[14px] font-medium mb-2 tracking-wide" style={{
                                        color: 'rgba(255,255,255,0.48)',
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

                                    {/* Subtítulo */}
                                    <p className="text-[13px] leading-relaxed" style={{
                                        color: 'rgba(255,255,255,0.36)',
                                        animation: `bdaySlideUp .48s ease ${D.subtitle}ms both`,
                                    }}>
                                        Que este día sea tan especial como tú ✨
                                    </p>
                                </div>

                                {/* 4 — Divisor que se dibuja desde el centro */}
                                <div style={{
                                    height: '1px',
                                    transformOrigin: 'center',
                                    background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.45), rgba(6,182,212,0.35), transparent)',
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
            <ChatBotWidget />
            <BirthdayToast />
        </DashboardLayout>
    );
}
