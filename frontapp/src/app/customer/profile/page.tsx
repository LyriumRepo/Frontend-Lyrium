'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { userRepository } from '@/shared/lib/api/factory';
import { useToast } from '@/shared/lib/context/ToastContext';
import WelcomeGuide from '@/features/customer/onboarding/WelcomeGuide';
import ProfileCompletionGuide from '@/features/customer/onboarding/ProfileCompletionGuide';

const CONFETTI_COLORS = [
  '#2A5A4D', '#64c695', '#9cb04e',
  '#fbbf24', '#f472b6', '#60a5fa',
  '#a78bfa', '#fb923c', '#34d399',
];

function BirthdayCelebration({ name }: { name: string }) {
  const [opacity, setOpacity] = useState(0);
  const [gone, setGone] = useState(false);

  const particles = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3.2,
      duration: 2.5 + Math.random() * 2.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 5 + Math.random() * 11,
      isRect: Math.random() > 0.4,
      rotate: Math.random() * 360,
    }))
  , []);

  useEffect(() => {
    const t0 = setTimeout(() => setOpacity(1), 60);
    const t1 = setTimeout(() => setOpacity(0), 4200);
    const t2 = setTimeout(() => setGone(true), 5400);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[400] pointer-events-none"
      style={{ opacity, transition: 'opacity 1s ease' }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.isRect ? `${p.size * 0.5}px` : `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.isRect ? '2px' : '50%',
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in both`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      <div className="fixed top-[72px] left-0 right-0 flex justify-center px-4" style={{ zIndex: 401 }}>
        <div
          style={{ animation: 'birthdayBannerIn 5.2s ease forwards' }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-7 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm w-full"
        >
          <span style={{ fontSize: '30px', animation: 'birthdaySpin 2s linear infinite' }}>🎂</span>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base leading-tight truncate">
              ¡Feliz cumpleaños, {name}!
            </p>
            <p className="text-xs text-white/80 font-medium mt-0.5">
              La familia Lyrium celebra tu día 🌿🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const { showToast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.display_name?.split(' ').slice(0, -1).join(' ') || user.nicename?.split(' ')[0] || '',
        apellidos: user.display_name?.split(' ').slice(-1).join(' ') || user.nicename?.split(' ').slice(1).join(' ') || '',
        correo: user.email || '',
        correo_secundario: user.secondary_email || '',
        telefono: user.phone || '',
        celular_secundario: user.phone_2 || '',
        telefono_fijo: user.landline || '',
        fecha_cumpleanos: user.birthday ? user.birthday.substring(0, 10) : '',
        tipo_documento: user.document_type || 'DNI',
        numero_documento: user.document_number || '',
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

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setFormData(prev => ({ ...prev, foto: previewUrl }));
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    try {
      setSaving(true);

      let avatarUrl = formData.foto;

      if (avatarFile) {
        setUploadingAvatar(true);
        const result = await userRepository.uploadAvatar(avatarFile);
        avatarUrl = result.avatar;
        setAvatarFile(null);
        setAvatarPreview(null);
        setFormData(prev => ({ ...prev, foto: avatarUrl }));
        setUploadingAvatar(false);
      }

      const updatePayload: Record<string, string | undefined> = {
        name: `${formData.nombres} ${formData.apellidos}`.trim(),
        email: formData.correo || undefined,
        secondary_email: formData.correo_secundario || undefined,
        phone: formData.telefono,
        phone_2: formData.celular_secundario || undefined,
        landline: formData.telefono_fijo || undefined,
        birthday: formData.fecha_cumpleanos || undefined,
        document_type: formData.tipo_documento,
        document_number: formData.numero_documento.replace(/\D/g, ''),
        avatar: avatarUrl || undefined,
      };

      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key];
        }
      });

      await userRepository.updateUser(user.id, updatePayload as any);

      setIsEditMode(false);
      showToast('Cambios guardados correctamente.', 'success');
    } catch (err: any) {
      console.error('Error al guardar perfil:', err);
      if (err?.validationErrors) {
        const fieldMap: Record<string, keyof ProfileFormData> = {
          name: 'nombres',
          email: 'correo',
          secondary_email: 'correo_secundario',
          phone: 'telefono',
          phone_2: 'celular_secundario',
          landline: 'telefono_fijo',
          birthday: 'fecha_cumpleanos',
          document_type: 'tipo_documento',
          document_number: 'numero_documento',
        };
        const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        Object.entries(err.validationErrors as Record<string, string[]>).forEach(([field, msgs]) => {
          const mapped = fieldMap[field];
          if (mapped) newErrors[mapped] = msgs[0];
        });
        setErrors(Object.keys(newErrors).length > 0 ? newErrors : { nombres: err.message });
      } else {
        setErrors({ nombres: err?.message || 'Ocurrió un error al guardar los cambios. Intenta nuevamente.' });
      }
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
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

  // Campos que cuentan para el % de perfil completo. Los obligatorios casi
  // siempre están llenos (se exigen al guardar); los opcionales son los que
  // realmente valen la pena resaltar (cumpleaños, teléfono secundario, foto…).
  const completionFields: { key: keyof ProfileFormData; label: string }[] = [
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'correo', label: 'Correo principal' },
    { key: 'telefono', label: 'Celular principal' },
    { key: 'numero_documento', label: 'Documento de identidad' },
    { key: 'foto', label: 'Foto de perfil' },
    { key: 'fecha_cumpleanos', label: 'Fecha de cumpleaños' },
    { key: 'celular_secundario', label: 'Celular secundario' },
    { key: 'correo_secundario', label: 'Correo secundario' },
  ];

  const profileCompletion = useMemo(() => {
    const missing = completionFields.filter(({ key }) => !formData[key]?.toString().trim());
    const filledCount = completionFields.length - missing.length;
    const percent = Math.round((filledCount / completionFields.length) * 100);
    return { percent, missing };
  }, [formData]);

  const birthdayContent = getBirthdayContent(formData.fecha_cumpleanos);

  const isBirthday = useMemo(() => {
    if (!formData.fecha_cumpleanos) return false;
    const parts = parseBirthday(formData.fecha_cumpleanos);
    if (!parts) return false;
    const today = new Date();
    return today.getMonth() + 1 === parts.month && today.getDate() === parts.day;
  }, [formData.fecha_cumpleanos]);

  // Dispara el modal premium de cumpleaños cuando el perfil detecta que es hoy
  useEffect(() => {
    if (isBirthday) {
      window.dispatchEvent(new CustomEvent('lyrium:birthday'));
    }
  }, [isBirthday]);

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

  const firstName = (user.display_name ?? user.nicename ?? '').split(' ')[0] || 'amigo';

  return (
    <>
    <WelcomeGuide userId={user.id} />
    <ProfileCompletionGuide userId={user.id} missing={profileCompletion.missing} />
    {isBirthday && <BirthdayCelebration name={firstName} />}
    <div className="space-y-8 animate-fadeIn">
      <ModuleHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información personal"
        icon="User"
      />

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-md border border-slate-100 dark:border-[var(--border-subtle)] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest">
            Perfil completo
          </span>
          <span className="text-sm font-black text-sky-600 dark:text-[var(--brand-green)]">
            {profileCompletion.percent}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={profileCompletion.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Porcentaje de perfil completo"
          className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] transition-all duration-500"
            style={{ width: `${profileCompletion.percent}%` }}
          />
        </div>
        {profileCompletion.missing.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Te falta completar: {profileCompletion.missing.map((f) => f.label).join(', ')}.
          </p>
        )}
      </div>

      <div className="w-full sm:max-w-xs mx-auto md:mx-0 md:ml-auto">
        <BaseButton
          onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
          isLoading={saving}
          variant="action"
          leftIcon={isEditMode ? "Check" : "Pencil"}
          size="lg"
          fullWidth
        >
          {isEditMode ? "Guardar Cambios" : "Editar Información"}
        </BaseButton>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-8 bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 flex items-center gap-5 relative overflow-hidden">
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
                <label htmlFor="nombres" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Nombres <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only"> (obligatorio)</span>
                </label>
                <input
                  id="nombres"
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="Cargando..."
                  aria-required="true"
                  aria-invalid={!!errors.nombres}
                  aria-describedby={errors.nombres ? 'nombres-error' : undefined}
                  className={inputClassName('nombres')}
                />
                {errors.nombres && (
                  <p id="nombres-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                    <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.nombres}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="apellidos" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Apellidos <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only"> (obligatorio)</span>
                </label>
                <input
                  id="apellidos"
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="Cargando..."
                  aria-required="true"
                  aria-invalid={!!errors.apellidos}
                  aria-describedby={errors.apellidos ? 'apellidos-error' : undefined}
                  className={inputClassName('apellidos')}
                />
                {errors.apellidos && (
                  <p id="apellidos-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                    <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.apellidos}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="correo" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Correo Principal
                </label>
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="usuario@ejemplo.com"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="correo_secundario" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Correo Secundario (opcional)
                </label>
                <input
                  id="correo_secundario"
                  type="email"
                  name="correo_secundario"
                  value={formData.correo_secundario}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="telefono" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Celular Principal <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only"> (obligatorio)</span>
                </label>
                <input
                  id="telefono"
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  placeholder="+51 --- --- ---"
                  aria-required="true"
                  aria-invalid={!!errors.telefono}
                  aria-describedby={errors.telefono ? 'telefono-error' : undefined}
                  className={inputClassName('telefono')}
                />
                {errors.telefono && (
                  <p id="telefono-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                    <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.telefono}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="celular_secundario" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Celular Secundario (opcional)
                </label>
                <input
                  id="celular_secundario"
                  type="tel"
                  name="celular_secundario"
                  value={formData.celular_secundario}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="telefono_fijo" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Teléfono Fijo (opcional)
                </label>
                <input
                  id="telefono_fijo"
                  type="tel"
                  name="telefono_fijo"
                  value={formData.telefono_fijo}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent dark:bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)] transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="fecha_cumpleanos" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Fecha de Cumpleaños (opcional)
                </label>
                <input
                  id="fecha_cumpleanos"
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
                <label htmlFor="tipo_documento" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Tipo de Documento <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only"> (obligatorio)</span>
                </label>
                <select
                  id="tipo_documento"
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleTipoDocumentoChange}
                  disabled={!isEditMode}
                  aria-required="true"
                  aria-invalid={!!errors.tipo_documento}
                  aria-describedby={errors.tipo_documento ? 'tipo_documento-error' : undefined}
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
                  <p id="tipo_documento-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                    <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.tipo_documento}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="numero_documento" className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
                  Número de Documento <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only"> (obligatorio)</span>
                </label>
                <input
                  id="numero_documento"
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
                  aria-required="true"
                  aria-invalid={!!errors.numero_documento}
                  aria-describedby={errors.numero_documento ? 'numero_documento-error' : undefined}
                  className={inputClassName('numero_documento')}
                />
                {errors.numero_documento && (
                  <p id="numero_documento-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                    <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.numero_documento}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-8 self-stretch">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 flex items-center gap-5 relative overflow-hidden">
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
                <div id="foto" className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-sky-100 shadow-xl group-hover:scale-105 transition-all duration-500">
                  {avatarPreview || formData.foto ? (
                    <img src={avatarPreview || formData.foto} alt="Foto de Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-[var(--bg-muted)] flex items-center justify-center">
                      <Icon name="User" className="w-16 h-16 text-gray-400 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />

              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Formatos: JPG, PNG, WEBP</p>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Tamaño máximo: 5MB</p>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="mt-4 px-6 py-2 rounded-lg bg-sky-50 text-sky-600 dark:text-[var(--brand-green)] text-sm font-bold hover:bg-sky-100 dark:hover:bg-lime-100 transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? 'Subiendo...' : 'Cambiar Foto'}
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
    </>
  );
}