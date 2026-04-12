// ============================================
// LIB — Constantes de planes
// ============================================

import type { PlansMap, DurationPreset } from '@/features/seller/plans/types';

export const FIXED_ORDER = ['basic', 'standard', 'premium'];

export function buildPlanOrder(plans: PlansMap): string[] {
  const active = Object.keys(plans).filter(k => plans[k].isActive !== false);
  const fixed  = FIXED_ORDER.filter(k => active.includes(k));
  const rest   = active.filter(k => !FIXED_ORDER.includes(k));
  rest.sort((a, b) => (plans[a].orden ?? 99) - (plans[b].orden ?? 99));
  return [...fixed, ...rest];
}

export const defaultPlansData: PlansMap = {
  basic: {
    id: 'basic', name: 'EMPRENDE', price: 0, priceAnnual: 0,
    period: '/mes', periodAnnual: '/año', currency: 'S/',
    usePriceMode: true, priceText: '', priceSubtext: '',
    description: 'Plan gratuito para empezar tu tienda en LYRIUM Biomarketplace. Incluye todas las herramientas esenciales.',
    badge: 'PLAN EMPRENDE', color: 'basic', cssColor: '#9cb04e', accentColor: '#7d9940',
    bgImage: '', customCSS: '', requiresPayment: false,
    subscribeButtonText: 'Suscribirse',
    trialSuccessTitle: '¡Has activado el plan gratuito!',
    trialSuccessMessage: 'Tu plan EMPRENDE está activo. Comienza a vender en LYRIUM.',
    trialWaitMessage: 'Tu plan se activará automáticamente.',
    enableClaimLock: false, claimedButtonText: '', claimedWarningText: '',
    features: [
      { text: 'Exposición de productos al buscar en LYRIUM', active: true },
      { text: 'Espacio propio para personalizar tu tienda',  active: true },
      { text: 'Logotipo, información y banner publicitario', active: true },
      { text: 'Exposición de productos y servicios',         active: true },
      { text: 'Redes sociales en tu tienda',                 active: true },
    ],
    allDetails: [], detailedBenefits: [], timelineIcon: 'shield',
  },
  standard: {
    id: 'standard', name: 'CRECE', price: 7.99, priceAnnual: 95.88,
    period: '/mes', periodAnnual: '/año', currency: 'S/',
    usePriceMode: true, priceText: '', priceSubtext: '',
    description: 'Haz crecer tu tienda con herramientas avanzadas, capacitaciones y atención preferencial.',
    badge: 'MÁS POPULAR', color: 'standard', cssColor: '#64c695', accentColor: '#4da978',
    bgImage: '', customCSS: '', requiresPayment: true,
    subscribeButtonText: 'Suscribirse',
    trialSuccessTitle: '¡Solicitud enviada!',
    trialSuccessMessage: 'Tu solicitud para el plan CRECE ha sido enviada al administrador.',
    trialWaitMessage: 'Espere la aceptación del administrador para activar su plan.',
    enableClaimLock: false, claimedButtonText: '', claimedWarningText: '',
    features: [
      { text: 'Todo lo del plan Emprende',                          active: true },
      { text: 'Logo en banners principales de LYRIUM',              active: true },
      { text: 'Capacitaciones online en postventa',                 active: true },
      { text: 'Medalla de producto recomendado por LYRIUM',         active: true },
      { text: 'Atención preferencial por LYRIUM',                   active: true },
    ],
    allDetails: [], detailedBenefits: [], timelineIcon: 'layers',
  },
  premium: {
    id: 'premium', name: 'ESPECIAL', price: 89.90, priceAnnual: 863.00,
    period: '/mes', periodAnnual: '/año', currency: 'S/',
    usePriceMode: true, priceText: '', priceSubtext: '',
    description: 'La experiencia máxima en LYRIUM Biomarketplace. Todo incluido con soporte dedicado.',
    badge: 'PLAN ESPECIAL', color: 'premium', cssColor: '#499bbf', accentColor: '#357fa3',
    bgImage: '', customCSS: '', requiresPayment: false,
    subscribeButtonText: 'Reclamar prueba gratuita',
    trialSuccessTitle: '¡Ha reclamado con éxito el plan ESPECIAL!',
    trialSuccessMessage: 'Prueba gratuita de 6 meses basada en el plan Crece.',
    trialWaitMessage: 'Espere la aceptación del administrador para activar su plan. Esta prueba solo puede ser reclamada una única vez.',
    enableClaimLock: true,
    claimedButtonText: 'Este plan ya ha sido reclamado con anterioridad',
    claimedWarningText: '⚠ La prueba gratuita del plan Especial solo puede ser reclamada una única vez.',
    features: [
      { text: 'Todo lo del plan Crece',                             active: true },
      { text: 'Atención preferencial prioritaria',                  active: true },
      { text: 'Asesorías de seguimiento comercial avanzadas',       active: true },
      { text: 'Capacitaciones avanzadas del dashboard',             active: true },
      { text: 'Merchandising y material especial postventa',        active: true },
    ],
    allDetails: [], detailedBenefits: [], timelineIcon: 'star',
  },
};

export const durationPresets: DurationPreset[] = [
  { id: 'trial',  label: 'Prueba',       months: 1,  isTrial: true  },
  { id: '1m',     label: '1 mes',        months: 1,  isTrial: false },
  { id: '6m',     label: '6 meses',      months: 6,  isTrial: false },
  { id: '12m',    label: '12 meses',     months: 12, isTrial: false },
  { id: '24m',    label: '24 meses',     months: 24, isTrial: false },
  { id: '48m',    label: '48 meses',     months: 48, isTrial: false },
  { id: 'custom', label: 'Personalizar', months: 0,  isTrial: false },
];

export function getDiscountForMonths(totalMonths: number): number {
  if (totalMonths <= 1)  return 0;
  if (totalMonths <= 3)  return 5;
  if (totalMonths <= 6)  return 12;
  if (totalMonths <= 12) return 22;
  if (totalMonths <= 18) return 30;
  if (totalMonths <= 24) return 38;
  if (totalMonths <= 36) return 48;
  return Math.min(Math.floor(48 + (totalMonths - 36)), 60);
}

export const notificationMessages = [
  'Recuerda que puedes cambiar de plan cuando desees.',
  'Puedes mejorar tu plan en cualquier momento.',
  'Explora nuestros planes y descubre nuevas posibilidades.',
  'Actualiza tu plan y desbloquea más funciones.',
];

export const motivationalMessages = [
  'Recuerda que puedes cambiar de plan cuando desees y sin compromisos',
  'Tu crecimiento es nuestra prioridad. Mejora cuando estés listo',
  'Cada plan está diseñado pensando en ti y tus objetivos',
  'Sin contratos a largo plazo. Cambia o cancela cuando quieras',
  'La flexibilidad es clave. Ajusta tu plan según tus necesidades',
];
