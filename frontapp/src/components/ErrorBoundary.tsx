'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'inline';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR BOUNDARY - Manejo de errores en componentes React
 * 
 * Captura errores en componentes hijos y muestra UI de fallback.
 * Solo funciona en Client Components.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isInline = this.props.level === 'inline';
      const isPage = this.props.level === 'page';

      if (isInline) {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Algo salió mal</p>
            <button
              onClick={this.handleRetry}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        );
      }

      if (isPage) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
              <p className="text-gray-600 mb-6">
                Lo sentimos, occurredió un error inesperado. Por favor intenta de nuevo.
              </p>
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <pre className="text-left text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-40 mb-6">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-4">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                >
                  Reintentar
                </button>
                <a
                  href="/"
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Ir al inicio
                </a>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error en el componente</h2>
          <p className="text-sm text-gray-600 mb-4">
            Este componente no pudo cargarse correctamente.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTE: ErrorBoundary inline (para usar directamente)
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface InlineErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function InlineErrorBoundary({ children, fallback, onError }: InlineErrorBoundaryProps) {
  return (
    <ErrorBoundary level="inline" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOOK: useErrorHandler
 * 
 * Permite que componentes funcionales capturen errores
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: Error | unknown) => {
    if (err instanceof Error) {
      setError(err);
      console.error('[useErrorHandler]', err);
    } else {
      setError(new Error(String(err)));
    }
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, error, resetError };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTE: Suspense fallback con retry
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface SuspenseFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function SuspenseFallback({ message = 'Cargando...', onRetry }: SuspenseFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
