'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Search,
  Star,
  ChevronRight,
  X,
  MapPin,
  Wifi,
  Home,
  CheckCircle,
  ChevronLeft,
  User,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type {
  Service,
  ServiceCategory,
  ServiceSpecialist,
  ServiceSchedule,
} from '@/shared/lib/api/serviRepository';
import {
  DAY_NAMES,
  DAY_ORDER,
  formatDuration,
} from '@/shared/lib/api/serviRepository';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  category: ServiceCategory;
  services: Service[];
  allCategories: ServiceCategory[];
}

// ─── Helpers visuales ─────────────────────────────────────────────────────────

function getCancellationLabel(policy: string) {
  if (policy === 'flexible')
    return {
      label: 'Cancelación flexible',
      color:
        'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    };
  if (policy === 'strict')
    return {
      label: 'Cancelación estricta',
      color:
        'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    };
  return {
    label: 'Sin reembolso',
    color: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400',
  };
}

function getLeafCategory(category: string): string {
  if (!category) return '';
  const parts = category.split(' > ');
  return parts[parts.length - 1]?.trim() ?? category;
}

function getStickerBadge(sticker?: string | null, discountPercentage?: number | null): { label: string; className: string } | null {
  if (!sticker) return null;
  const map: Record<string, { label: string; className: string }> = {
    nuevo: { label: 'NUEVO', className: 'bg-emerald-500 text-white' },
    oferta: { label: 'OFERTA', className: 'bg-orange-500 text-white' },
    liquidacion: { label: 'LIQUIDACIÓN', className: 'bg-red-600 text-white' },
    bestseller: { label: 'MÁS VENDIDO', className: 'bg-amber-500 text-white' },
    envio_gratis: { label: 'ENVÍO GRATIS', className: 'bg-blue-500 text-white' },
  };
  if (sticker === 'descuento') {
    const pct = discountPercentage ?? 0;
    return { label: `-${pct}%`, className: 'bg-red-500 text-white' };
  }
  return map[sticker] ?? null;
}

function getExtraBadges(service: Service): Array<{ label: string; className: string }> {
  const etiquetas = (service as any).settings?.etiquetas;
  if (!etiquetas) return [];
  const badges: Array<{ label: string; className: string }> = [];
  if (etiquetas.nuevo && service.sticker !== 'nuevo') {
    badges.push({ label: 'NUEVO', className: 'bg-emerald-500 text-white' });
  }
  return badges;
}

function AvailabilityDot({ status }: { status: string }) {
  const color = status === 'Disponible' ? 'bg-emerald-400' : 'bg-amber-400';
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color} shrink-0`} />
  );
}

// ─── Horarios agrupados por día ───────────────────────────────────────────────

function SpecialistSchedule({ schedules }: { schedules: ServiceSchedule[] }) {
  // Agrupar por día_de_semana
  const byDay = DAY_ORDER.reduce<Record<string, ServiceSchedule[]>>(
    (acc, day) => {
      const blocks = schedules.filter(
        (s) => s.day_of_week === day && s.is_active,
      );
      if (blocks.length > 0)
        acc[day] = blocks.sort((a, b) => a.orden_bloque - b.orden_bloque);
      return acc;
    },
    {},
  );

  const days = Object.keys(byDay);
  if (days.length === 0)
    return (
      <p className="text-xs text-gray-400 italic">Sin horarios configurados</p>
    );

  return (
    <div className="space-y-1.5">
      {days.map((day) => (
        <div key={day} className="flex items-start gap-2 text-xs">
          <span className="w-20 shrink-0 font-semibold text-gray-700 dark:text-[var(--text-primary)]">
            {DAY_NAMES[day as keyof typeof DAY_NAMES]}
          </span>
          <div className="flex flex-col gap-0.5">
            {byDay[day].map((block) => (
              <span key={block.id} className="text-gray-500 dark:text-[var(--text-muted)]">
                {block.start_time} – {block.end_time}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tarjeta de Especialista dentro del modal ─────────────────────────────────

function SpecialistCard({
  specialist,
  serviceId,
  onSelect,
}: {
  specialist: ServiceSpecialist;
  serviceId: number;
  onSelect: (s: ServiceSpecialist) => void;
}) {
  return (
    <div className="border border-gray-100 dark:border-[var(--border-subtle)] rounded-xl p-4 hover:border-sky-200 dark:hover:border-[var(--brand-sky)] hover:shadow-sm transition-all group">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-[var(--brand-sky)]/20 dark:to-[var(--brand-sky)]/20 flex items-center justify-center overflow-hidden border border-sky-200 dark:border-sky-800">
          {specialist.foto ? (
            <Image
              src={specialist.foto}
              alt={specialist.nombre_completo}
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          ) : (
            <User className="w-5 h-5 text-sky-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <AvailabilityDot status={specialist.availability} />
            <span className="font-bold text-sm text-gray-900 dark:text-[var(--text-primary)] truncate">
              {specialist.nombre_completo}
            </span>
          </div>
          <p className="text-xs text-sky-600 dark:text-[var(--brand-sky)] font-medium">
            {specialist.especialidad}
          </p>
          {specialist.sub_especialidad && (
            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] truncate">
              {specialist.sub_especialidad}
            </p>
          )}
          {specialist.anios_experiencia != null && (
            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-0.5">
              {specialist.anios_experiencia} años de experiencia
            </p>
          )}
        </div>
      </div>

      {/* Horarios */}
      {specialist.schedules && specialist.schedules.length > 0 && (
        <div className="mb-3 pl-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
            Horarios disponibles
          </p>
          <SpecialistSchedule schedules={specialist.schedules} />
        </div>
      )}

      {/* Botón agendar */}
      {specialist.availability === 'Disponible' ? (
        <button
          onClick={() => onSelect(specialist)}
          className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          Agendar con este especialista
        </button>
      ) : (
        <div className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-400 text-xs font-semibold text-center">
          No disponible actualmente
        </div>
      )}
    </div>
  );
}

// ─── Modal de detalle del servicio ───────────────────────────────────────────

function ServiceDetailModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'info' | 'specialists'>('info');
  const cancelInfo = getCancellationLabel(service.cancellation_policy);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-[var(--bg-card)] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto z-10">
        {/* Header del modal */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[var(--bg-card)] border-b border-gray-100 dark:border-[var(--border-default)] px-5 py-4 flex items-center gap-3">
          {step === 'specialists' && (
            <button
              onClick={() => setStep('info')}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-base truncate">
              {step === 'info' ? service.name : 'Elige un especialista'}
            </h2>
            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
              {service.store_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {step === 'info' && (
            <>
              {/* Imagen */}
              {service.image && (
                <div className="relative w-full h-44 rounded-xl overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  {(() => {
                    const primary = getStickerBadge(service.sticker, service.discount_percentage);
                    const extras = getExtraBadges(service);
                    if (!primary && extras.length === 0) return null;
                    return (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {primary && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg ${primary.className}`}>
                            {primary.label}
                          </span>
                        )}
                        {extras.map((e, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg ${e.className}`}>
                            {e.label}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Precio + duración */}
              <div className="flex items-center justify-between">
                <div>
                  {service.discount_percentage && service.discount_percentage > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-[var(--text-primary)]">
                        S/ {(service.price * (1 - service.discount_percentage / 100)).toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">S/ {Number(service.price).toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-black text-gray-900 dark:text-[var(--text-primary)]">
                      S/ {Number(service.price).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-[var(--brand-sky)]/20 text-sky-600 dark:text-[var(--brand-sky)]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">
                    {formatDuration(service.duration_minutes)}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              {service.description && (
                <p className="text-sm text-gray-600 dark:text-[var(--text-primary)] leading-relaxed">
                  {service.description}
                </p>
              )}

              {/* Beneficios / Incluye */}
              {service.benefits && (() => {
                const items: string[] = (() => {
                  if (typeof service.benefits === 'string') {
                    try { return JSON.parse(service.benefits); } catch { /* not JSON */ }
                    const trimmed = service.benefits.trim();
                    if (trimmed.includes('\n')) return trimmed.split('\n').map((b) => b.trim()).filter(Boolean);
                    return [trimmed];
                  }
                  if (Array.isArray(service.benefits)) return service.benefits;
                  return [];
                })();
                if (items.length === 0) return null;
                return (
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      Este servicio incluye
                    </p>
                    <div className="space-y-1.5">
                      {items.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-[var(--text-primary)]">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Badges de características */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cancelInfo.color}`}
                >
                  <CheckCircle className="w-3 h-3" />
                  {cancelInfo.label}
                </span>
                {service.is_home_service && (
                  <span className="flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-semibold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400">
                    <Home className="w-3 h-3" />A domicilio
                  </span>
                )}
                {service.is_virtual && (
                  <span className="flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400">
                    <Wifi className="w-3 h-3" />
                    Virtual
                  </span>
                )}
              </div>

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-[var(--bg-muted)]/60 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mb-0.5">
                    Reservar con anticipación
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
                    {service.booking_advance_hours}h antes
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[var(--bg-muted)]/60 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mb-0.5">
                    Cupo por sesión
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
                    {service.max_capacity} persona
                    {service.max_capacity !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Especialistas preview */}
              {service.specialists.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-2">
                    {service.specialists.length} especialista
                    {service.specialists.length !== 1 ? 's' : ''} disponible
                    {service.specialists.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {service.specialists.slice(0, 3).map((sp) => (
                      <div key={sp.id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-[var(--brand-sky)]/20 dark:to-[var(--brand-sky)]/20 flex items-center justify-center shrink-0">
                          {sp.foto ? (
                            <Image
                              src={sp.foto}
                              alt={sp.nombre_completo}
                              width={28}
                              height={28}
                              className="object-cover w-full h-full rounded-full"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-sky-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)] truncate">
                            {sp.nombre_completo}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] truncate">
                            {sp.especialidad}
                          </p>
                        </div>
                        <AvailabilityDot status={sp.availability} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => setStep('specialists')}
                className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Ver especialistas y agendar
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'specialists' && (
            <>
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
                Selecciona un especialista para ver su disponibilidad y agendar
                tu cita.
              </p>

              {service.specialists.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay especialistas disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {service.specialists.map((sp) => (
                    <SpecialistCard
                      key={sp.id}
                      specialist={sp}
                      serviceId={service.id}
                      onSelect={(selected) => {
                        // TODO: navegar al flujo de reserva con specialist seleccionado
                        // Por ahora redirige a la tienda
                        window.location.href = `/tienda/${service.store_id}?service=${service.id}&specialist=${selected.id}`;
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de servicio (grid) ───────────────────────────────────────────────

function ServiceCard({
  service,
  onOpen,
}: {
  service: Service;
  onOpen: (s: Service) => void;
}) {
  const availableSpecialists = service.specialists.filter(
    (s) => s.availability === 'Disponible',
  );

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-default)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group flex flex-col">
      {/* Imagen o placeholder */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-sky-50 to-blue-50 dark:from-[var(--brand-sky)]/10 dark:to-[var(--brand-sky)]/10 overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-sky-200 dark:text-sky-900" />
          </div>
        )}
        {/* Sticker badge */}
        {(() => {
          const primary = getStickerBadge(service.sticker, service.discount_percentage);
          const extras = getExtraBadges(service);
          if (!primary && extras.length === 0) return null;
          return (
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {primary && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg ${primary.className}`}>
                  {primary.label}
                </span>
              )}
              {extras.map((e, i) => (
                <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-lg ${e.className}`}>
                  {e.label}
                </span>
              ))}
            </div>
          );
        })()}
        {/* Badge virtual / domicilio */}
        {(service.is_virtual || service.is_home_service) && (
          <div className="absolute top-2 right-2 flex gap-1">
            {service.is_virtual && (
              <span className="px-1.5 py-1 rounded-md bg-sky-500/90 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Virtual
              </span>
            )}
            {service.is_home_service && (
              <span className="px-1.5 py-1 rounded-md bg-emerald-500/90 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                <Home className="w-3 h-3" /> Domicilio
              </span>
            )}
          </div>
        )}
        {/* Precio flotante */}
        <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-[var(--bg-card)]/95 backdrop-blur-sm shadow-sm">
          {service.discount_percentage && service.discount_percentage > 0 ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 line-through">S/ {Number(service.price).toFixed(2)}</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                S/ {(service.price * (1 - service.discount_percentage / 100)).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              S/ {Number(service.price).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Nombre */}
        <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm leading-tight mb-1 group-hover:text-sky-500 transition-colors line-clamp-2">
          {service.name}
        </h3>

        {/* Descripción */}
        {service.description && (
          <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-[var(--text-muted)] mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(service.duration_minutes)}
          </span>
          {service.store_name && (
            <span className="flex items-center gap-1 truncate">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{service.store_name}</span>
            </span>
          )}
        </div>

        {/* Especialistas */}
        {availableSpecialists.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {/* Avatares apilados */}
            <div className="flex -space-x-2">
              {availableSpecialists.slice(0, 3).map((sp) => (
                <div
                  key={sp.id}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-[var(--bg-card)] bg-gradient-to-br from-sky-100 to-blue-100 dark:from-[var(--brand-sky)]/20 dark:to-[var(--brand-sky)]/20 flex items-center justify-center overflow-hidden"
                  title={sp.nombre_completo}
                >
                  {sp.foto ? (
                    <Image
                      src={sp.foto}
                      alt={sp.nombre_completo}
                      width={24}
                      height={24}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-3 h-3 text-sky-400" />
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
              {availableSpecialists.length} especialista
              {availableSpecialists.length !== 1 ? 's' : ''} disponible
              {availableSpecialists.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <Link
            href={`/servicio/${service.slug}`}
            className="w-full py-2.5 rounded-xl bg-sky-50 dark:bg-[var(--brand-sky)]/20 text-sky-600 dark:text-[var(--brand-sky)] text-xs font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Ver y agendar
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ServicesCategoryPageClient({
  category,
  services,
  allCategories,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.store_name?.toLowerCase().includes(q) ||
        s.specialists.some(
          (sp) =>
            sp.nombre_completo.toLowerCase().includes(q) ||
            sp.especialidad.toLowerCase().includes(q),
        ),
    );
  }, [services, search]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[var(--bg-card)] border-b border-gray-200 dark:border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-400 hover:text-sky-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </Link>
          <span className="text-gray-300 dark:text-[var(--text-secondary)]">/</span>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-sky-500 transition-colors"
          >
            Servicios
          </button>
          <span className="text-gray-300 dark:text-[var(--text-secondary)]">/</span>
          <span className="font-semibold text-gray-700 dark:text-[var(--text-primary)]">
            {category.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-500 dark:text-[var(--text-muted)] mt-1.5 text-sm leading-relaxed max-w-xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Tabs de categorías */}
        {allCategories.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6 pb-1 overflow-x-auto">
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={
cat.parent
                    ? `/servicios/${allCategories.find((p) => p.id === cat.parent)?.slug ?? cat.slug}/${cat.slug}`
                    : `/servicios/${cat.slug}`
                }
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  cat.slug === category.slug
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                    : 'bg-white dark:bg-[var(--bg-card)] text-gray-600 dark:text-[var(--text-muted)] border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-300 hover:text-sky-500'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Buscador */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por servicio o especialista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-sm text-gray-700 dark:text-[var(--text-primary)] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-[var(--border-focus)] transition-all"
          />
        </div>

        {/* Contador */}
        <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mb-4">
          {filtered.length} servicio{filtered.length !== 1 ? 's' : ''}{' '}
          encontrado{filtered.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onOpen={setSelectedService}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 dark:text-[var(--text-muted)]">
            <Calendar className="w-14 h-14 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-sm">
              {search
                ? 'No se encontraron servicios para esa búsqueda'
                : 'No hay servicios disponibles en esta categoría'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </main>
  );
}
