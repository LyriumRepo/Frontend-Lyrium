'use client';

import { useRouter } from 'next/navigation';
import { AUTH_CONFIG } from '@/shared/lib/config/auth';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.storage.token);
      localStorage.removeItem(AUTH_CONFIG.storage.user);
    }
    router.push(AUTH_CONFIG.routes.login);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
              <svg 
                className="h-16 w-16 text-red-600 dark:text-red-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acceso No Autorizado
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            Tu cuenta tiene un rol no reconocido. Por favor, contacta al administrador.
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Volver al Login
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@lyrium.com" className="text-blue-600 hover:underline">
              Contactar soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
