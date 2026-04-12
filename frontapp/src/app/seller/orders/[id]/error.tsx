'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrdersError({ error, reset }: ErrorProps) {
  const router = useRouter();
  
  useEffect(() => {
    console.error('Orders error:', error);
  }, [error]);

  const isNotFound = error.message?.includes('no encontrado') || error.message?.includes('not found');
  const isForbidden = error.message?.includes('permiso') || error.message?.includes('No tienes');
  const isUnauthorized = error.message?.includes('No autorizado') || error.message?.includes('Unauthorized');

  const handleGoBack = () => {
    router.push('/seller/orders');
  };

  const handleGoHome = () => {
    router.push('/seller');
  };

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="SearchX" className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Pedido No Encontrado</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          El pedido que buscas no existe o ha sido eliminado.
        </p>
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
        >
          Volver a Pedidos
        </button>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="ShieldX" className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          No tienes permiso para ver este pedido. Este pedido pertenece a otro vendedor.
        </p>
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
        >
          Volver a Mis Pedidos
        </button>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="LogIn" className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Sesión Requerida</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Debes iniciar sesión para ver este pedido.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <Icon name="AlertTriangle" className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Algo Salió Mal</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        {error.message || 'Ha ocurrido un error al cargar el pedido.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Volver
        </button>
        <button
          onClick={reset}
          className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
