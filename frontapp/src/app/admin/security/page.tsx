'use client';

import { useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ChangePasswordForm } from '@/features/auth/change-password';

// ─── Mock data (reemplaza con fetch real si necesitas sesiones del backend) ───

interface Session {
  id: number;
  dispositivo: string;
  navegador: string;
  ubicacion: string;
  tiempo: string;
  actual: boolean;
}

const mockSessions: Session[] = [
  {
    id: 1,
    dispositivo: 'Windows',
    navegador: 'Chrome',
    ubicacion: 'Lima, PE',
    tiempo: 'Sesión actual',
    actual: true,
  },
  {
    id: 2,
    dispositivo: 'iPhone 13',
    navegador: 'Safari',
    ubicacion: 'Lima, PE',
    tiempo: 'Hace 2 horas',
    actual: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerSecurityPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
          Seguridad
        </h1>
        <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
          Protege tu cuenta y gestiona tu contraseña
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Columna principal: Formulario ────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Header de la card */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="flex items-center gap-5 text-white relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                  <Icon name="ShieldCheck" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">
                    Protección de Cuenta
                  </h3>
                  <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">
                    Seguridad
                  </p>
                </div>
              </div>
            </div>

            {/* Sección label */}
            <div className="border-b border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 p-6">
              <div className="flex items-center gap-3 text-sky-600 dark:text-[#6BAF7B]">
                <Icon name="Key" className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Gestión de Contraseña
                </span>
              </div>
            </div>

            {/* Formulario ← componente extraído */}
            <div className="p-8">
              <ChangePasswordForm />
            </div>
          </div>
        </div>

        {/* ── Columna lateral: Tips + Sesiones ────────────────────────────── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] shadow-2xl">
            {/* Tips header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[#1A3A32] rounded-2xl flex items-center justify-center">
                <Icon name="ShieldCheck" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">
                  Consejos de Seguridad
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mantén tu cuenta protegida
                </p>
              </div>
            </div>

            {/* Tips list */}
            <ul className="space-y-4">
              {[
                {
                  icon: 'Shield',
                  color: 'text-sky-500',
                  title: 'Usa una contraseña única',
                  desc: 'No reutilices contraseñas de otras cuentas.',
                },
                {
                  icon: 'RotateCcw',
                  color: 'text-sky-500',
                  title: 'Cambia regularmente',
                  desc: 'Recomendamos cada 3 a 6 meses.',
                },
                {
                  icon: 'AlertTriangle',
                  color: 'text-orange-500',
                  title: 'Nunca la compartas',
                  desc: 'Lyrium nunca te pedirá tu contraseña.',
                },
              ].map((tip) => (
                <li
                  key={tip.title}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)]"
                >
                  <Icon
                    name={tip.icon as never}
                    className={`w-5 h-5 ${tip.color} mt-0.5`}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
                      {tip.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tip.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>


            {/* Sesiones activas */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[var(--border-subtle)]">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase mb-4">
                Sesiones Activas
              </p>
              <div className="space-y-4">
                {mockSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name={session.actual ? 'Monitor' : 'Smartphone'}
                        className="w-5 h-5 text-gray-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">
                          {session.dispositivo} • {session.navegador}
                        </p>
                        <p
                          className={`text-[10px] ${
                            session.actual
                              ? 'text-green-500 font-bold'
                              : 'text-gray-400 dark:text-gray-400'
                          }`}
                        >
                          {session.tiempo}
                          {session.ubicacion && ` • ${session.ubicacion}`}
                        </p>
                      </div>
                    </div>
                    {!session.actual && (
                      <button className="text-[10px] font-black text-red-500 hover:underline uppercase">
                        Cerrar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
