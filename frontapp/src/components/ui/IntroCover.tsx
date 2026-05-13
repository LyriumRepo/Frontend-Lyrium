'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

interface IntroCoverProps {
    title: string;
    subtitle: string;
    icon: string;
    buttonText: string;
    buttonIcon?: string;
    onEnter: () => void;
    autoHideAfter?: number;
    backgroundImage?: string;
    iconSize?: string;
}

export default function IntroCover({
    title,
    subtitle,
    icon,
    buttonText,
    buttonIcon = 'ArrowRight',
    onEnter,
    autoHideAfter = 3000,
    backgroundImage = '',
    iconSize = '120px',
}: IntroCoverProps) {
    const [showIntro, setShowIntro] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (autoHideAfter > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => setShowIntro(false), 800);
            }, autoHideAfter);
            return () => clearTimeout(timer);
        }
    }, [autoHideAfter]);

    const handleEnter = () => {
        setIsExiting(true);
        setTimeout(() => {
            onEnter();
        }, 800);
    };

    if (!showIntro) return null;

    const introCoverStyle: React.CSSProperties = backgroundImage 
        ? {
            background: `linear-gradient(135deg, var(--intro-g1) 0%, var(--intro-g2) 60%, var(--intro-g3) 100%), url(${backgroundImage}) center/cover no-repeat`,
            transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }
        : {
            background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #84cc16 100%)',
            transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        };

    return (
        <div 
            className={`fixed inset-0 w-full h-screen z-[9999] flex items-center justify-center ${isExiting ? 'opacity-0 translate-y-[-100px] scale-95' : ''}`}
            style={introCoverStyle}
        >
            {/* Overlay */}
            <div 
                className="absolute inset-0 z-[1]" 
                style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.3) 100%)' }}
            />
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
                <div className="absolute top-[10%] left-[10%] w-24 h-24 bg-white/30 dark:bg-white/20 rounded-full animate-float-particle" />
                <div className="absolute top-[60%] right-[15%] w-36 h-36 bg-white/30 dark:bg-white/20 rounded-full animate-float-particle" style={{ animationDelay: '5s' }} />
                <div className="absolute bottom-[15%] left-[20%] w-20 h-20 bg-white/30 dark:bg-white/20 rounded-full animate-float-particle" style={{ animationDelay: '10s' }} />
            </div>

            {/* Contenido */}
            <div className="relative z-[2] text-center max-w-[800px] p-10">
                <div className="mb-10 animate-float">
                    <Icon 
                        name={icon} 
                        className="mx-auto text-white dark:text-white/80" 
                        style={{ 
                            fontSize: iconSize, 
                            width: iconSize, 
                            height: iconSize, 
                            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))' 
                        }} 
                    />
                </div>
                
                <h1 
                    className="text-6xl font-black text-white dark:text-white/80 mb-5 leading-tight"
                    style={{ 
                        textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                        animation: 'fadeInUp 1s ease-out 0.2s both'
                    }}
                >
                    {title}
                </h1>
                
                <p 
                    className="text-xl text-white/95 mb-12 leading-relaxed"
                    style={{ 
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                        animation: 'fadeInUp 1s ease-out 0.4s both'
                    }}
                >
                    {subtitle}
                </p>
                
                <button
                    type="button"
                    onClick={handleEnter}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEnter(); }}
                    aria-label={buttonText}
                    className="inline-flex items-center gap-3 py-5 px-12 bg-white dark:bg-white/80 text-sky-500 dark:text-[var(--brand-green)] rounded-full text-lg font-bold cursor-pointer uppercase tracking-wider"
                    style={{ 
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        transition: 'box-shadow 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        animation: 'fadeInUp 1s ease-out 0.6s both, pulse 2s ease-in-out 2s infinite'
                    }}
                >
                    <span>{buttonText}</span>
                    <Icon name={buttonIcon} className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
