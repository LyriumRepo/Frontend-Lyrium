/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE: Detalle de Pedido - Server Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getOrderById } from '@/shared/lib/actions/orders';
import OrderDetailClient from './OrderDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success || !result.order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">Pedido no encontrado</h2>
          <p className="text-gray-500 mt-2">{result.error}</p>
        </div>
      </div>
    );
  }

  return <OrderDetailClient order={result.order} />;
}
