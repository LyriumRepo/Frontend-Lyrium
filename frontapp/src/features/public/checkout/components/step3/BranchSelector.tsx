'use client';

import { useState, useEffect } from 'react';
import { Store, MapPin, Clock, Phone, CheckCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface Branch {
  id: number;
  name: string;
  address: string;
  district: string;
  province: string;
  phone: string;
  hours: string;
  maps_url: string | null;
  branch_stock: number;
}

export default function BranchSelector() {
  const cartItems = useCheckoutStore((s) => s.cartItems);
  const orderData = useCheckoutStore((s) => s.orderData);
  const setOrderData = useCheckoutStore((s) => s.setOrderData);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const selectedStoreIds = [...new Set(
    cartItems.filter(i => i.selected && i.id > 0).map(i => i.storeId)
  )];

  useEffect(() => {
    if (selectedStoreIds.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchBranches() {
      setLoading(true);
      setError(null);
      const allBranches: Branch[] = [];

      try {
        for (const storeId of selectedStoreIds) {
          const product = cartItems.find(i => i.storeId === storeId && i.id > 0);
          if (!product) continue;

          const res = await fetch(`${LARAVEL_API_URL}/products/${product.id}/branches/public`);
          const json = await res.json();
          const data = json.data || [];
          allBranches.push(...data);
        }

        const unique = allBranches.filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i);
        setBranches(unique);
      } catch {
        setError('Error al cargar sucursales disponibles.');
      } finally {
        setLoading(false);
      }
    }

    fetchBranches();
  }, [selectedStoreIds.join(',')]);

  const handleSelect = (branchId: number) => {
    setOrderData({ selectedBranchId: branchId });
    setExpandedId(expandedId === branchId ? null : branchId);
  };

  const getMapEmbedUrl = (branch: Branch): string | null => {
    if (branch.maps_url) {
      const googleMapsEmbed = branch.maps_url.match(/google\.com\/maps\?[^"]*q=([^"&]+)/);
      if (googleMapsEmbed) {
        return `https://www.google.com/maps/embed/v1/place?key=&q=${decodeURIComponent(googleMapsEmbed[1])}`;
      }
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d500!2d0!3d0!2m2!1f0!2f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2s`;
    }
    const query = encodeURIComponent(`${branch.address}, ${branch.district}, ${branch.province}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 px-1">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-500 border-t-transparent" />
        <span className="text-[11px] text-gray-500">Cargando sucursales...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
        {error}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
        No hay sucursales disponibles para retiro.
      </div>
    );
  }

  const VISIBLE_COUNT = 3;
  const needsScroll = branches.length > VISIBLE_COUNT;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Store className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Sucursal de recojo
        </p>
        {needsScroll && (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 ml-auto">
            {branches.length} disponibles
          </span>
        )}
      </div>

      <div
        className={needsScroll ? 'max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent' : ''}
      >
      <div className="space-y-1.5">
      {branches.map(branch => {
        const isSelected = orderData.selectedBranchId === branch.id;
        const isExpanded = expandedId === branch.id;

        return (
          <div key={branch.id}>
            {/* Fila compacta — click selecciona + expande */}
            <button
              type="button"
              onClick={() => handleSelect(branch.id)}
              className={[
                'w-full flex items-center gap-2 py-2 px-2.5 rounded-lg border text-left transition-all duration-200',
                isSelected
                  ? 'bg-sky-50 dark:bg-[var(--brand-green)]/10 border-sky-400 dark:border-[var(--brand-green)] shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-sky-200 dark:hover:border-[var(--brand-green)]/30',
              ].join(' ')}
            >
              {/* Icono check/store */}
              <div className={[
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                isSelected
                  ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
              ].join(' ')}>
                {isSelected ? <CheckCircle className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
              </div>

              {/* Nombre + distrito */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {branch.name}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                  {branch.district}
                </p>
              </div>

              {/* Badge stock */}
              <span className={[
                'text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
                isSelected
                  ? 'bg-sky-100 text-sky-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
              ].join(' ')}>
                {branch.branch_stock} uds
              </span>

              {/* Chevron */}
              <ChevronDown className={[
                'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200',
                isExpanded ? 'rotate-180' : '',
                isSelected ? 'text-sky-500 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600',
              ].join(' ')} />
            </button>

            {/* Panel expandido — detalles */}
            {isExpanded && (
              <div className="mr-2 mt-1 mb-1.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 space-y-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                {branch.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">{branch.address}, {branch.district}</p>
                  </div>
                )}
                {branch.hours && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">{branch.hours}</p>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">{branch.phone}</p>
                  </div>
                )}
                {branch.maps_url && (
                  <a
                    href={branch.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[10px] text-sky-500 dark:text-emerald-400 hover:underline mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver en mapa
                  </a>
                )}

                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
                  <iframe
                    src={getMapEmbedUrl(branch) || ''}
                    width="100%"
                    height="140"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
      </div>
    </div>
  );
}
