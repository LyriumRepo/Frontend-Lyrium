'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    MessageCircle,
    Mail,
    ChevronDown,
    Plus,
    Minus,
    Users,
    ShoppingCart,
    Store as StoreIcon,
    HelpCircle
} from 'lucide-react';
import { faqData, benefitsData } from '@/shared/lib/constants/faqData';

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<string[]>([]);
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const itemId = `${categoryIndex}-${itemIndex}`;
        setOpenItems(prev => {
            // Accordion exclusivo: si se abre uno, se cierran los demás
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            } else {
                return [itemId];
            }
        });
    };

    const scrollToSection = (id: string) => {
        const element = sectionRefs.current[id];
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };


    const getCategoryIcon = (id: string) => {
        switch (id) {
            case 'todos': return <Users className="w-8 h-8" />;
            case 'comprador': return <ShoppingCart className="w-8 h-8" />;
            case 'vendedor': return <StoreIcon className="w-8 h-8" />;
            default: return null;
        }
    };

    const getCategoryColor = (color: string) => {
        switch (color) {
            case 'sky': return 'from-sky-400 to-sky-600';
            case 'emerald': return 'from-emerald-400 to-emerald-600';
            case 'violet': return 'from-violet-400 to-violet-600';
            case 'limeCustom': return 'from-[#bde90d] to-[#9bc20c]'; 
            case 'greenCustom': return 'from-[#78e69d] to-[#4fd17d]'; 
            case 'blueCustom': return 'from-[#59a6cb] to-[#3b8fb5]';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const getInnerColor = (color: string) => {
        switch (color) {
            case 'sky': return 'from-sky-50 to-cyan-50';
            case 'emerald': return 'from-emerald-50 to-teal-50';
            case 'violet': return 'from-violet-50 to-purple-50';
            case 'limeCustom': return `from-[#f2fcbf] to-[#e6f58a] dark:from-[#a3c63a] dark:to-[#a3c63a]`;            
            case 'greenCustom': return `from-[#d4f7e8] to-[#baf2da] dark:from-[#34d399] dark:to-[#34d399]`;            
            case 'blueCustom': return `from-[#dceff7] to-[#c2e4f2] dark:from-[#38bdf8] dark:to-[#38bdf8]`;            
            default: return 'from-gray-50 to-slate-50';
        }
    };

    const getActiveColor = (color: string) => {
        switch (color) {
            case 'limeCustom': return 'text-[#bde90d]';
            case 'greenCustom': return 'text-[#78e69d]';
            case 'blueCustom': return 'text-[#59a6cb]';
            case 'sky': return 'text-sky-500';
            case 'emerald': return 'text-emerald-500';
            case 'violet': return 'text-violet-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-16 space-y-16 md:space-y-24">
            {/* ===================== HEADER SECTION ===================== */}
            <section className="text-center space-y-4 animate-in">
               <div className="flex justify-center mb-6">
        <h1 className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 md:py-4
               w-full rounded-full
               bg-gradient-to-r from-sky-500 to-sky-400
               dark:from-[#1A3A32] dark:to-[var(--brand-green)]
               text-white
               shadow-[0_10px_25px_rgba(14,165,233,0.2)]
               dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)]
               font-black tracking-tight text-center
               text-base sm:text-lg md:text-[clamp(20px,2.6vw,34px)]" >
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
             className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 shrink-0 animate-float" >
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4"/>
        <line x1="12" y1="17" x2="12" y2="17"/>
        </svg> Preguntas Frecuentes </h1>
</div>
                <p className="text-gray-500 dark:text-white max-w-2xl mx-auto text-lg">
                    Encuentra respuestas rápidas a todas tus dudas sobre nuestra plataforma y servicios.
                </p>
            </section>

            {/* ===================== TABS NAVIGATION ===================== */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {faqData.map((category, index) => (
                    <button
                        key={category.id}
                        onClick={() => scrollToSection(category.id)}
                        className="group shine-effect rounded-4xl border-2 border-gray-100 bg-white dark:bg-[#111A15] shadow-lg p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-sky-200"
                    >
                        <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getCategoryColor(category.color)} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            {getCategoryIcon(category.id)}
                        </div>
                        <h2 className="font-extrabold text-[#333333] dark:text-[var(--text-primary)] text-xl mb-2">{category.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-white/90">{category.description}</p>
                    </button>
                ))}
            </section>

            {/* ===================== FAQ ACCORDIONS ===================== */}
            <section className="max-w-6xl mx-auto space-y-12">
                {faqData.map((category, catIdx) => (
                    <div
                        key={category.id}
                        ref={el => { sectionRefs.current[category.id] = el }}
                        className="faq-group rounded-3xl border-2 border-gray-100 bg-white dark:bg-[#111A15] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className={`px-6 md:px-10 py-8 border-b border-gray-100 bg-gradient-to-r ${getInnerColor(category.color)}`}>
                            <h3 className="text-xl md:text-3xl font-extrabold text-[#333333] dark:text-white flex items-center gap-4">
                                <span className="text-[#333333] dark:text-white"> {getCategoryIcon(category.id)} </span>
                                {category.title}
                            </h3>
                        </div>

                        <div className="p-4 md:p-8 space-y-2">
                            {category.items.map((item, itemIdx) => {
                                const isOpen = openItems.includes(`${catIdx}-${itemIdx}`);
                                return (
                                    <div key={item.question} className="border-b border-gray-50 last:border-0">
                                        <button
                                            onClick={() => toggleItem(catIdx, itemIdx)}
                                            className="w-full cursor-pointer list-none flex items-start gap-5 px-4 md:px-6 py-6 text-left group"
                                        >
                                            <span className={`mt-1 font-bold text-xl transition-transform duration-300 ${isOpen ? `rotate-90 ${getActiveColor(category.color)}` : 'text-gray-300'}`}>
                                                ▸
                                            </span>
                                            <span className={`font-bold flex-1 text-lg transition-colors duration-300 ${isOpen ? getActiveColor(category.color) : 'text-gray-700 dark:text-white'}`}>
                                                {item.question}
                                            </span>
                                            <span className={`transition-all duration-300 ${isOpen ? 'rotate-45 text-red-500' : 'text-gray-400 dark:text-white'}`}>
                                                <Plus className="w-6 h-6" />
                                            </span>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                                            <div className="px-14 pb-4 text-gray-600 dark:text-white/90 text-[17px] leading-relaxed">
                                                {item.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            {/* ===================== BENEFITS SECTION ===================== */}
            <section className="space-y-16">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-[#333333] dark:text-white uppercase tracking-tighter">¿Por qué elegir Lyrium?</h2>
                    <div className="w-24 h-1.5 bg-brand-gradient mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {benefitsData.slice(0, 4).map((benefit, index) => (
                        <div key={benefit.title} className="benefit-card group shine-effect rounded-[40px] border-2 border-gray-100 bg-white dark:bg-[var(--bg-secondary)] shadow-xl hover:shadow-2xl p-10 text-center transition-all duration-500 hover:-translate-y-4">
                            <div className="mx-auto w-16 h-16 mb-8 overflow-hidden relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-28 h-28">
                                    <Image
                                        src={`/img/Inicio/11/${index + 2}.png`}
                                        alt={benefit.title}
                                        fill
                                        className="object-contain object-top"
                                        sizes="112px"
                                    />
                                </div>
                            </div>
                            <h4 className="font-black tracking-tight text-[#333333] dark:text-white text-lg mb-3 text-[20px]">{benefit.title}</h4>
                            <p className="text-gray-500 dark:text-white/90 font-sm text-[14px]">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {benefitsData.slice(4).map((benefit, index) => (
                        <div key={benefit.title} className="benefit-card group shine-effect rounded-[40px] border-2 border-gray-100 bg-white dark:bg-[var(--bg-secondary)] shadow-xl hover:shadow-2xl p-10 text-center transition-all duration-500 hover:-translate-y-4">
                            <div className="mx-auto w-16 h-16 mb-8 overflow-hidden relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-28 h-28">
                                    <Image
                                        src={`/img/Inicio/11/${index + 6}.png`}
                                        alt={benefit.title}
                                        fill
                                        className="object-contain object-top"
                                        sizes="112px"
                                    />
                                </div>
                            </div>
                            <h4 className="font-black tracking-tight text-[#333333] dark:text-white text-lg mb-3 text-[20px]">{benefit.title}</h4>
                            <p className="text-gray-500 dark:text-white/90 font-sm text-[14px] leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===================== CONTACT CTA ===================== */}
            <section className="bg-sky-500 dark:bg-[#1A3A32] rounded-[3rem] p-12  max-w-4xl mx-auto text-center text-white space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-sky-600/20 dark:from-[#1A3A32] dark:to-[var(--brand-green)]  to-transparent pointer-events-none"></div>
                <HelpCircle className="w-20 h-20 mx-auto text-white/20 absolute -top-4 -right-4 rotate-12 group-hover:scale-125 transition-transform duration-700" />

                <h2 className="text-4xl font-black uppercase tracking-tighter relative z-10">¿Aún tienes dudas?</h2>
                <p className="text-sky-100 text-xl max-w-2xl mx-auto relative z-10">
                    Nuestro equipo de soporte está listo para ayudarte en lo que necesites.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10 pt-4">
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('lyrium:open-chatbot'))}
                        className="inline-flex items-center gap-3 bg-white text-sky-600 dark:text-[var(--brand-green)] px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-sky-50 transition-colors shadow-lg cursor-pointer"
                    >
                        <MessageCircle className="w-6 h-6" />
                        Chat en Línea
                    </button>
                    <Link
                        href="mailto:ventas@lyriumbiomarketplace.com"
                        className="inline-flex items-center gap-3 bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-sky-700 transition-colors shadow-lg"
                    >
                        <Mail className="w-6 h-6" />
                        Correo Electrónico
                    </Link>
                </div>
            </section>
        </main>
    );
}
