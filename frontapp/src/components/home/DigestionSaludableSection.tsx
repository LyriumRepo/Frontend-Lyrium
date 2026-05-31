'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface SectionProduct {
  id: number;
  title: string;
  price: number;
  image: string;
  rating: number;
}

interface MarketplaceSectionProps {
  title: string;
  bannerImage: string;
  products: SectionProduct[];
}

 
function MarketplaceSection({ title, bannerImage, products }: MarketplaceSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  
  const allItems = [...products, ...products];

  return (
    <div className="mb-16">
      
      <h2 className="text-[1.8rem] font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
        {title}
      </h2>

      
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        
       
        <div className="w-full aspect-[696/556] lg:w-[696px] lg:h-[556px] flex-shrink-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-shadow duration-300 relative">
          <Image
            src={bannerImage}
            alt={title}
            fill
            className="object-cover object-center w-full h-full block"
            draggable={false}
            priority
          />
        </div>

       
        <div className="w-full lg:flex-grow flex flex-col justify-between overflow-hidden relative">
          
         
          <div className="overflow-hidden w-full py-2">
            <div
              className="flex -mx-2"
              style={{
                transition: 'transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)',
                transform: `translateX(-${currentPage * (100 / 3)}%)`,
              }}
            >
              {allItems.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="w-1/3 flex-shrink-0 px-2"
                >
                  <div
                    className="group bg-white dark:bg-[var(--bg-secondary)]/92 rounded-[14px] p-5 text-center shadow-[0_8px_25px_rgba(15,23,42,0.05)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-[var(--border-subtle)]/50 transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_15px_35px_rgba(15,23,42,0.1)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full min-h-[360px] cursor-default"
                  >
                   
                    <div className="relative overflow-hidden w-full h-[220px] mb-4 flex items-center justify-center group-hover:scale-[1.05] transition-transform duration-300">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-contain"
                        draggable={false}
                        sizes="220px"
                      />
                    </div>

                    
                    <div className="mt-auto">
                      <h3 className="text-[14px] font-bold text-sky-500 dark:text-sky-400 mb-1 hover:text-sky-600 transition-colors line-clamp-2 px-1">
                        {product.title}
                      </h3>
                      <p className="text-[16px] font-black text-slate-800 dark:text-[var(--text-primary)]">
                        S/ {product.price.toFixed(2)}
                      </p>
                      
                      
                      <div className="flex justify-center gap-0.5 mt-2">
                        {Array.from({ length: product.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-none" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

           
          <div className="flex justify-center items-center gap-2 mt-6">
            {[0, 1, 2].map((pageIndex) => (
              <button
                key={pageIndex}
                onClick={() => setCurrentPage(pageIndex)}
                className={`h-[6px] rounded-full border-none cursor-pointer transition-all duration-300 ${
                  pageIndex === currentPage
                    ? 'w-10 bg-[#4a3aff] shadow-sm'  
                    : 'w-[18px] bg-slate-200 dark:bg-slate-800'  
                }`}
                aria-label={`Ir a página ${pageIndex + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

 
export default function DigestionSaludableSection() {
  
  // 1. DATA SECCIÓN: Digestión Saludable
  const digestionProducts = [
    { id: 1, title: 'BEBIDA INSTANTÁ...', price: 130.00, image: '/img/precios_digestion_saludable/2.png', rating: 5 },
    { id: 2, title: 'Colágeno Marino', price: 100.00, image: '/img/precios_digestion_saludable/3.png', rating: 5 },
    { id: 3, title: 'Melatonina de libe...', price: 25.00, image: '/img/precios_digestion_saludable/4.png', rating: 5 },
    
  ];

  // 2. DATA SECCIÓN: Belleza  
  const bellezaProducts = [
    { id: 1, title: 'Espuma Limpiadora', price: 55.00, image: '/img/inicio/9/2.png', rating: 5 },
    { id: 2, title: 'Espuma Limpiadora', price: 55.00, image: '/img/inicio/9/2.png', rating: 5 },
    { id: 3, title: 'Espuma Limpiadora', price: 55.00, image: '/img/inicio/9/2.png', rating: 5 },
    
  ];

  // 3. DATA SECCIÓN: Servicios Médicos
  const medicosProducts = [
    { id: 1, title: 'Blanqueamiento D...', price: 120.00, image: '/img/inicio/10/2.png', rating: 5 },
    { id: 2, title: 'Masajes Corporales', price: 30.00, image: '/img/inicio/10/3.png', rating: 5 },
    { id: 3, title: 'Diagnostico unipol...', price: 120.00, image: '/img/inicio/10/4.png', rating: 5 },
    
    
  ];

  // 4. DATA SECCIÓN: Servicios en Medicina Natural
  const naturalProducts = [
    { id: 1, title: 'Masaje Corporal', price: 150.00, image: '/img/servicios_medicina/1.png', rating: 5 },
    { id: 2, title: 'Pedicura', price: 80.00, image: '/img/servicios_medicina/2.png', rating: 5 },
    { id: 3, title: 'Exfoliacion Corpor...', price: 40.00, image: '/img/servicios_medicina/3.png', rating: 5 },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 overflow-hidden space-y-16">
      
      {/* 1. SECCIÓN: Digestión Saludable */}
      <MarketplaceSection
        title="Digestión saludable"
        bannerImage="/img/banner_productos_servicios/1.png"
        products={digestionProducts}
      />

      {/* 2. SECCIÓN: Belleza */}
      <MarketplaceSection
        title="Belleza"
        bannerImage="/img/inicio/9/1.png"
        products={bellezaProducts}
      />

      {/* 3. SECCIÓN: Servicios Médicos */}
      <MarketplaceSection
        title="Servicios médicos"
        bannerImage="/img/inicio/10/1.png"
        products={medicosProducts}
      />

      {/* 4. SECCIÓN: Servicios en Medicina Natural */}
      <MarketplaceSection
        title="Servicios en medicina natural"
        bannerImage="/img/banner_productos_servicios/4.png"
        products={naturalProducts}
      />

    </section>
  );
}