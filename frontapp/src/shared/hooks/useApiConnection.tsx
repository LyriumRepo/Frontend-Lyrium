'use client';

import { useState, useEffect, useCallback } from 'react';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ConnectionState {
  wordpress: ConnectionStatus;
  laravel: ConnectionStatus;
  woocommerce: ConnectionStatus;
}

interface UseApiConnectionReturn {
  status: ConnectionState;
  isHealthy: boolean;
  checkConnection: () => Promise<void>;
  lastChecked: Date | null;
  showLaravel: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOOK: Estado de conexión de APIs
 * 
 * Monitorea la conexión con:
 * - WordPress (API REST)
 * - Laravel (API del dashboard)
 * - WooCommerce (Tienda)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function useApiConnection(): UseApiConnectionReturn {
  const [status, setStatus] = useState<ConnectionState>({
    wordpress: 'disconnected',
    laravel: 'disconnected',
    woocommerce: 'disconnected',
  });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    // Setear todos a connecting
    setStatus(prev => ({
      wordpress: 'connecting',
      laravel: 'connecting',
      woocommerce: 'connecting',
    }));

    try {
      // Verificar WordPress REST API
      const wpStatus = await checkEndpoint(
        process.env.NEXT_PUBLIC_WP_API_URL
      );

      // Verificar Laravel (cuando esté disponible)
      const laravelUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL;
      const laravelStatus = laravelUrl 
        ? await checkEndpoint(laravelUrl + '/health')
        : false; // Skip if not configured

      // Verificar WooCommerce (usando endpoint de productos)
      const wcStatus = await checkEndpoint(
        process.env.NEXT_PUBLIC_WC_API_URL + '/products?per_page=1'
      );

      setStatus({
        wordpress: wpStatus ? 'connected' : 'error',
        laravel: laravelStatus ? 'connected' : 'error',
        woocommerce: wcStatus ? 'connected' : 'error',
      });

      setLastChecked(new Date());
    } catch {
      setStatus({
        wordpress: 'error',
        laravel: 'error',
        woocommerce: 'error',
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
    
    // Check cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const isHealthy = status.wordpress === 'connected';

  const showLaravel = !!process.env.NEXT_PUBLIC_LARAVEL_API_URL;

  return { status, isHealthy, checkConnection, lastChecked, showLaravel };
}

/**
 * Verifica si un endpoint está disponible
 */
async function checkEndpoint(url: string | undefined): Promise<boolean> {
  if (!url) return false;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: url.includes('wc/v3') ? {
        'Authorization': 'Basic ' + btoa(process.env.NEXT_PUBLIC_WP_CS_KEY + ':' + process.env.NEXT_PUBLIC_WP_CS_SECRET)
      } : {}
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTE: Indicador de estado de conexión
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  label: string;
  showLabel?: boolean;
}

export function ConnectionIndicator({ status, label, showLabel = true }: ConnectionIndicatorProps) {
  const config = {
    connected: {
      icon: Wifi,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      label: 'Conectado',
    },
    connecting: {
      icon: RefreshCw,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      label: 'Conectando...',
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-gray-400',
      bg: 'bg-gray-50',
      label: 'Sin conexión',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      label: 'Error',
    },
  };

  const { icon: Icon, color, bg, label: statusLabel } = config[status];

  return (
    <div className={`flex items-center gap-1.5 ${bg} px-2 py-1 rounded-full`}>
      <Icon className={`w-3 h-3 ${color} ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {showLabel && (
        <span className={`text-[10px] font-bold ${color} uppercase tracking-wider`}>
          {label}: {statusLabel}
        </span>
      )}
    </div>
  );
}

/**
 * Panel completo de estado de conexiones
 */
export function ConnectionStatusPanel({ status, onRefresh, showLaravel = true }: { 
  status: ConnectionState; 
  onRefresh: () => void;
  showLaravel?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <ConnectionIndicator status={status.wordpress} label="WP" showLabel={false} />
      <ConnectionIndicator status={status.woocommerce} label="WC" showLabel={false} />
      {showLaravel && <ConnectionIndicator status={status.laravel} label="API" showLabel={false} />}
      <button 
        onClick={onRefresh}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Verificar conexiones"
      >
        <RefreshCw className="w-3 h-3 text-gray-400" />
      </button>
    </div>
  );
}