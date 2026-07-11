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
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isMounted, setIsMounted] = useState(false);

  
  useEffect(() => {
    setIsMounted(true);
    const update = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else setItemsPerView(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  
  const allItems = [...products, ...products];

  return (
    <div className="mb-16">
      
      <h2 className="text-[1.15rem] sm:text-[1.8rem] font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 pl-2 sm:pl-4 tracking-tight whitespace-nowrap">
        {title}
      </h2>

      
      <div className="flex flex-row gap-4 xl:gap-8 items-center xl:items-stretch">
        
       
        <div className="w-[60%] sm:w-[40%] min-h-[180px] sm:min-h-[240px] xl:min-h-0 aspect-square sm:aspect-[696/556] xl:aspect-auto xl:w-[696px] xl:h-[556px] flex-shrink-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-300 relative rounded-[15px] sm:rounded-[30px] border border-slate-200 dark:border-[var(--border-subtle)]/50">
          <Image
            src={bannerImage}
            alt={title}
            fill
            className="object-cover object-center w-full h-full block"
            draggable={false}
            priority
          />
        </div>

       
        <div className="w-[40%] sm:w-[60%] xl:w-auto xl:flex-grow flex flex-col justify-between overflow-hidden relative">
          
          <div className="overflow-hidden w-full py-2">
            <div
              className="flex -mx-2 transition-transform duration-[1000ms] [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]"
              style={
                isMounted
                  ? { transform: `translateX(-${currentPage * (100 / itemsPerView)}%)` }
                  : {}
              }
            >
              {allItems.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-shrink-0 w-full sm:w-1/3 snap-start px-2"
                >
                  <div
                    className="group bg-[var(--turquesaClaro-100)] dark:bg-[#1E3028] rounded-[14px] overflow-hidden text-center shadow-[0_8px_25px_rgba(0,0,0,0.15)] border border-[var(--turquesa-100)] dark:border-transparent transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] flex flex-col justify-between h-full w-full max-w-[100px] sm:max-w-none mx-auto min-h-[155px] sm:min-h-[210px] xl:min-h-[360px] cursor-default"
                  >
                   
                    <div className="relative overflow-hidden w-full aspect-square sm:aspect-none sm:h-[110px] xl:h-[220px] flex items-center justify-center bg-white dark:bg-[var(--bg-muted)] group-hover:scale-[1.05] transition-transform duration-300">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-contain xl:object-cover"
                        draggable={false}
                        sizes="220px"
                      />
                    </div>

                    
                    <div className="p-1 sm:p-3 xl:p-4 mt-auto">
                      <h3 className="text-[9px] sm:text-[12px] xl:text-[14px] font-bold text-slate-900 dark:text-white mb-0.5 hover:text-sky-600 dark:hover:text-sky-100 transition-colors line-clamp-2 px-1">
                        {product.title}
                      </h3>
                      <p className="text-[10px] sm:text-[13px] xl:text-[16px] font-black text-black dark:text-white">
                        S/ {product.price.toFixed(2)}
                      </p>
                      
                      
                      <div className="flex justify-center gap-0.5 mt-1">
                        {Array.from({ length: product.rating }).map((_, i) => (
                          <Star key={i} className="w-2 h-2 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

           
          <div className="flex justify-center items-center gap-2 mt-3 sm:mt-6">
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