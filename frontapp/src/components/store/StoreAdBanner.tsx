'use client';

import { Store, Rocket } from 'lucide-react';

interface StoreAdBannerProps {
  titulo?: string;
  subtitulo?: string;
  btnTexto?: string;
  btnUrl?: string;
}

export default function StoreAdBanner({
  titulo = '¿Tienes productos naturales? ¡Véndelos aquí!',
  subtitulo = 'Únete a +500 emprendedores que ya venden en Lyrium',
  btnTexto = 'Crear mi tienda',
  btnUrl = '/registro?tipo=vendedor'
}: StoreAdBannerProps) {
  return (
    <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-6 mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">{titulo}</h4>
            <p className="text-white/80 text-sm">{subtitulo}</p>
          </div>
        </div>
        <a 
          href={btnUrl}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[var(--bg-card)] text-sky-600 dark:text-[var(--brand-sky)] font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors shadow-lg"
        >
          <Rocket className="w-5 h-5" />
          <span>{btnTexto}</span>
        </a>
      </div>
    </div>
  );
}
