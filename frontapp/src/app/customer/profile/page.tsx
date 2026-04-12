'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface ProfileFormData {
  nombres: string;
  apellidos: string;
  correo: string;
  correo_secundario: string;
  telefono: string;
  celular_secundario: string;
  telefono_fijo: string;
  fecha_cumpleanos: string;
  dni: string;
  foto: string;
}

const initialData: ProfileFormData = {
  nombres: '',
  apellidos: '',
  correo: '',
  correo_secundario: '',
  telefono: '',
  celular_secundario: '',
  telefono_fijo: '',
  fecha_cumpleanos: '',
  dni: '',
  foto: '',
};

export default function CustomerProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nicename?.split(' ')[0] || '',
        apellidos: user.nicename?.split(' ').slice(1).join(' ') || '',
        correo: user.email || '',
        correo_secundario: '',
        telefono: '',
        celular_secundario: '',
        telefono_fijo: '',
        fecha_cumpleanos: '',
        dni: '',
        foto: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setIsEditMode(false);
    alert('Cambios guardados correctamente');
  };

  const formatBirthday = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    } catch {
      return '---';
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Mi Perfil
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
            Gestiona tu información personal
          </p>
        </div>
        <button
          onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
          disabled={saving}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            isEditMode
              ? 'bg-sky-500 text-white hover:bg-sky-600'
              : 'bg-white dark:bg-[var(--bg-secondary)] text-black dark:text-[var(--text-primary)] border border-gray-200 dark:border-[var(--border-subtle)] hover:text-sky-500'
          }`}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : isEditMode ? (
            <>
              <Icon name="Check" className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </>
          ) : (
            <>
              <Icon name="Pencil" className="w-5 h-5" />
              <span>Editar Información</span>
            </>
          )}
        </button>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-8 bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-300 p-8 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Icon name="User" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter leading-none text-white">
                Información Personal
              </h3>
              <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1">
                Datos del Usuario
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="Cargando..."
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="Cargando..."
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Correo Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="usuario@ejemplo.com"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Correo Secundario
                </label>
                <input
                  type="email"
                  name="correo_secundario"
                  value={formData.correo_secundario}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Celular Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="+51 --- --- ---"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Celular Secundario
                </label>
                <input
                  type="tel"
                  name="celular_secundario"
                  value={formData.celular_secundario}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Teléfono Fijo
                </label>
                <input
                  type="tel"
                  name="telefono_fijo"
                  value={formData.telefono_fijo}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Fecha de Cumpleaños
                </label>
                <input
                  type="date"
                  name="fecha_cumpleanos"
                  value={formData.fecha_cumpleanos}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
                <p className="text-[9px] text-gray-400 dark:text-gray-400 ml-1 mt-1">
                  Recibirás un saludo especial en tu cumpleaños
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  DNI
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  maxLength={8}
                  pattern="[0-9]{8}"
                  placeholder="--------"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-8 self-stretch">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-300 p-8 flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <Icon name="Camera" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tighter leading-none text-white">
                  Foto de Perfil
                </h3>
                <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1">
                  Opcional
                </p>
              </div>
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-sky-100 shadow-xl group-hover:scale-105 transition-all duration-500">
                  {formData.foto ? (
                    <img src={formData.foto} alt="Foto de Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-[var(--bg-muted)] flex items-center justify-center">
                      <Icon name="User" className="w-16 h-16 text-gray-400 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Formatos: JPG, PNG</p>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Tamaño máximo: 2MB</p>
                {isEditMode && (
                  <button
                    type="button"
                    className="mt-4 px-6 py-2 rounded-lg bg-sky-50 text-sky-600 text-sm font-bold hover:bg-sky-100 transition-colors"
                  >
                    Cambiar Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 via-green-500 to-sky-500 rounded-3xl shadow-xl relative overflow-hidden p-7 text-center space-y-5">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
              <div className="absolute w-40 h-40 bg-white/20 rounded-full -top-10 -left-10 blur-2xl" />
              <div className="absolute w-56 h-56 bg-white/10 rounded-full -bottom-20 -right-20 blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-4">
                <Icon name="Gift" className="w-8 h-8 text-white" />
              </div>
              
              <h4 className="text-xl font-black tracking-tighter leading-tight text-white">
                ¡Tu día especial <br /> está llegando!
              </h4>
              
              <div className="inline-block px-2.5 py-0.5 bg-black/10 backdrop-blur-md rounded-full border border-white/10 mt-2">
                <p className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Celebración Lyrium</p>
              </div>
              
              <p className="text-[11px] font-bold leading-tight text-white/90 max-w-[200px] mx-auto mt-3">
                Prepárate para una sorpresa exclusiva diseñada solo para ti.
              </p>
              
              <div className="mt-4 px-6 py-3 bg-white/10 backdrop-blur-2xl rounded-xl border border-white/40 shadow-md inline-block">
                <span className="text-sm font-black text-white uppercase tracking-widest leading-none">
                  {formatBirthday(formData.fecha_cumpleanos)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
