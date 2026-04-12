/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Invoices
 * 
 * Skeleton para streaming de facturas y comprobantes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function KPISkeleton() {
  return (
    <div className="glass-card p-5 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="h-3 w-16 bg-gray-100 rounded"></div>
      </div>
      <div className="h-7 w-24 bg-gray-200 rounded"></div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
  );
}

function InvoiceRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <div className="h-3 w-32 bg-gray-100 rounded"></div>
      </div>
      <div className="h-4 w-16 bg-gray-200 rounded"></div>
      <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
      <div className="h-4 w-16 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function InvoicesLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Facturación y Comprobantes"
        subtitle="Gestiona tus facturas, boletas y comprobantes de pago"
        icon="FileText"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
        <div className="flex flex-wrap gap-3">
          <FilterSkeleton />
          <FilterSkeleton />
          <FilterSkeleton />
          <div className="ml-auto h-10 w-40 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-t-xl">
          <div className="w-10 h-3 bg-gray-300 rounded"></div>
          <div className="flex-1 h-3 bg-gray-200 rounded"></div>
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <InvoiceRowSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
