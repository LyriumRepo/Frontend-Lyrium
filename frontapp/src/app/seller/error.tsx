'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SellerError({ error, reset }: ErrorProps) {
  const router = useRouter();
  
  useEffect(() => {
    console.error('Seller module error:', error);
  }, [error]);

  const isNotFound = error.message?.includes('no encontrado') || error.message?.includes('not found');

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="SearchX" className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Página No Encontrada</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          La página que buscas no existe.
        </p>
        <button
          onClick={() => router.push('/seller')}
          className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
        >
          Voler al Dashboard
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
        {error.message || 'Ha ocurrido un error inesperado.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/seller')}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Ir al Inicio
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
