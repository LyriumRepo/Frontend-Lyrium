'use client';

import { Tag, MapPin, Crown, Medal, BadgeCheck, CalendarCheck } from 'lucide-react';
import { Tienda } from '@/types/public';

interface StoreDescriptionProps {
  tienda: Tienda;
  plan?: 'basico' | 'premium';
}

interface Badge {
  label: string;
  icon: React.ReactNode;
  premium?: boolean;
}

export default function StoreDescription({ tienda, plan = 'basico' }: StoreDescriptionProps) {
  const badges: Badge[] = plan === 'premium' 
    ? [
        { label: 'Premium', icon: <Crown className="w-3.5 h-3.5" />, premium: true },
        { label: 'Mejor Vendedor', icon: <Medal className="w-3.5 h-3.5" />, premium: true },
        { label: 'Verificado', icon: <BadgeCheck className="w-3.5 h-3.5" />, premium: true },
      ]
    : [];

  const defaultBadges: Badge[] = [
    { label: 'Tienda Verificada', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
    { label: 'Compra Segura', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
  ];

  const allBadges = [...badges, ...defaultBadges];

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-md mt-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        {/* Logo - solo visible en lg */}
        <div className="hidden lg:block">
          {tienda.logo && (
            <img 
              src={tienda.logo || '/img/no-image.png'} 
              alt={tienda.nombre}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-[var(--bg-card)] shadow-md"
            />
          )}
        </div>
        
        {/* Título y categoría */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-[var(--text-primary)]">
            {tienda.nombre}
          </h1>
          {tienda.categoria && (
            <span className="inline-flex items-center gap-1 text-sky-600 dark:text-[var(--brand-sky)] font-medium mt-1">
              <Tag className="w-4 h-4" />
              {tienda.categoria}
            </span>
          )}
        </div>

        {/* Estado de tienda */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            true // TODO: agregar campo 'abierto' a Tienda
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${true ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {true ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
      </div>
      
      {/* Descripción */}
      {tienda.descripcion && (
        <p className="text-gray-600 dark:text-[var(--text-secondary)] mb-4 max-w-2xl">
          {tienda.descripcion}
        </p>
      )}
      
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {allBadges.map((badge, idx) => (
          <span 
            key={idx}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              badge.premium
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-secondary)]'
            }`}
          >
            {badge.icon}
            {badge.label}
          </span>
        ))}
        
        {/* Rubros si existen */}
        {tienda.categoria && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">
            <MapPin className="w-3.5 h-3.5" />
            {tienda.categoria}
          </span>
        )}
      </div>
    </div>
  );
}
