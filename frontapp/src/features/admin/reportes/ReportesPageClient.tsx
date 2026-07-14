'use client';

import { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { downloadExport } from '@/shared/lib/utils/exportFile';
import BaseDatePicker from '@/components/ui/BaseDatePicker';
import { FileText, FileSpreadsheet, BarChart3, Store, DollarSign, Package } from 'lucide-react';

type TabKey = 'ventas' | 'vendedores' | 'financiero' | 'productos';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
  formats: { key: string; label: string; icon: React.ReactNode }[];
}

const TABS: TabConfig[] = [
  {
    key: 'ventas',
    label: 'Ventas',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Transacciones, métodos de pago, resumen diario y detalle de órdenes.',
    formats: [
      { key: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
      { key: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { key: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
  },
  {
    key: 'vendedores',
    label: 'Vendedores',
    icon: <Store className="w-4 h-4" />,
    description: 'Rendimiento por tienda: productos, servicios, ventas y comisiones.',
    formats: [
      { key: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
      { key: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { key: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
  },
  {
    key: 'financiero',
    label: 'Financiero',
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Resumen financiero: ingresos, gastos, ingreso neto y facturación.',
    formats: [
      { key: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
      { key: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { key: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
  },
  {
    key: 'productos',
    label: 'Productos',
    icon: <Package className="w-4 h-4" />,
    description: 'Productos y servicios más vendidos, con precios, ratings y reservas.',
    formats: [
      { key: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
      { key: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { key: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
  },
];

function ReportCard({ tab }: { tab: TabConfig }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const buildUrl = (format: string) => {
    const params = new URLSearchParams();
    params.set('format', format);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return `/admin/reportes/${tab.key}?${params.toString()}`;
  };

  const handleDownload = async (format: string) => {
    setLoading(format);
    setExportError(null);
    try {
      await downloadExport(buildUrl(format), `reporte-${tab.key}.${format === 'excel' ? 'xlsx' : format}`);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al generar el reporte');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
          {tab.icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-[var(--text-primary)]">{tab.label}</h3>
          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">{tab.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <BaseDatePicker
            label="Desde"
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="Sin fecha"
          />
        </div>
        <div className="flex-1">
          <BaseDatePicker
            label="Hasta"
            value={dateTo}
            onChange={setDateTo}
            placeholder="Sin fecha"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tab.formats.map((fmt) => (
          <button
            key={fmt.key}
            onClick={() => handleDownload(fmt.key)}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-primary)] hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 disabled:opacity-40"
          >
            {loading === fmt.key ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              fmt.icon
            )}
            {fmt.label}
          </button>
        ))}
      </div>

      {exportError && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {exportError}
        </div>
      )}
    </div>
  );
}

export function ReportesPageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('ventas');

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reportes"
        subtitle="Genera reportes en PDF, CSV o Excel con filtros por fecha."
        icon="BarChart3"
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                : 'bg-white dark:bg-[var(--bg-card)] text-gray-600 dark:text-[var(--text-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active report */}
      <ReportCard tab={TABS.find((t) => t.key === activeTab)!} />

      {/* Quick description */}
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] mb-2">Acerca de los Reportes</h4>
        <ul className="text-xs text-gray-600 dark:text-[var(--text-secondary)] space-y-1.5 list-disc pl-4">
          <li><strong>PDF</strong> — Reporte formateado con tabla de datos y resumen, ideal para imprimir o enviar.</li>
          <li><strong>CSV</strong> — Archivo de texto plano compatible con Excel, ideal para procesamiento de datos.</li>
          <li><strong>Excel</strong> — Archivo .xlsx con formato de tabla, ideal para análisis en Excel.</li>
          <li>Usa los filtros de fecha para acotar el periodo del reporte.</li>
        </ul>
      </div>
    </div>
  );
}
