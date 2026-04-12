// ============================================
// LIB — Helpers utilitarios
// Equivalente a shared/helpers.js
// ============================================

import type { PlansMap } from '@/features/seller/plans/types';
import { availableIcons } from './icons';

export function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex || hex.charAt(0) !== '#') return `rgba(0,0,0,${alpha})`;
  let h = hex.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function lightenColor(hex: string, factor: number): string {
  if (!hex || hex.charAt(0) !== '#') return '#cccccc';
  let h = hex.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = Math.round(parseInt(h.substring(0, 2), 16) + (255 - parseInt(h.substring(0, 2), 16)) * factor);
  const g = Math.round(parseInt(h.substring(2, 4), 16) + (255 - parseInt(h.substring(2, 4), 16)) * factor);
  const b = Math.round(parseInt(h.substring(4, 6), 16) + (255 - parseInt(h.substring(4, 6), 16)) * factor);
  return `rgb(${r},${g},${b})`;
}

export function formatPrice(amount: number, currency: string = 'S/'): string {
  if (amount === 0) return `${currency} 0`;
  return `${currency} ${parseFloat(String(amount)).toFixed(2)}`;
}

export function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatAdminDate(str: string): string {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getPlanIconSvg(planKey: string, size: number = 24, plansData: PlansMap): string {
  const data    = plansData ? plansData[planKey] : null;
  const iconKey = (data && data.timelineIcon && availableIcons[data.timelineIcon]) ? data.timelineIcon : 'star';
  const s       = size;
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${availableIcons[iconKey]}</svg>`;
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export function getDaysLeft(expiryDate: string): number {
  return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}
