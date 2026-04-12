'use client';

import { useRouter } from 'next/navigation';
import { Clock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SellerPendingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[var(--bg-primary)] flex items-center justify-center p-4">
            <div className="w-full max-w-[550px] bg-white dark:bg-[var(--bg-secondary)] rounded-[30px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="gridPending" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#gridPending)"/>
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <Clock className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-2">
                            Tienda Pendiente de Aprobación
                        </h1>
                        <p className="text-white/90 text-sm">
                            Tu solicitud está siendo revisada por nuestro equipo
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-8">
                    <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1">
                                    En proceso de revisión
                                </h3>
                                <p className="text-amber-700 dark:text-amber-400/80 text-sm leading-relaxed">
                                    Nuestro equipo está verificando la información de tu tienda. 
                                    Este proceso puede tomar entre 24 a 48 horas hábiles.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-sky-50 dark:bg-sky-900/15 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sky-800 dark:text-sky-300 mb-1">
                                    Te notificaremos por email
                                </h3>
                                <p className="text-sky-700 dark:text-sky-400/80 text-sm leading-relaxed">
                                    Recibirás un email cuando tu tienda sea aprobada y podrás 
                                    acceder a tu panel de vendedor para empezar a gestionar tus productos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
