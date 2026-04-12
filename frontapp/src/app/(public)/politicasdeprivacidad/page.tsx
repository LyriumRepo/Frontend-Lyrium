'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    MapPin,
    List,
    X,
    Mail,
    Phone,
    Lock,
    ChevronRight
} from 'lucide-react';
import { privacyData } from '@/shared/lib/constants/privacyData';

export default function PrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState<string>('pp-1');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isBtnMini, setIsBtnMini] = useState(false);
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        // 1. Intersection Observer para resaltar el índice según el scroll
        const observerOptions = {
            root: null,
            rootMargin: '-150px 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        Object.values(sectionRefs.current).forEach(section => {
            if (section) observer.observe(section);
        });

        // 2. Lógica para contraer el botón de índice en móvil al hacer scroll
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            setIsBtnMini(currentScroll > 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setIsPopupOpen(false);
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-16 flex-1 space-y-10 relative">

            {/* ===================== HEADER SECTION ===================== */}
            <section className="text-center space-y-6 animate-in">
                <div className="inline-flex items-center gap-4 bg-emerald-500 px-6 py-3 rounded-full shadow-lg text-white mb-4">
                    <ShieldCheck className="w-8 h-8 animate-float" />
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Políticas de privacidad</h1>
                </div>
                <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
                    Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información cuando utilizas
                    <strong className="text-emerald-600"> LYRIUM BIO MARKETPLACE</strong>.
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 items-start">

                {/* ===================== SIDEBAR INDEX (Desktop) ===================== */}
                <aside className="hidden lg:block sticky top-28 bg-white/90 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <List className="w-5 h-5 text-emerald-500" />
                        <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Contenido</h4>
                    </div>
                    <nav className="space-y-1">
                        {privacyData.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-left text-[13.5px] font-semibold group
                  ${activeSection === section.id
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-emerald-500'}`}
                            >
                                <span className="flex-1">{section.title}</span>
                                <ChevronRight className={`w-4 h-4 transition-all duration-300 
                  ${activeSection === section.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                                />
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* ===================== CONTENT CARD ===================== */}
                <section className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 bg-[length:200%_100%] animate-shimmer-line"></div>

                    <div className="p-8 md:p-12 space-y-12">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Política de Privacidad y Protección de Datos</h2>
                            <div className="text-emerald-500 font-bold text-sm tracking-widest">- LYRIUM BIOMARKETPLACE -</div>
                        </div>

                        {privacyData.map((section) => (
                            <div
                                key={section.id}
                                id={section.id}
                                ref={el => { sectionRefs.current[section.id] = el }}
                                className="space-y-6 pt-10 border-t border-dashed border-gray-100 first:border-0 first:pt-0 group/section"
                            >
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight group-hover/section:text-emerald-600 transition-colors">
                                        {section.title}
                                    </h3>
                                    {section.badge && (
                                        <span className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full shadow-sm">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {section.badge}
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 text-lg leading-relaxed">
                                    {section.content}
                                </p>

                                {section.subSections && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {section.subSections.map((sub) => (
                                            <div key={sub.title} className="bg-slate-50 p-6 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                                                    {sub.title}
                                                </h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">{sub.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {section.list && (
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {section.list.map((item) => (
                                            <li key={item} className="flex items-center gap-3 text-gray-600 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {section.id === 'pp-13' && (
                                    <div className="mt-8 pt-8 border-t border-gray-50 text-center text-sm text-gray-400 italic">
                                        Última actualización: <strong>2025</strong>. Al usar LYRIUM BIO MARKETPLACE, aceptas los términos descritos en esta política.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ===================== MOBILE POPUP (Floating Index) ===================== */}
            <button
                onClick={() => setIsPopupOpen(true)}
                className={`lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-500 text-white flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl transition-all duration-500 
          ${isBtnMini ? 'w-16 h-16 px-0 justify-center rounded-full' : 'w-auto'}`}
            >
                <List className="w-6 h-6" />
                {!isBtnMini && <span className="font-bold uppercase tracking-widest text-xs">Índice</span>}
            </button>

            {/* MOBILE POPUP OVERLAY */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${isPopupOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500 ${isPopupOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsPopupOpen(false)}
                    role="presentation"
                    aria-hidden="true"
                />

                {/* Modal */}
                <div className={`absolute bottom-0 left-0 w-full bg-white rounded-t-[3rem] shadow-2xl transition-transform duration-500 transform ${isPopupOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <span className="text-lg font-black uppercase tracking-tight text-gray-900">Contenido</span>
                            <button onClick={() => setIsPopupOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                            {privacyData.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 text-left text-sm font-bold
                    ${activeSection === section.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 bg-gray-50'}`}
                                >
                                    <span className="flex-1 truncate pr-4">{section.title}</span>
                                    <ChevronRight className="w-5 h-5 opacity-60" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
