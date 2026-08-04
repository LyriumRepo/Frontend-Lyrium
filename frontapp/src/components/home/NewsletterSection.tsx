'use client';

import { useState } from 'react';
import Link from 'next/link';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [suscrito, setSuscrito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${LARAVEL_API_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      if (result.success) {
        setSuscrito(true);
        setEmail('');
      } else {
        setError(result.message || 'Error al suscribirse');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-teal-300 dark:bg-[#1A3A32] text-white px-6 md:px-16 py-12 md:py-16 w-full">
      {suscrito ? (
        <div className="text-center py-6">
          <p className="font-semibold text-2xl md:text-3xl">¡Gracias por suscribirte!</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-9 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              ¡SUSCRÍBETE Y RECIBE LAS MEJORES OFERTAS!
            </h2>
            <p className="text-base md:text-lg">
              Obtén nuestras últimas novedades, ofertas y tips para llevar una vida saludable.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Escribe tu correo aquí"
                className="flex-1 min-w-0 px-6 py-4 rounded-full bg-white text-gray-800 placeholder:text-gray-400 text-base border border-teal-200 dark:border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-9 py-4 rounded-full bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-base font-semibold shadow-md transition-colors disabled:opacity-50 dark:border-[var(--border-subtle)] shrink-0 whitespace-nowrap"
              >
                {loading ? 'Suscribiendo...' : 'Suscribirme'}
              </button>
            </div>

            {error && (
              <p className="text-red-200 text-sm">{error}</p>
            )}

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" required />
              <span className="leading-tight">
                He leído y acepto la{' '}
                <Link href="/politicasdeprivacidad" className="underline">
                  Política de Privacidad.
                </Link>
              </span>
            </label>
          </form>
        </div>
      )}
    </section>
  );
}
