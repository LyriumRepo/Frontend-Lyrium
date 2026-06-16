'use client';

import React, { useEffect, useState, useCallback } from 'react';
import CustomerSidebar from '@/components/layout/customer/CustomerSidebar';
import CustomerHeader from '@/components/layout/customer/CustomerHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/shared/lib/context/AuthContext';
import Icon from '@/components/ui/Icon';

interface CustomerLayoutClientProps {
    children: React.ReactNode;
}

const BDAY_COLORS = ['#64c695', '#bef264', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa', '#fb7185', '#34d399'];

function BirthdayToast() {
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    const close = useCallback(() => {
        setExiting(true);
        setTimeout(() => setVisible(false), 450);
    }, []);

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
            // Explosión inicial masiva
            confetti({ particleCount: 220, spread: 200, origin: { x: 0.5, y: 0.4 }, colors: BDAY_COLORS, scalar: 1.4, gravity: 0.7, zIndex: 10000 });

            // Cañones laterales simultáneos
            setTimeout(() => {
                confetti({ particleCount: 130, angle: 60, spread: 80, origin: { x: 0, y: 0.45 }, colors: BDAY_COLORS, shapes: ['star', 'circle'], scalar: 1.3, zIndex: 10000 });
                confetti({ particleCount: 130, angle: 120, spread: 80, origin: { x: 1, y: 0.45 }, colors: BDAY_COLORS, shapes: ['star', 'circle'], scalar: 1.3, zIndex: 10000 });
            }, 300);

            // Lluvia de estrellas doradas desde arriba
            setTimeout(() => {
                confetti({ particleCount: 90, spread: 180, origin: { x: 0.5, y: 0 }, colors: ['#fbbf24', '#f59e0b', '#ffffff', '#f472b6', '#a78bfa'], shapes: ['star'], scalar: 1.7, gravity: 0.45, zIndex: 10000 });
            }, 600);

            // Segunda ráfaga diagonal
            setTimeout(() => {
                confetti({ particleCount: 110, angle: 75, spread: 95, origin: { x: 0.08, y: 0.42 }, colors: BDAY_COLORS, zIndex: 10000 });
                confetti({ particleCount: 110, angle: 105, spread: 95, origin: { x: 0.92, y: 0.42 }, colors: BDAY_COLORS, zIndex: 10000 });
            }, 900);

            // Tercera ráfaga central
            setTimeout(() => {
                confetti({ particleCount: 160, spread: 360, startVelocity: 30, origin: { x: 0.5, y: 0.5 }, colors: BDAY_COLORS, scalar: 1.1, gravity: 0.8, zIndex: 10000 });
            }, 1400);

            // Lluvia continua intensa
            const end = Date.now() + 7000;
            const rain = () => {
                confetti({ particleCount: 10, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, colors: BDAY_COLORS, zIndex: 10000, scalar: 0.9 });
                confetti({ particleCount: 10, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, colors: BDAY_COLORS, zIndex: 10000, scalar: 0.9 });
                if (Date.now() < end) requestAnimationFrame(rain);
            };
            setTimeout(rain, 1800);
        });

        const timer = setTimeout(close, 12000);
        return () => clearTimeout(timer);
    }, [user, close]);

    if (!visible) return null;

    const firstName = user?.display_name?.split(' ')[0] ?? 'amigo';

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${exiting ? 'animate-bday-fade-out' : 'animate-bday-fade-in'}`}
            style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.6)' }}
            onClick={close}
        >
            <div
                className={`relative w-full max-w-[440px] ${exiting ? 'animate-birthday-out' : 'animate-birthday-in'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Glow exterior gigante pulsante */}
                <div
                    className="absolute inset-[-24px] rounded-[48px] blur-3xl animate-birthday-glow pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #64c695, #a78bfa, #f472b6, #fbbf24)' }}
                />

                {/* Card principal */}
                <div
                    className="relative rounded-[36px] overflow-hidden border border-white/15"
                    style={{
                        background: 'linear-gradient(160deg, #0d1f14 0%, #1a0b30 50%, #0d1230 100%)',
                        boxShadow: '0 0 100px rgba(167,139,250,0.35), 0 0 40px rgba(100,198,149,0.2), 0 25px 50px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Shimmer sweep */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.08) 50%, transparent 65%)',
                            width: '60%',
                            animation: 'bdayShimmer 2.8s ease-in-out infinite',
                        }}
                    />

                    {/* Rayos giratorios detrás del emoji */}
                    <div
                        className="absolute top-0 left-1/2 w-72 h-72 -mt-12 pointer-events-none"
                        style={{
                            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(100,198,149,0.1) 30deg, transparent 60deg, rgba(167,139,250,0.1) 90deg, transparent 120deg, rgba(244,114,182,0.1) 150deg, transparent 180deg, rgba(251,191,36,0.08) 210deg, transparent 240deg, rgba(100,198,149,0.1) 270deg, transparent 300deg, rgba(167,139,250,0.1) 330deg, transparent 360deg)',
                            animation: 'bdayRays 10s linear infinite',
                            borderRadius: '50%',
                        }}
                    />

                    {/* Decoraciones flotantes en esquinas */}
                    <span className="absolute top-5 left-6 text-2xl animate-float-emoji" style={{ animationDelay: '0ms' }}>🎊</span>
                    <span className="absolute top-4 right-16 text-xl animate-float-emoji" style={{ animationDelay: '350ms' }}>✨</span>
                    <span className="absolute bottom-16 left-5 text-xl animate-float-emoji" style={{ animationDelay: '700ms' }}>🎈</span>
                    <span className="absolute bottom-14 right-6 text-xl animate-float-emoji" style={{ animationDelay: '150ms' }}>💫</span>
                    <span className="absolute top-1/2 left-3 text-lg animate-float-emoji" style={{ animationDelay: '550ms' }}>⭐</span>
                    <span className="absolute top-1/2 right-3 text-lg animate-float-emoji" style={{ animationDelay: '900ms' }}>🌟</span>

                    <div className="px-8 pt-10 pb-7 relative">
                        {/* Subtítulo arriba */}
                        <p className="text-center text-[10.5px] font-bold tracking-[0.3em] uppercase mb-6"
                           style={{ color: 'rgba(255,255,255,0.35)' }}>
                            ✦ Lyrium te desea ✦
                        </p>

                        {/* Emoji gigante con glow */}
                        <div className="flex justify-center mb-7">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 rounded-full blur-2xl scale-[1.6] pointer-events-none"
                                    style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.7) 0%, rgba(167,139,250,0.5) 40%, rgba(100,198,149,0.3) 80%)', }}
                                />
                                <div
                                    className="relative w-28 h-28 rounded-full border-2 border-white/20 flex items-center justify-center text-[3.5rem] shadow-2xl animate-bday-emoji-pulse"
                                    style={{ background: 'linear-gradient(145deg, #1a4a2e, #3a1260, #1a2050)' }}
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
                            <h3
                                className="text-[38px] font-black leading-none mb-4 animate-gradient-shift"
                                style={{
                                    background: 'linear-gradient(90deg, #64c695, #a78bfa, #f472b6, #fbbf24, #64c695)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                {firstName} 🎉
                            </h3>
                            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                Que este día esté lleno de alegría<br />
                                y momentos increíbles ✨
                            </p>
                        </div>

                        {/* Divisor brillante */}
                        <div className="my-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

                        {/* Emojis festivos grandes */}
                        <div className="flex justify-center gap-3">
                            {['🎁', '🎈', '🎊', '🌟', '🎉', '🥳', '🎆'].map((emoji, i) => (
                                <span
                                    key={i}
                                    className="text-[1.6rem] animate-float-emoji"
                                    style={{ animationDelay: `${i * 140}ms` }}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Barra inferior animada gruesa */}
                    <div
                        className="h-[5px] w-full animate-gradient-shift"
                        style={{ background: 'linear-gradient(90deg, #64c695, #a78bfa, #f472b6, #fbbf24, #64c695)' }}
                    />

                    {/* Botón cerrar */}
                    <button
                        onClick={close}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
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
            <BirthdayToast />
        </DashboardLayout>
    );
}
