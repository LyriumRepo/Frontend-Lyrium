'use client';

import { ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

const STEP_CONFIG = {
    1: { title: 'Carrito de compras', desc: 'Revisa tus productos', Icon: ShoppingCart },
    2: { title: 'Finalizar compra', desc: 'Completa tus datos', Icon: CreditCard },
    3: { title: 'Pedido confirmado', desc: 'Tu compra fue procesada', Icon: CheckCircle },
} as const;

export default function CheckoutHeader() {
    const currentStep = useCheckoutStore((s) => s.currentStep);

    const { title, desc, Icon } = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG] || STEP_CONFIG[1];
    const isSuccess = currentStep === 3;

    return (
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-2 animate-fade-in">
            <div className={[
                'py-3 px-8 rounded-2xl relative overflow-hidden shadow-xl transition-all duration-700',
                isSuccess
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-400 shadow-emerald-100 dark:shadow-emerald-900/20'
                    : 'bg-gradient-to-r from-sky-500 via-sky-500 to-sky-300 shadow-sky-100 dark:shadow-sky-900/20'
            ].join(' ')}>
                {/* Decorative blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-white text-center md:text-left">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner shrink-0 scale-110 md:scale-100">
                        <Icon className="w-6 h-6 text-white transition-all duration-500" />
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter leading-none transition-all duration-500">
                            {title}
                        </h3>
                        <p className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-[0.2em] mt-1 transition-all duration-500">
                            {desc}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
