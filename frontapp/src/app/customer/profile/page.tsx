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
  tipo_documento: string;
  numero_documento: string;
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
  tipo_documento: 'DNI',
  numero_documento: '',
  foto: '',
};

export default function CustomerProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

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
        tipo_documento: 'DNI',
        numero_documento: '',
        foto: user.avatar || '',
      });
    }
  }, [user]);

  const formatearDocumento = (valor: string, tipoDocumento: string) => {
    const numeros = valor.replace(/\D/g, '');

    if (tipoDocumento === 'DNI') {
      return numeros.slice(0, 8);
    }

    if (tipoDocumento === 'CE' || tipoDocumento === 'PASAPORTE') {
      return numeros.slice(0, 9);
    }

    if (tipoDocumento === 'RUC') {
      const soloNumeros = numeros.slice(0, 11);

      if (soloNumeros.length <= 2) return soloNumeros;
      if (soloNumeros.length <= 10) {
        return `${soloNumeros.slice(0, 2)}-${soloNumeros.slice(2)}`;
      }

      return `${soloNumeros.slice(0, 2)}-${soloNumeros.slice(2, 10)}-${soloNumeros.slice(10)}`;
    }

    return numeros;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ProfileFormData;

    if (name === 'numero_documento' && e.target instanceof HTMLInputElement) {
      setFormData(prev => ({
        ...prev,
        numero_documento: formatearDocumento(value, prev.tipo_documento),
      }));

      setErrors(prev => ({ ...prev, numero_documento: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleTipoDocumentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nuevoTipo = e.target.value;

    setFormData(prev => ({
      ...prev,
      tipo_documento: nuevoTipo,
      numero_documento: formatearDocumento(prev.numero_documento, nuevoTipo),
    }));

    setErrors(prev => ({
      ...prev,
      tipo_documento: '',
      numero_documento: '',
    }));
  };

  const requiredFields: { key: keyof ProfileFormData; label: string }[] = [
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'correo', label: 'Correo Principal' },
    { key: 'telefono', label: 'Celular Principal' },
    { key: 'tipo_documento', label: 'Tipo de Documento' },
    { key: 'numero_documento', label: 'Número de Documento' },
  ];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    requiredFields.forEach(({ key, label }) => {
      if (!formData[key].toString().trim()) {
        newErrors[key] = `El campo ${label} es obligatorio.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Aquí iría tu lógica real de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const parseBirthday = (dateStr: string) => {
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;

    return { year, month, day };
  };

  const makeLocalDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const formatBirthday = (dateStr: string) => {
    const parts = parseBirthday(dateStr);
    if (!parts) return '---';

    const date = makeLocalDate(parts.year, parts.month, parts.day);

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  };

  const getBirthdayContent = (dateStr: string) => {
    const parts = parseBirthday(dateStr);

    if (!parts) {
      return {
        title: 'Lyrium siempre piensa en ti',
        description: 'Aún no tienes una fecha de cumpleaños registrada.',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = today.getFullYear();

    let nextBirthday = makeLocalDate(currentYear, parts.month, parts.day);
    if (nextBirthday < today) {
      nextBirthday = makeLocalDate(currentYear + 1, parts.month, parts.day);
    }

    let lastBirthday = makeLocalDate(currentYear, parts.month, parts.day);
    if (lastBirthday > today) {
      lastBirthday = makeLocalDate(currentYear - 1, parts.month, parts.day);
    }

    const daysUntilBirthday = Math.round(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysSinceBirthday = Math.round(
      (today.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilBirthday === 0) {
      return {
        title: '¡Feliz cumpleaños!',
        description: 'Hoy es tu día. Te deseamos un cumpleaños increíble.',
      };
    }

    if (daysUntilBirthday >= 1 && daysUntilBirthday <= 30) {
      return {
        title: '¡Tu día especial <br /> está llegando!',
        description: 'Prepárate para una sorpresa exclusiva diseñada solo para ti.',
      };
    }

    if (daysSinceBirthday >= 1 && daysSinceBirthday <= 7) {
      return {
        title: 'Tu día especial fue hace poco',
        description: 'Esperamos que la hayas pasado genial y que hayas disfrutado tu día al máximo.',
      };
    }

    return {
      title: 'Lyrium siempre piensa en ti',
      description: 'Todavía falta bastante para tu día especial, pero ya lo tenemos presente.',
    };
  };

  const birthdayContent = getBirthdayContent(formData.fecha_cumpleanos);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const inputClassName = (field: keyof ProfileFormData) =>
    `w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 rounded-xl outline-none transition-all duration-300 ${
      errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
        : 'border-gray-200 dark:border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)]'
    }`;

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
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isEditMode
            ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)]'
            : 'bg-white dark:bg-[var(--bg-secondary)] text-black dark:text-[var(--text-primary)] border border-gray-200 dark:border-[var(--border-subtle)] hover:text-sky-500 dark:hover:text-[var(--icons-green)]'
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
          <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-8 flex items-center gap-5 relative overflow-hidden">
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
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="Cargando..."
                  className={inputClassName('nombres')}
                />
                {errors.nombres && (
                  <p className="text-xs text-red-500 font-semibold ml-1">{errors.nombres}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="Cargando..."
                  className={inputClassName('apellidos')}
                />
                {errors.apellidos && (
                  <p className="text-xs text-red-500 font-semibold ml-1">{errors.apellidos}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Correo Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="usuario@ejemplo.com"
                  className={inputClassName('correo')}
                />
                {errors.correo && (
                  <p className="text-xs text-red-500 font-semibold ml-1">{errors.correo}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Correo Secundario (opcional)
                </label>
                <input
                  type="email"
                  name="correo_secundario"
                  value={formData.correo_secundario}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Celular Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="+51 --- --- ---"
                  className={inputClassName('telefono')}
                />
                {errors.telefono && (
                  <p className="text-xs text-red-500 font-semibold ml-1">{errors.telefono}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Celular Secundario (opcional)
                </label>
                <input
                  type="tel"
                  name="celular_secundario"
                  value={formData.celular_secundario}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Teléfono Fijo (opcional)
                </label>
                <input
                  type="tel"
                  name="telefono_fijo"
                  value={formData.telefono_fijo}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Fecha de Cumpleaños (opcional)
                </label>
                <input
                  type="date"
                  name="fecha_cumpleanos"
                  value={formData.fecha_cumpleanos}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
                <p className="text-[9px] text-gray-400 dark:text-gray-400 ml-1 mt-1">
                  Recibirás un saludo especial en tu cumpleaños
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleTipoDocumentoChange}
                  disabled={!isEditMode}
                  className={`w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] p-3 border-2 rounded-xl outline-none transition-all duration-300 bg-white dark:bg-[var(--bg-secondary)] ${
                    errors.tipo_documento
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
                      : 'border-gray-200 dark:border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)]'
                  }`}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
                {errors.tipo_documento && (
                  <p className="text-xs text-red-500 font-semibold ml-1">{errors.tipo_documento}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={
                    formData.tipo_documento === 'RUC'
                      ? 'XX-XXXXXXXX-X'
                      : 'Ingrese el número'
                  }
                  className={inputClassName('numero_documento')}
                />
                {errors.numero_documento && (
                  <p className="text-xs text-red-500 font-semibold ml-1">{errors.numero_documento}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-8 self-stretch">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-8 flex items-center gap-5 relative overflow-hidden">
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
                    className="mt-4 px-6 py-2 rounded-lg bg-sky-50 text-sky-600 dark:text-[var(--brand-green)] text-sm font-bold hover:bg-sky-100 dark:hover:bg-lime-100 transition-colors"
                  >
                    Cambiar Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 via-green-500 to-sky-500 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] rounded-3xl shadow-xl relative overflow-hidden p-7 text-center space-y-5">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
              <div className="absolute w-40 h-40 bg-white/20 rounded-full -top-10 -left-10 blur-2xl" />
              <div className="absolute w-56 h-56 bg-white/10 rounded-full -bottom-20 -right-20 blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-4">
                <Icon name="Gift" className="w-8 h-8 text-white" />
              </div>

              <h4
                className="text-xl font-black tracking-tighter leading-tight text-white"
                dangerouslySetInnerHTML={{ __html: birthdayContent.title }}
              />

              <div className="inline-block px-2.5 py-0.5 bg-black/10 backdrop-blur-md rounded-full border border-white/10 mt-2">
                <p className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Celebración Lyrium</p>
              </div>

              <p className="text-[11px] font-bold leading-tight text-white/90 max-w-[200px] mx-auto mt-3">
                {birthdayContent.description}
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