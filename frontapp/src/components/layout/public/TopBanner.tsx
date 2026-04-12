export default function TopBanner() {
    return (
        <>
            <style>{`
                @keyframes marquee-lyrium {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-lyrium {
                    animation: marquee-lyrium 28s linear infinite;
                }
                .animate-marquee-lyrium:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="w-full h-1 bg-[#c7d93b]" />

            <div
                className="w-full text-white overflow-hidden relative text-[12px] md:text-[14px] select-none"
                style={{ background: 'linear-gradient(90deg, #c7d93b 0%, #8cc63f 25%, #5bb9a0 55%, #4b8fbc 100%)' }}
            >
                <div className="max-w-7xl mx-auto px-4 flex items-center h-[52px] whitespace-nowrap">
                    <div className="inline-flex min-w-[200%] animate-marquee-lyrium">
                        <span className="px-16 font-semibold tracking-[0.06em] uppercase">
                            EL PRIMER BIOMARKETPLACE ONLINE DEL PERÚ: MÉDICO, ORGÁNICO Y NATURAL, CON EMPRESAS SELECCIONADAS PARA TU BIENESTAR TOTAL.
                        </span>
                        <span className="px-16 font-semibold tracking-[0.06em] uppercase">
                            EL PRIMER BIOMARKETPLACE ONLINE DEL PERÚ: MÉDICO, ORGÁNICO Y NATURAL, CON EMPRESAS SELECCIONADAS PARA TU BIENESTAR TOTAL.
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
