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

const BDAY_COLORS = ['#10b981', '#34d399', '#06b6d4', '#22d3ee', '#6ee7b7', '#fbbf24', '#f472b6', '#a78bfa'];

function BirthdayToast() {
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const close = useCallback(() => {
        setExiting(true);
        setTimeout(() => setVisible(false), 450);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        setTilt({
            x: ((e.clientX - cx) / (rect.width / 2)) * 6,
            y: -((e.clientY - cy) / (rect.height / 2)) * 6,
        });
    }, []);

    const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

    const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
                particleCount: 55, spread: 120, zIndex: 10000,
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                colors: BDAY_COLORS, scalar: 1.2, gravity: 0.9,
            });
        });
        close();
    }, [close]);

    useEffect(() => {
        if (!user?.birthday) return;
        const today = new Date();
        const [, bdayMonth, bdayDay] = user.birthday.split(/[-T]/);
        const isToday =
            today.getMonth() + 1 === parseInt(bdayMonth, 10) &&
            today.getDate() === parseInt(bdayDay, 10);
        if (!isToday) return;
        const key = `lyrium_bday_${today.getFullYear()}_${user.id}_${bdayMonth}-${bdayDay}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
        setVisible(true);
        setExiting(false);

        import('canvas-confetti').then(({ default: confetti }) => {
            confetti({ particleCount: 200, spread: 200, origin: { x: 0.5, y: 0.4 }, colors: BDAY_COLORS, scalar: 1.4, gravity: 0.7, zIndex: 10000 });
            setTimeout(() => {
                confetti({ particleCount: 120, angle: 60, spread: 80, origin: { x: 0, y: 0.45 }, colors: BDAY_COLORS, shapes: ['star', 'circle'], scalar: 1.3, zIndex: 10000 });
                confetti({ particleCount: 120, angle: 120, spread: 80, origin: { x: 1, y: 0.45 }, colors: BDAY_COLORS, shapes: ['star', 'circle'], scalar: 1.3, zIndex: 10000 });
            }, 250);
            setTimeout(() => {
                confetti({ particleCount: 80, spread: 180, origin: { x: 0.5, y: 0 }, colors: ['#fbbf24', '#f59e0b', '#ffffff', '#34d399', '#06b6d4'], shapes: ['star'], scalar: 1.7, gravity: 0.45, zIndex: 10000 });
            }, 520);
            setTimeout(() => {
                confetti({ particleCount: 100, angle: 75, spread: 95, origin: { x: 0.08, y: 0.42 }, colors: BDAY_COLORS, zIndex: 10000 });
                confetti({ particleCount: 100, angle: 105, spread: 95, origin: { x: 0.92, y: 0.42 }, colors: BDAY_COLORS, zIndex: 10000 });
            }, 850);
            setTimeout(() => {
                confetti({ particleCount: 140, spread: 360, startVelocity: 30, origin: { x: 0.5, y: 0.5 }, colors: BDAY_COLORS, scalar: 1.1, gravity: 0.8, zIndex: 10000 });
            }, 1350);
            const end = Date.now() + 4500;
            const rain = () => {
                confetti({ particleCount: 8, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, colors: BDAY_COLORS, zIndex: 10000, scalar: 0.9 });
                confetti({ particleCount: 8, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, colors: BDAY_COLORS, zIndex: 10000, scalar: 0.9 });
                if (Date.now() < end) requestAnimationFrame(rain);
            };
            setTimeout(rain, 1700);
        });

        const timer = setTimeout(close, 7000);
        return () => clearTimeout(timer);
    }, [user, close]);

    if (!visible) return null;

    const firstName = user?.display_name?.split(' ')[0] ?? 'amigo';

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${exiting ? 'animate-bday-fade-out' : 'animate-bday-fade-in'}`}
            style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.65)' }}
            onClick={handleOverlayClick}
        >
            <div
                className={`relative w-full max-w-[440px] ${exiting ? 'animate-birthday-out' : 'animate-birthday-in'}`}
                style={{ transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`, transition: 'transform 0.12s ease-out' }}
                onClick={e => e.stopPropagation()}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Glow exterior — paleta Lyrium */}
                <div
                    className="absolute inset-[-24px] rounded-[48px] blur-3xl animate-birthday-glow pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4, #34d399, #6ee7b7)' }}
                />

                {/* Card principal */}
                <div
                    className="relative rounded-[36px] overflow-hidden border border-white/15"
                    style={{
                        background: 'linear-gradient(160deg, #0b1a10 0%, #0f2318 50%, #0a1c14 100%)',
                        boxShadow: '0 0 80px rgba(16,185,129,0.3), 0 0 40px rgba(6,182,212,0.2), 0 25px 50px rgba(0,0,0,0.55)',
                    }}
                >
                    {/* Shimmer sweep */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)',
                            width: '60%',
                            animation: 'bdayShimmer 3.2s ease-in-out infinite',
                        }}
                    />

                    {/* Rayos cónicos — oscilan en lugar de girar siempre */}
                    <div
                        className="absolute top-0 left-1/2 w-72 h-72 -mt-12 pointer-events-none"
                        style={{
                            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.12) 30deg, transparent 60deg, rgba(6,182,212,0.1) 90deg, transparent 120deg, rgba(52,211,153,0.1) 150deg, transparent 180deg, rgba(251,191,36,0.08) 210deg, transparent 240deg, rgba(16,185,129,0.1) 270deg, transparent 300deg, rgba(6,182,212,0.08) 330deg, transparent 360deg)',
                            animation: 'bdayRays 14s ease-in-out infinite alternate',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Emojis decorativos — cada uno con su propio movimiento */}
                    <span className="absolute top-5 left-6 text-2xl animate-float-emoji-spin" style={{ animationDelay: '0ms' }}>🎊</span>
                    <span className="absolute top-4 right-16 text-xl animate-float-emoji-zig" style={{ animationDelay: '200ms' }}>✨</span>
                    <span className="absolute bottom-16 left-5 text-xl animate-float-emoji-pop" style={{ animationDelay: '700ms' }}>🎈</span>
                    <span className="absolute bottom-14 right-6 text-xl animate-float-emoji-spin" style={{ animationDelay: '400ms' }}>💫</span>
                    <span className="absolute top-1/2 left-3 text-lg animate-float-emoji" style={{ animationDelay: '550ms' }}>⭐</span>
                    <span className="absolute top-1/2 right-3 text-lg animate-float-emoji-zig" style={{ animationDelay: '900ms' }}>🌟</span>

                    <div className="px-8 pt-9 pb-7 relative">
                        {/* Logo Lyrium + subtítulo */}
                        <div className="flex items-center justify-center gap-2 mb-5">
                            <img src="/img/iconologo.png" alt="" className="w-5 h-5 opacity-70" />
                            <p className="text-[10.5px] font-bold tracking-[0.28em] uppercase"
                               style={{ color: 'rgba(52,211,153,0.75)' }}>
                                Lyrium te desea
                            </p>
                            <img src="/img/iconologo.png" alt="" className="w-5 h-5 opacity-70" />
                        </div>

                        {/* Emoji gigante con glow */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 rounded-full blur-2xl scale-[1.6] pointer-events-none"
                                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(6,182,212,0.4) 40%, rgba(52,211,153,0.2) 80%)' }}
                                />
                                <div
                                    className="relative w-28 h-28 rounded-full border-2 border-white/20 flex items-center justify-center text-[3.5rem] shadow-2xl animate-bday-emoji-pulse"
                                    style={{ background: 'linear-gradient(145deg, #0d2a1a, #0a2020, #0d2230)' }}
                                >
                                    🎂
                                </div>
                            </div>
                        </div>

                        {/* Texto principal */}
                        <div className="text-center mb-6">
                            <h2 className="text-[26px] font-black text-white leading-none mb-3 tracking-tight">
                                ¡Feliz Cumpleaños!
                            </h2>
                            {/* Nombre letra por letra con stagger */}
                            <h3 className="text-[38px] font-black leading-none mb-4 flex justify-center flex-wrap gap-0">
                                {firstName.split('').map((char, i) => (
                                    <span
                                        key={i}
                                        className="animate-bday-letter-in inline-block"
                                        style={{
                                            background: 'linear-gradient(90deg, #10b981, #06b6d4, #34d399, #fbbf24, #10b981)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            backgroundSize: '300% auto',
                                            animationDelay: `${i * 60}ms`,
                                        }}
                                    >
                                        {char === ' ' ? ' ' : char}
                                    </span>
                                ))}
                                <span className="ml-1 animate-bday-letter-in inline-block" style={{ animationDelay: `${firstName.length * 60}ms` }}>🎉</span>
                            </h3>
                            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                Que este día esté lleno de alegría<br />
                                y momentos increíbles ✨
                            </p>
                        </div>

                        {/* Divisor brillante */}
                        <div className="my-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)' }} />

                        {/* Emojis festivos — movimientos distintos */}
                        <div className="flex justify-center gap-3">
                            {['🎁', '🎈', '🎊', '🌟', '🎉', '🥳', '🎆'].map((emoji, i) => (
                                <span
                                    key={i}
                                    className={`text-[1.6rem] ${i % 3 === 0 ? 'animate-float-emoji-spin' : i % 3 === 1 ? 'animate-float-emoji-pop' : 'animate-float-emoji-zig'}`}
                                    style={{ animationDelay: `${i * 130}ms` }}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Barra inferior — paleta Lyrium */}
                    <div
                        className="h-[5px] w-full animate-gradient-shift"
                        style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4, #34d399, #6ee7b7, #10b981)' }}
                    />

                    {/* Botón cerrar */}
                    <button
                        onClick={e => { e.stopPropagation(); close(); }}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.25)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    >
                        <Icon name="X" className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </div>
        </div>
    );
}

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
