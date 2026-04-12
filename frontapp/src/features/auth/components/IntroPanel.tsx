'use client';

import { Building2 } from 'lucide-react';
import type { AuthMode, UserType, IntroConfig } from '../types/auth';

interface IntroPanelProps {
    mode: AuthMode;
    userType: UserType;
    onToggleMode: () => void;
}

const INTRO_CONFIGS: Record<UserType, IntroConfig> = {
    vendedor: {
        title: 'El Marketplace que cuida tu marca',
        subtitle: 'Únete a la comunidad de vendedores que están transformando el comercio sostenible',
        icon: 'Building2',
        backgroundImage: '/img/intro/imagenVendedoresloginTienda.png',
        iconSize: '112px'
    },
    cliente: {
        title: 'Únete a la evolución del comercio',
        subtitle: 'Crea tu cuenta en Lyrium y posiciona tu marca en el marketplace que cuida el futuro.',
        icon: 'Flower2',
        backgroundImage: '/img/intro/loginIngresar.png',
        iconSize: '112px'
    }
};

const CONTENT: Record<AuthMode, Record<UserType, { title: string; subtitle: string; buttonText: string }>> = {
    login: {
        vendedor: {
            title: '¡Qué gusto verte de nuevo!',
            subtitle: 'Accede a tu panel para revisar tus ventas de hoy y actualizar tu inventario.',
            buttonText: 'Registrarse como vendedor'
        },
        cliente: {
            title: '¡Bienvenido de nuevo!',
            subtitle: 'Accede a tu cuenta para realizar tus compras y gestionar tus pedidos.',
            buttonText: 'Crear cuenta'
        }
    },
    register: {
        vendedor: {
            title: 'Haz crecer tu marca con nosotros.',
            subtitle: 'Únete a la comunidad de vendedores más grande y gestiona tus pedidos en un solo lugar.',
            buttonText: 'Iniciar Sesión'
        },
        cliente: {
            title: 'Únete a Lyrium',
            subtitle: 'Crea tu cuenta y descubre los mejores productos naturales y saludables.',
            buttonText: 'Iniciar Sesión'
        }
    }
};

const TOGGLE_LABELS: Record<UserType, string> = {
    vendedor: '¿Ya eres parte de Lyrium como vendedor?',
    cliente: '¿Ya tienes una cuenta?'
};

export function IntroPanel({ mode, userType, onToggleMode }: IntroPanelProps) {
    const isRegister = mode === 'register';
    const content = CONTENT[mode][userType];
    const toggleLabel = TOGGLE_LABELS[userType];

    return (
        <div
            className={`absolute top-0 left-0 h-full w-[40%] bg-gradient-to-br from-sky-500 via-sky-400 to-lime-400 p-10 flex flex-col justify-between text-white z-20 transition-[transform] duration-700 ease-out rounded-r-[20px] ${isRegister ? 'translate-x-full' : 'translate-x-0'}`}
            style={{ 
                background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #84cc16 100%)',
                transform: isRegister ? 'translateX(150%)' : 'translateX(0)'
            }}
        >
            <div className="absolute inset-0 opacity-30 animate-[gridMove_20s_linear_infinite]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="gridLogin" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#gridLogin)" />
                </svg>
            </div>

            <div className="relative z-10">
                <h2 className="text-[2rem] font-black mb-4 leading-tight">
                    {content.title}
                </h2>
                <p className="text-white/95 text-center max-w-[300px] mx-auto">
                    {content.subtitle}
                </p>
            </div>

            <div className="relative z-10">
                <p className="text-sm mb-4 opacity-90">
                    {isRegister ? '¿Ya tienes cuenta?' : toggleLabel}
                </p>
                <button
                    type="button"
                    onClick={onToggleMode}
                    className="w-full py-4 px-6 bg-white text-sky-500 rounded-xl font-bold text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300"
                >
                    {content.buttonText}
                </button>
            </div>

            <div className="absolute -bottom-40 -right-20 opacity-15 pointer-events-none z-0">
                <Building2 className="w-[320px] h-[320px] text-white" />
            </div>
        </div>
    );
}
