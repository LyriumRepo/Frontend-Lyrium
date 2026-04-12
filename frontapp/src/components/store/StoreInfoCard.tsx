'use client';

import { Phone, Mail, MapPin, Clock, Store, Truck, MessageCircle } from 'lucide-react';
import { Tienda } from '@/types/public';

interface Horario {
  apertura?: string;
  cierre?: string;
  cerrado?: boolean;
}

interface StoreInfoCardProps {
  tienda: Tienda;
  horarios?: Record<string, Horario>;
}

const empresasEnvio = [
  { nombre: 'Shalom', class: 'from-orange-500 to-orange-600' },
  { nombre: 'Olva', class: 'from-red-500 to-red-600' },
  { nombre: 'Cruz del Sur', class: 'from-blue-500 to-blue-600' },
];

function getDiaActual(): string {
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return dias[new Date().getDay()];
}

function getNombreDia(dia: string): string {
  const nombres: Record<string, string> = {
    domingo: 'Domingo', lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
    jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado'
  };
  return nombres[dia] || dia;
}

export default function StoreInfoCard({ tienda, horarios }: StoreInfoCardProps) {
  const diaActual = getDiaActual();
  const horarioHoy = horarios?.[diaActual];
  const estaAbierto = !horarioHoy?.cerrado;

  return (
    <>
      <style jsx global>{`
        @keyframes truck-drive {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }
        @keyframes truck-shake {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-1px) rotate(-1deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-1px) rotate(1deg); }
        }
        .icon-truck-animated {
          animation: truck-drive 0.8s ease-in-out infinite, truck-shake 0.4s ease-in-out infinite;
        }
        
        @keyframes phone-vibrate {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-8deg); }
          20% { transform: rotate(8deg); }
          30% { transform: rotate(-8deg); }
          40% { transform: rotate(8deg); }
          50% { transform: rotate(0deg); }
        }
        .icon-phone-animated {
          animation: phone-vibrate 2s ease-in-out infinite;
        }
        
        @keyframes clock-tick {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .icon-clock-animated {
          animation: clock-tick 8s linear infinite;
        }
        
        .service-card:hover .icon-truck-animated {
          animation-duration: 0.3s, 0.2s;
        }
        .service-card:hover .icon-phone-animated {
          animation-duration: 0.5s;
        }
        .service-card:hover .icon-clock-animated {
          animation-duration: 2s;
        }
      `}</style>
      
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] mt-4 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:divide-x divide-gray-100 dark:divide-[var(--border-subtle)]">
          
          {/* Card 1: Entregas */}
          <div className="service-card flex items-center gap-3 px-5 py-4 flex-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center overflow-hidden">
              <Truck className="w-5 h-5 text-sky-600 dark:text-sky-400 icon-truck-animated" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Entregas nacionales</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Shalom · Olva · Cruz del Sur</p>
            </div>
          </div>
          
          {/* Separador móvil */}
          <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)] md:hidden" />
          
          {/* Card 2: Contacto */}
          <div className="service-card flex items-center gap-3 px-5 py-4 flex-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-sky-600 dark:text-sky-400 icon-phone-animated" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Atención 24/7</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Chat o llamada</p>
            </div>
          </div>
          
          {/* Separador móvil */}
          <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)] md:hidden" />
          
          {/* Card 3: Horarios */}
          <div className="service-card flex items-center gap-3 px-5 py-4 flex-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 icon-clock-animated" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 dark:text-white text-sm">Horarios</p>
                {estaAbierto ? (
                  <span className="inline-flex items-center px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-[10px] font-semibold rounded-full">
                    Abierto
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-semibold rounded-full">
                    Cerrado
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {horarioHoy && !horarioHoy.cerrado
                  ? `${horarioHoy.apertura} - ${horarioHoy.cierre}`
                  : 'Cerrado hoy'
                }
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
