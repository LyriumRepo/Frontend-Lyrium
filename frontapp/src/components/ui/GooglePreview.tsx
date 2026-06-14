'use client';

interface GooglePreviewProps {
    title: string;
    description: string;
    slug: string;
}

export function GooglePreview({ title, description, slug }: GooglePreviewProps) {
    const url = `www.biomarket.com/blog/${slug || 'ejemplo'}`;
    const displayTitle = title || 'Título del artículo — BioMarket';
    const displayDesc = description || 'Descripción que aparecerá en los resultados de búsqueda de Google...';

    return (
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-w-[600px]">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Vista previa Google</div>
            <div className="space-y-1">
                <div className="text-xs text-gray-500 truncate">{url}</div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer leading-5 truncate">
                    {displayTitle.length > 60 ? displayTitle.substring(0, 60) + '...' : displayTitle}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 leading-4 line-clamp-2">
                    {displayDesc.length > 160 ? displayDesc.substring(0, 160) + '...' : displayDesc}
                </div>
            </div>
        </div>
    );
}
