'use client';

import { useState, useMemo } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { downloadExport } from '@/shared/lib/utils/exportFile';
import BaseDatePicker from '@/components/ui/BaseDatePicker';
import { FileText, FileSpreadsheet, BarChart3, Store, DollarSign, Package, Receipt, Users, CreditCard, Wrench } from 'lucide-react';
import { useUnifiedReportes } from './hooks/useUnifiedReportes';
import {
  exportAdminInvoicesToPdf,
  exportAdminInvoicesToExcel,
  exportAdminInvoicesToCsv,
  exportSellersToPdf,
  exportSellersToExcel,
  exportSellersToCsv,
  exportPaymentsToPdf,
  exportPaymentsToExcel,
  exportPaymentsToCsv,
  exportExpensesToPdf,
  exportExpensesToExcel,
  exportExpensesToCsv,
} from './export';

type TabKey =
  | 'ventas' | 'vendedores' | 'financiero' | 'productos'
  | 'facturacion' | 'padron' | 'pagos' | 'operativa';

interface FormatOption {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => Promise<void>;
}

interface ReportTabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
  formats: FormatOption[];
  /** Solo aplica a las secciones "Reportes Detallados" (datos ya cargados en el navegador). */
  count?: number;
  dataLoading?: boolean;
  dataError?: string | null;
}

const BACKEND_TAB_DEFS: { key: TabKey; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: 'ventas',
    label: 'Ventas',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Transacciones, métodos de pago, resumen diario y detalle de órdenes.',
  },
  {
    key: 'vendedores',
    label: 'Vendedores',
    icon: <Store className="w-4 h-4" />,
    description: 'Rendimiento por tienda: productos, servicios, ventas y comisiones.',
  },
  {
    key: 'financiero',
    label: 'Financiero',
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Resumen financiero: ingresos, gastos, ingreso neto y facturación.',
  },
  {
    key: 'productos',
    label: 'Productos',
    icon: <Package className="w-4 h-4" />,
    description: 'Productos y servicios más vendidos, con precios, ratings y reservas.',
  },
];

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4" />,
  csv: <FileSpreadsheet className="w-4 h-4" />,
  excel: <FileSpreadsheet className="w-4 h-4" />,
};

interface ReportPanelProps {
  tab: ReportTabConfig;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

function ReportPanel({ tab, dateFrom, dateTo, onDateFromChange, onDateToChange }: ReportPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const isBusy = tab.dataLoading || loading !== null;

  const handleFormat = async (fmt: FormatOption) => {
    setLoading(fmt.key);
    setExportError(null);
    try {
      await fmt.onClick();
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al generar el reporte');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
          {tab.icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-[var(--text-primary)]">{tab.label}</h3>
          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">{tab.description}</p>
        </div>
        {tab.count !== undefined && tab.count > 0 && (
          <span className="ml-auto px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold whitespace-nowrap">
            {tab.count} registro{tab.count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <BaseDatePicker
            label="Desde"
            value={dateFrom}
            onChange={onDateFromChange}
            placeholder="Sin fecha"
          />
        </div>
        <div className="flex-1">
          <BaseDatePicker
            label="Hasta"
            value={dateTo}
            onChange={onDateToChange}
            placeholder="Sin fecha"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tab.formats.map((fmt) => (
          <button
            key={fmt.key}
            onClick={() => handleFormat(fmt)}
            disabled={isBusy}
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

      {(exportError || tab.dataError) && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {exportError || tab.dataError}
        </div>
      )}
    </div>
  );
}

export function ReportesPageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('ventas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const reports = useUnifiedReportes({ dateFrom, dateTo });

  const backendTabs: ReportTabConfig[] = useMemo(() => BACKEND_TAB_DEFS.map((def) => ({
    ...def,
    formats: (['pdf', 'csv', 'excel'] as const).map((formatKey) => ({
      key: formatKey,
      label: formatKey.toUpperCase(),
      icon: FORMAT_ICONS[formatKey],
      onClick: async () => {
        const params = new URLSearchParams();
        params.set('format', formatKey);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        await downloadExport(
          `/admin/reportes/${def.key}?${params.toString()}`,
          `reporte-${def.key}.${formatKey === 'excel' ? 'xlsx' : formatKey}`,
        );
      },
    })),
  })), [dateFrom, dateTo]);

  const moduleTabs: ReportTabConfig[] = useMemo(() => [
    {
      key: 'facturacion',
      label: 'Facturación Electrónica',
      icon: <Receipt className="w-4 h-4" />,
      description: 'Comprobantes SUNAT, KPIs y top vendedores.',
      count: reports.invoices.data.length,
      dataLoading: reports.invoices.loading,
      dataError: reports.invoices.error,
      formats: [
        { key: 'pdf', label: 'PDF', icon: FORMAT_ICONS.pdf, onClick: () => exportAdminInvoicesToPdf(reports.invoices.data, reports.invoices.kpis) },
        { key: 'csv', label: 'CSV', icon: FORMAT_ICONS.csv, onClick: () => exportAdminInvoicesToCsv(reports.invoices.data) },
        { key: 'excel', label: 'Excel', icon: FORMAT_ICONS.excel, onClick: () => exportAdminInvoicesToExcel(reports.invoices.data, reports.invoices.kpis) },
      ],
    },
    {
      key: 'padron',
      label: 'Padrón de Vendedores',
      icon: <Users className="w-4 h-4" />,
      description: 'Listado completo de vendedores con estado y métricas.',
      count: reports.sellers.data.length,
      dataLoading: reports.sellers.loading,
      dataError: reports.sellers.error,
      formats: [
        { key: 'pdf', label: 'PDF', icon: FORMAT_ICONS.pdf, onClick: () => exportSellersToPdf(reports.sellers.data) },
        { key: 'csv', label: 'CSV', icon: FORMAT_ICONS.csv, onClick: () => exportSellersToCsv(reports.sellers.data) },
        { key: 'excel', label: 'Excel', icon: FORMAT_ICONS.excel, onClick: () => exportSellersToExcel(reports.sellers.data) },
      ],
    },
    {
      key: 'pagos',
      label: 'Pagos Izipay',
      icon: <CreditCard className="w-4 h-4" />,
      description: 'Transacciones, comisiones y estados de pago.',
      count: reports.payments.data.length,
      dataLoading: reports.payments.loading,
      dataError: reports.payments.error,
      formats: [
        { key: 'pdf', label: 'PDF', icon: FORMAT_ICONS.pdf, onClick: () => exportPaymentsToPdf(reports.payments.data) },
        { key: 'csv', label: 'CSV', icon: FORMAT_ICONS.csv, onClick: () => exportPaymentsToCsv(reports.payments.data) },
        { key: 'excel', label: 'Excel', icon: FORMAT_ICONS.excel, onClick: () => exportPaymentsToExcel(reports.payments.data) },
      ],
    },
    {
      key: 'operativa',
      label: 'Gestión Operativa',
      icon: <Wrench className="w-4 h-4" />,
      description: 'Gastos, proveedores y estados de pago.',
      count: reports.operations.data.length,
      dataLoading: reports.operations.loading,
      dataError: reports.operations.error,
      formats: [
        { key: 'pdf', label: 'PDF', icon: FORMAT_ICONS.pdf, onClick: () => exportExpensesToPdf(reports.operations.data) },
        { key: 'csv', label: 'CSV', icon: FORMAT_ICONS.csv, onClick: () => exportExpensesToCsv(reports.operations.data) },
        { key: 'excel', label: 'Excel', icon: FORMAT_ICONS.excel, onClick: () => exportExpensesToExcel(reports.operations.data) },
      ],
    },
  ], [reports]);

  const allTabs = useMemo(() => [...backendTabs, ...moduleTabs], [backendTabs, moduleTabs]);
  const activeTabConfig = allTabs.find((t) => t.key === activeTab) ?? allTabs[0];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Centro de Reportes"
        subtitle="Genera reportes en PDF, CSV o Excel con filtros por fecha."
        icon="BarChart3"
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {allTabs.map((tab) => (
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
      <ReportPanel
        tab={activeTabConfig}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

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
