'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface Session {
  id: number;
  dispositivo: string;
  navegador: string;
  ubicacion: string;
  tiempo: string;
  actual: boolean;
}

const mockSessions: Session[] = [
  { id: 1, dispositivo: 'Windows', navegador: 'Chrome', ubicacion: 'Lima, PE', tiempo: 'Sesión actual', actual: true },
  { id: 2, dispositivo: 'iPhone 13', navegador: 'Safari', ubicacion: 'Lima, PE', tiempo: 'Hace 2 horas', actual: false },
];

export default function CustomerSecurityPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });
  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const checkPasswordStrength = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    setRequirements({ length: hasLength, uppercase: hasUppercase, lowercase: hasLowercase, number: hasNumber });

    let strength = 0;
    if (hasLength) strength += 25;
    if (hasUppercase) strength += 25;
    if (hasLowercase) strength += 25;
    if (hasNumber) strength += 25;

    setPasswordStrength(strength);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({ ...passwordData, [field]: value });
    if (field === 'nueva') {
      checkPasswordStrength(value);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Débil';
    if (passwordStrength <= 50) return 'Regular';
    if (passwordStrength <= 75) return 'Buena';
    return 'Fuerte';
  };

  const passwordsMatch = passwordData.nueva === passwordData.confirmar && passwordData.confirmar.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.nueva.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!requirements.length || !requirements.uppercase || !requirements.lowercase || !requirements.number) {
      alert('La contraseña debe cumplir todos los requisitos');
      return;
    }

    if (!passwordsMatch) {
      alert('Las contraseñas no coinciden');
      return;
    }

    alert('Contraseña actualizada correctamente');
    setPasswordData({ actual: '', nueva: '', confirmar: '' });
    setPasswordStrength(0);
    setRequirements({ length: false, uppercase: false, lowercase: false, number: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
          Seguridad
        </h1>
        <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
          Protege tu cuenta y gestiona tu contraseña
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="flex items-center gap-5 text-white relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                  <Icon name="ShieldCheck" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">Protección de Cuenta</h3>
                  <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Centro de Seguridad Avanzada</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 p-6">
              <div className="flex items-center gap-3 text-sky-600 dark:text-[#6BAF7B]">
                <Icon name="Key" className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Gestión de Contraseña</span>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                    Contraseña Actual <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.actual ? 'text' : 'password'}
                      value={passwordData.actual}
                      onChange={(e) => handlePasswordChange('actual', e.target.value)}
                      required
                      className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 pr-12 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, actual: !showPassword.actual })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400"
                    >
                      <Icon name={showPassword.actual ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.nueva ? 'text' : 'password'}
                      value={passwordData.nueva}
                      onChange={(e) => handlePasswordChange('nueva', e.target.value)}
                      required
                      className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 pr-12 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, nueva: !showPassword.nueva })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400"
                    >
                      <Icon name={showPassword.nueva ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 rounded-full ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }}></div>
                      </div>
                      <span className={`text-xs font-bold ${getStrengthColor().replace('bg-', 'text-')}`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 ml-1">
                      <li className={`flex items-center gap-2 ${requirements.length ? 'text-green-600' : ''}`}>
                        <Icon name={requirements.length ? 'CheckCircle' : 'Circle'} className="w-3 h-3" />
                        Mínimo 8 caracteres
                      </li>
                      <li className={`flex items-center gap-2 ${requirements.uppercase ? 'text-green-600' : ''}`}>
                        <Icon name={requirements.uppercase ? 'CheckCircle' : 'Circle'} className="w-3 h-3" />
                        Al menos una mayúscula
                      </li>
                      <li className={`flex items-center gap-2 ${requirements.lowercase ? 'text-green-600' : ''}`}>
                        <Icon name={requirements.lowercase ? 'CheckCircle' : 'Circle'} className="w-3 h-3" />
                        Al menos una minúscula
                      </li>
                      <li className={`flex items-center gap-2 ${requirements.number ? 'text-green-600' : ''}`}>
                        <Icon name={requirements.number ? 'CheckCircle' : 'Circle'} className="w-3 h-3" />
                        Al menos un número
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                    Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirmar ? 'text' : 'password'}
                      value={passwordData.confirmar}
                      onChange={(e) => handlePasswordChange('confirmar', e.target.value)}
                      required
                      className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 pr-12 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirmar: !showPassword.confirmar })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400"
                    >
                      <Icon name={showPassword.confirmar ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
                    </button>
                  </div>
                  {passwordData.confirmar.length > 0 && (
                    <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'} font-bold`}>
                      {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg flex items-center justify-center gap-3"
                  >
                    <Icon name="ShieldCheck" className="w-5 h-5" />
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center">
                <Icon name="ShieldCheck" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">Consejos de Seguridad</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mantén tu cuenta protegida</p>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)]">
                <Icon name="Shield" className="w-5 h-5 text-sky-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Usa una contraseña única</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">No reutilices contraseñas de otras cuentas.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)]">
                <Icon name="RotateCcw" className="w-5 h-5 text-sky-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Cambia regularmente</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recomendamos cada 3 a 6 meses.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)]">
                <Icon name="AlertTriangle" className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Nunca la compartas</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lyrium nunca te pedirá tu contraseña.</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[var(--border-subtle)]">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase mb-4">Sesiones Activas</p>
              <div className="space-y-4">
                {mockSessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name={session.actual ? 'Monitor' : 'Smartphone'} className="w-5 h-5 text-gray-400 dark:text-gray-400" />
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">{session.dispositivo} • {session.navegador}</p>
                        <p className={`text-[10px] ${session.actual ? 'text-green-500 font-bold' : 'text-gray-400 dark:text-gray-400'}`}>
                          {session.tiempo} {session.ubicacion && `• ${session.ubicacion}`}
                        </p>
                      </div>
                    </div>
                    {!session.actual && (
                      <button className="text-[10px] font-black text-red-500 hover:underline uppercase">Cerrar</button>
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
