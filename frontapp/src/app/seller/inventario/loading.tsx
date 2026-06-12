import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function StatCardSkeleton() {
    return (
        <div className="rounded-xl border bg-white border-gray-200 px-4 py-3.5 animate-pulse">
            <div className="h-7 w-10 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
    );
}

function AlertRowSkeleton() {
    return (
        <div className="flex items-center justify-between px-5 py-3 gap-4 animate-pulse">
            <div className="space-y-1.5 flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
            <div className="flex items-center gap-3">
                <div className="h-4 w-12 bg-gray-100 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded" />
                <div className="h-7 w-28 bg-gray-100 rounded-md" />
            </div>
        </div>
    );
}

function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 animate-pulse">
            <div className="h-5 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded flex-1" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-10 bg-gray-100 rounded" />
            <div className="h-4 w-10 bg-gray-100 rounded" />
            <div className="h-4 w-10 bg-gray-100 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
        </div>
    );
}

export default function InventoryLoading() {
    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <ModuleHeader
                title="Inventario"
                subtitle="Control de existencias y alertas de stock"
                icon="Boxes"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
            </div>

            {/* Alert panel */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden animate-pulse">
                <div className="px-5 py-3.5 flex items-center gap-3">
                    <div className="h-4 w-4 bg-amber-200 rounded" />
                    <div className="h-4 w-40 bg-amber-200 rounded" />
                </div>
                <div className="border-t border-amber-200 divide-y divide-amber-100">
                    {Array.from({ length: 3 }).map((_, i) => <AlertRowSkeleton key={i} />)}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="h-9 flex-1 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-9 w-64 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-9 w-44 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
                {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}
            </div>
        </div>
    );
}