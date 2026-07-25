export type KpiLevel = 'regular' | 'good' | 'excellent';

export interface KpiBadge {
  level: KpiLevel;
  label: string;
  tip: string;
  scale: string | null;
}

interface ThresholdSet {
  good: number;
  excellent: number;
  invert?: boolean;
  unit?: string;
}

const THRESHOLDS: Record<string, ThresholdSet> = {
  roi:            { good: 400, excellent: 800, unit: '%' },
  ticketPromedio: { good: 35, excellent: 80, unit: 'S/' },
  leadTime:       { good: 48, excellent: 24, invert: true, unit: 'h' },
  defectos:       { good: 8, excellent: 3, invert: true, unit: '%' },
  ltv:            { good: 100, excellent: 350, unit: 'S/' },
  tiempoRespuesta:{ good: 60, excellent: 15, invert: true, unit: 'min' },
  cuotaMercado:   { good: 5, excellent: 15, unit: '%' },
  stockRotacion:  { good: 2, excellent: 6 },
  csat:           { good: 60, excellent: 80, unit: '%' },
};

function evaluateLevel(value: number, t: ThresholdSet): KpiLevel {
  if (t.invert) {
    if (value <= t.excellent) return 'excellent';
    if (value <= t.good) return 'good';
    return 'regular';
  }
  if (value >= t.excellent) return 'excellent';
  if (value >= t.good) return 'good';
  return 'regular';
}

const LABELS: Record<KpiLevel, string> = {
  excellent: 'Excelente',
  good: 'Buena',
  regular: 'A mejorar',
};

const TIPS: Record<string, Record<KpiLevel, string>> = {
  roi: {
    excellent: 'Retorno muy alto — cada sol de comisión genera más de S/8',
    good: 'Buen retorno — cada sol de comisión genera entre S/4 y S/8',
    regular: 'Retorno bajo — revisa márgenes y costos operativos',
  },
  ticketPromedio: {
    excellent: 'Ticket alto — tus clientes compran productos premium',
    good: 'Ticket saludable — buen valor por cada orden',
    regular: 'Ticket bajo — considera ofrecer bundles o productos complementarios',
  },
  leadTime: {
    excellent: 'Despacho rápido — entregas en menos de 24h',
    good: 'Tiempo aceptable — entre 24h y 48h',
    regular: 'Despacho lento — revisa tu proceso de preparación',
  },
  defectos: {
    excellent: 'Calidad sólida — menos del 3% de fallas',
    good: 'Tasa moderada — entre 3% y 8%',
    regular: 'Demasiados defectos — revisa calidad antes de despachar',
  },
  ltv: {
    excellent: 'Clientes muy fieles — alto valor de vida',
    good: 'Fidelización saludable — entre S/100 y S/350 por cliente',
    regular: 'Clientes poco fieles — trabaja en retención y repetición',
  },
  tiempoRespuesta: {
    excellent: 'Respuesta rápida — menos de 15 min',
    good: 'Tiempo aceptable — entre 15 y 60 min',
    regular: 'Respuesta lenta — tus clientes esperan demasiado',
  },
  cuotaMercado: {
    excellent: 'Líder dentro de la plataforma — más del 15%',
    good: 'Creciendo — entre 5% y 15%',
    regular: 'Participación baja — menos del 5%',
  },
  stockRotacion: {
    excellent: 'Inventario muy activo — buena rotación',
    good: 'Rotación saludable — entre 2 y 6',
    regular: 'Inventario estancado — revisa tu gestión de stock',
  },
  csat: {
    excellent: 'Clientes muy satisfechos — más del 80% positivo',
    good: 'Satisfacción buena — entre 60% y 80%',
    regular: 'Satisfacción baja — menos del 60% positivo',
  },
};

export function getKpiLevel(kpiName: string, value: number): KpiBadge | null {
  const t = THRESHOLDS[kpiName];
  if (!t) return null;
  const level = evaluateLevel(value, t);
  return {
    level,
    label: LABELS[level],
    tip: TIPS[kpiName]?.[level] || '',
    scale: getKpiThresholdScale(kpiName),
  };
}

export function getKpiThresholdScale(kpiName: string): string | null {
  const t = THRESHOLDS[kpiName];
  if (!t) return null;
  const u = t.unit ?? '';
  const fmt = (n: number) => `${n}${u}`;
  return t.invert
    ? `Excelente: ≤ ${fmt(t.excellent)} · Buena: ${fmt(t.excellent)}-${fmt(t.good)} · A mejorar: > ${fmt(t.good)}`
    : `Excelente: ≥ ${fmt(t.excellent)} · Buena: ${fmt(t.good)}-${fmt(t.excellent)} · A mejorar: < ${fmt(t.good)}`;
}
