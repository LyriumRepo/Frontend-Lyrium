// ============================================
// TYPES — Definiciones de tipos del proyecto
// ============================================

export type Plan = PlanData;

export interface PlanFeature {
  text: string;
  active: boolean;
}

export interface DetailedBenefit {
  emoji?: string;
  title: string;
  description: string;
  color?: string;
  icon?: string;
}

export interface PlanData {
  id: string;
  name: string;
  slug?: string;
  price: number;
  priceAnnual: number;
  period: string;
  periodAnnual: string;
  currency: string;
  usePriceMode: boolean;
  priceText: string;
  priceSubtext: string;
  description: string;
  badge: string;
  color?: string;
  cssColor?: string;
  accentColor?: string;
  bgImage?: string;
  bgImageFit?: 'cover' | 'contain';
  bgImagePosition?: string;
  showBgInCard?: boolean;
  customCSS?: string;
  requiresPayment?: boolean;
  subscribeButtonText?: string;
  trialSuccessTitle?: string;
  trialSuccessMessage?: string;
  trialWaitMessage?: string;
  enableClaimLock?: boolean;
  claimMonths?: number;
  claimedButtonText?: string;
  claimedWarningText?: string;
  features?: PlanFeature[];
  allDetails?: DetailedBenefit[];
  detailedBenefits?: DetailedBenefit[];
  timelineIcon?: string;
  compactVisibleCount?: number;
  isActive?: boolean;
  orden?: number;
}

export interface PlansMap {
  [key: string]: PlanData;
}

export interface SubscriptionInfo {
  plan: string;
  expiryDate: string;
  months: number;
  planId?: string;
  status?: string;
  startDate?: string;
}

export interface Request {
  id?: number;
  type: string;
  fromPlan: string;
  toPlan: string;
  planName: string;
  duration: string;
  durationId: string;
  months: number;
  amount: number;
  originalAmount?: number;
  discountPercent?: number;
  userName: string;
  status?: 'pending' | 'approved' | 'rejected';
  date?: string;
  usuario_id?: string;
  paymentMethod?: string;
}

export interface DurationPreset {
  id: string;
  label: string;
  months: number;
  isTrial: boolean;
}

export interface PaymentSummary {
  total: number;
  currency: string;
  originalTotal?: number;
  discount?: number;
  months: number;
  method?: string;
  planName?: string;
  duration?: string;
  originalPrice?: number;
  perMonth?: number;
}

export interface PlanRequest {
  type: 'upgrade' | 'downgrade' | 'free_claim';
  toPlan: string;
  durationId: string;
  months: number;
  amount: number;
}

export interface ExpirationWarning {
  porVencer: boolean;
  dias: number;
  fechaVencimiento: string;
}

export interface ButtonColors {
  subscribeBg?: string;
  subscribeColor?: string;
  currentBg?: string;
  currentColor?: string;
  lockedBg?: string;
  lockedColor?: string;
  warningColor?: string;
}

export interface SesionResponse {
  logged_in: boolean;
  rol?: 'Vendedor' | 'Admin';
  usuario_id?: string;
  username?: string;
}

export interface EstadoResponse {
  success: boolean;
  currentPlan?: string;
  claimedPlans?: string[];
  trialUsed?: string[];
  subscription?: SubscriptionInfo | null;
}

export interface AvisoVencimientoResponse {
  porVencer: boolean;
  diasRestantes?: number;
  nombrePlan?: string;
}

// Admin types
export interface Vendedor {
  usuario_id: string;
  username: string;
  email?: string;
  correo?: string;
  planActual?: string;
  plan_actual?: string;
  nombre_plan?: string;
  css_color?: string;
  fecha_expiracion?: string;
  fechaRegistro?: string;
  historial: HistorialItem[] | Record<string, unknown>[];
}

export interface HistorialItem {
  usuario_id: string;
  planNombre: string;
  fechaInicio: string;
  fechaFin?: string;
  monto?: number;
}

export interface AdminRequest {
  id: number;
  usuario_id: string;
  userName: string;
  fromPlan: string;
  toPlan: string;
  planName: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  amount: number;
  months: number;
  paymentMethod?: string;
  type: string;
  duration?: string;
}

export interface SSEEventMap {
  solicitud_actualizada: { pendientes: Request[] };
  pago_confirmado: { planId: string; meses: number; monto: number };
  pago_fallido: { motivo?: string };
  planes_actualizados: Record<string, never>;
  plan_vencido: { planActual: string };
  colores_actualizados: Record<string, never>;
  pagos_actualizados: Record<string, never>;
  solicitudes_actualizadas: Record<string, never>;
}