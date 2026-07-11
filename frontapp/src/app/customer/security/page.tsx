'use client';

import { useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { ChangePasswordForm } from '@/features/auth/change-password';
import ActiveSessionsList from '@/features/security/components/ActiveSessionsList';

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
      <ModuleHeader
        title="Seguridad"
        subtitle="Protege tu cuenta y gestiona tu contraseña"
        icon="Shield"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Columna principal: Formulario ────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Header de la card */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 relative overflow-hidden">
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
                    Centro de Seguridad Avanzada
                  </p>
                </div>
              </div>
            </div>

            {/* Sección label */}
            <div className="border-b border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 p-6">
              <div className="flex items-center gap-3 text-sky-600 dark:text-[var(--icons-green)]">
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

        {/* ── Columna lateral: Tips de seguridad ───────────────────────── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] shadow-2xl">
            {/* Tips header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] rounded-2xl flex items-center justify-center">
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
                  color: 'text-sky-500 dark:text-[var(--icons-green)]',
                  title: 'Usa una contraseña única',
                  desc: 'No reutilices contraseñas de otras cuentas.',
                },
                {
                  icon: 'RotateCcw',
                  color: 'text-sky-500 dark:text-[var(--icons-green)]',
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

            <ActiveSessionsList />
          </div>
        </div>
      </div>
    </div>
  );
}
