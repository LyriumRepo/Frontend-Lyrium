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
  document_type: string;
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
  document_type: 'DNI',
  foto: '',
};

export default function CustomerProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // FIX: Mapeo correcto de campos del backend al formulario
  useEffect(() => {
    if (user) {
      // display_name puede ser "Juan Pérez" → separamos en nombre y apellido
      // nicename puede ser "juan-perez" (slug) → no usarlo para apellidos
      const fullName = user.display_name || user.nicename || '';
      const partes = fullName.split(' ');
      const nombres = partes[0] || '';
      const apellidos = partes.slice(1).join(' ') || '';

      setFormData({
        nombres,
        apellidos,
        correo: user.email || '',
        correo_secundario: '',           // No existe en backend aún
        telefono: user.phone || '',      // FIX: user.phone → telefono
        celular_secundario: user.phone_2 || '',  // FIX: user.phone_2
        telefono_fijo: '',               // No existe en backend aún
        fecha_cumpleanos: '',            // No existe en backend aún
        dni: user.document_number || '', // FIX: user.document_number → dni
        document_type: user.document_type || 'DNI',
        foto: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // FIX: handleSave ahora llama al backend real
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const API = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

      // Obtener token de cookie httpOnly a través del proxy de sesión
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const token = sessionData?.token;

      if (!token) {
        setSaveError('No se encontró tu sesión. Vuelve a iniciar sesión.');
        setSaving(false);
        return;
      }

      const payload: Record<string, string> = {
        name: `${formData.nombres} ${formData.apellidos}`.trim(),
      };

      // Solo incluir campos que el backend acepta y que tienen valor
      if (formData.telefono)    payload.phone           = formData.telefono;
      if (formData.dni)         payload.document_number = formData.dni;
      if (formData.document_type) payload.document_type = formData.document_type;
      if (formData.foto)        payload.avatar          = formData.foto;

      const res = await fetch(`${API}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setIsEditMode(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSaveError(errorData?.message || 'Error al guardar. Intenta de nuevo.');
      }
    } catch {
      setSaveError('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSaveError('');
    // Restaurar datos originales del usuario
    if (user) {
      const fullName = user.display_name || user.nicename || '';
      const partes = fullName.split(' ');
      setFormData(prev => ({
        ...prev,
        nombres: partes[0] || '',
        apellidos: partes.slice(1).join(' ') || '',
        telefono: user.phone || '',
        celular_secundario: user.phone_2 || '',
        dni: user.document_number || '',
        document_type: user.document_type || 'DNI',
        foto: user.avatar || '',
      }));
    }
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
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Mi Perfil
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
            Gestiona tu información personal
          </p>
        </div>
        <div className="flex gap-3">
          {/* Botón cancelar (solo en modo edición) */}
          {isEditMode && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-200 transition-all"
            >
              <Icon name="X" className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
          )}
          {/* Botón guardar / editar */}
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
      </div>

      {/* Mensaje de éxito */}
      {saveSuccess && (
        <div className="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-700 dark:text-green-400 text-sm font-bold">
          <Icon name="CheckCircle" className="w-5 h-5 flex-shrink-0" />
          Cambios guardados correctamente.
        </div>
      )}

      {/* Mensaje de error */}
      {saveError && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm font-bold">
          <Icon name="AlertCircle" className="w-5 h-5 flex-shrink-0" />
          {saveError}
        </div>
      )}

      <form className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Panel principal de información */}
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

              {/* Nombres */}
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
                  placeholder="Tu nombre"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
              </div>

              {/* Apellidos */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder={isEditMode ? "Tus apellidos" : "—"}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
              </div>

              {/* Correo Principal (solo lectura siempre) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Correo Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  readOnly
                  className="w-full text-sm font-bold text-gray-500 dark:text-[var(--text-muted)] bg-gray-50 dark:bg-[var(--bg-muted)] p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none cursor-not-allowed"
                />
                <p className="text-[9px] text-gray-400 ml-1 mt-1">El correo no puede modificarse</p>
              </div>

              {/* Correo Secundario */}
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
                  placeholder="—"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
              </div>

              {/* Celular Principal */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Celular Principal
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="+51 --- --- ---"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
              </div>

              {/* Celular Secundario */}
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
                  placeholder="—"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
              </div>

              {/* Teléfono Fijo */}
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
                  placeholder="—"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
              </div>

              {/* Fecha de Cumpleaños */}
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
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
                <p className="text-[9px] text-gray-400 dark:text-gray-400 ml-1 mt-1">
                  Recibirás un saludo especial en tu cumpleaños
                </p>
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Tipo de Documento
                </label>
                {isEditMode ? (
                  <select
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleChange}
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-secondary)] p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                    <option value="PAS">Pasaporte</option>
                    <option value="RUC">RUC</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.document_type || '—'}
                    readOnly
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none cursor-default"
                  />
                )}
              </div>

              {/* Número de Documento (DNI, CE, etc.) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">
                  Número de Documento
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  maxLength={20}
                  placeholder="—"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 read-only:cursor-default"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Panel lateral derecho */}
        <div className="md:col-span-4 space-y-8 self-stretch">

          {/* Foto de perfil */}
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

          {/* Banner de cumpleaños */}
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