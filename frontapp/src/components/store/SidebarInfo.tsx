'use client';

import { Truck, MessageCircle, Clock, CheckCircle } from 'lucide-react';

interface SidebarInfoProps {
  tienda?: {
    horarios?: {
      lunes?: { apertura: string; cierre: string; cerrado: boolean };
      martes?: { apertura: string; cierre: string; cerrado: boolean };
      miercoles?: { apertura: string; cierre: string; cerrado: boolean };
      jueves?: { apertura: string; cierre: string; cerrado: boolean };
      viernes?: { apertura: string; cierre: string; cerrado: boolean };
      sabado?: { apertura: string; cierre: string; cerrado: boolean };
      domingo?: { apertura: string; cierre: string; cerrado: boolean };
    };
    redes?: {
      whatsapp?: string;
    };
  };
}

export default function SidebarInfo({ tienda }: SidebarInfoProps) {
  const isOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    const schedule = tienda?.horarios;
    if (!schedule) return true;

    let daySchedule;
    switch(day) {
      case 0: daySchedule = schedule.domingo; break;
      case 1: daySchedule = schedule.lunes; break;
      case 2: daySchedule = schedule.martes; break;
      case 3: daySchedule = schedule.miercoles; break;
      case 4: daySchedule = schedule.jueves; break;
      case 5: daySchedule = schedule.viernes; break;
      case 6: daySchedule = schedule.sabado; break;
    }

    if (!daySchedule || daySchedule.cerrado) return false;
    
    const [openHour, openMin] = daySchedule.apertura.split(':').map(Number);
    const [closeHour, closeMin] = daySchedule.cierre.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-4 shadow-md">
      {/* Entregas */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)]">Entregas nacionales</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Shalom', 'Olva', 'Cruz del Sur'].map((courier) => (
            <span key={courier} className="px-2 py-1 text-[10px] font-medium text-gray-500 dark:text-[var(--text-secondary)] bg-gray-100 dark:bg-[var(--bg-muted)] rounded-md">
              {courier}
            </span>
          ))}
        </div>
      </div>

      {/* Atención */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)]">Atención 24/7</span>
        </div>
        <span className="text-[10px] text-gray-500 dark:text-[var(--text-secondary)]">Chat o llamada</span>
      </div>

      {/* Horarios */}
      <div className="pt-3 border-t border-gray-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)]">Horarios</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOpen() ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-gray-600 dark:text-[var(--text-secondary)]">{isOpen() ? 'Abierto' : 'Cerrado'}</span>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] block mt-1">{isOpen() ? 'Abierto hoy' : 'Cerrado hoy'}</span>
      </div>
    </div>
  );
}
