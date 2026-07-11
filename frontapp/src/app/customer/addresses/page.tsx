'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { addressApi, Address } from '@/shared/lib/api/addressRepository';
import { useGeoData } from '@/features/public/checkout/hooks/useGeoData';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function CustomerAddressesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<Address>>({
    etiqueta: undefined,
    destinatario: '',
    pais: 'Perú',
    departamento: '',
    provincia: '',
    distrito: '',
    avenida: '',
    numero: '',
    piso_lote: '',
    referencia: '',
    is_default: false,
  });

  const { provincias, distritos, loadingProvincias, loadingDistritos } = useGeoData(
    formData.departamento || '',
    formData.provincia || '',
  );

  const loadAddresses = useCallback(async () => {
    try {
      setFetching(true);
      const data = await addressApi.list();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadAddresses();
    }
  }, [loading, isAuthenticated, loadAddresses]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      etiqueta: undefined,
      destinatario: '',
      pais: 'Perú',
      departamento: '',
      provincia: '',
      distrito: '',
      avenida: '',
      numero: '',
      piso_lote: '',
      referencia: '',
      is_default: addresses.length === 0,
    });
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      etiqueta: address.etiqueta,
      destinatario: address.destinatario,
      pais: address.pais,
      departamento: address.departamento,
      provincia: address.provincia,
      distrito: address.distrito,
      avenida: address.avenida,
      numero: address.numero,
      piso_lote: address.piso_lote,
      referencia: address.referencia,
      is_default: address.is_default,
    });
    setShowModal(true);
  };

  const deleteAddress = async (id: number) => {
    setConfirmDeleteId(null);
    try {
      await addressApi.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  const setAsDefault = async (id: number) => {
    try {
      await addressApi.setDefault(id);
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
    } catch (err) {
      console.error('Error al establecer como predeterminada:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        etiqueta: formData.etiqueta,
        destinatario: formData.destinatario,
        pais: formData.pais,
        departamento: formData.departamento,
        provincia: formData.provincia,
        distrito: formData.distrito,
        avenida: formData.avenida,
        numero: formData.numero,
        piso_lote: formData.piso_lote,
        referencia: formData.referencia,
        is_default: formData.is_default,
      };
      if (editingAddress) {
        const updated = await addressApi.update(editingAddress.id, payload);
        setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await addressApi.create(payload);
        setAddresses(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const getLabelStyles = (etiqueta: string | undefined) => {
    switch (etiqueta) {
      case 'casa':
        return { icon: 'Home', grad: 'from-sky-500 to-sky-400 dark:from-[var(--icons-green)] dark:to-lime-200', color: 'text-sky-500 dark:text-[var(--icons-green)]', label: 'Casa' };
      case 'trabajo':
        return { icon: 'Building2', grad: 'from-sky-400 to-lime-300 dark:from-[var(--icons-green)] dark:to-lime-200', color: 'text-blue-500 dark:text-[var(--icons-green)]', label: 'Trabajo' };
      case 'otro':
        return { icon: 'MapPin', grad: 'from-lime-300 to-yellow-400 dark:from-[var(--icons-green)] dark:to-lime-200', color: 'text-emerald-500 dark:text-[var(--icons-green)]', label: 'Otro' };
      default:
        return { icon: 'MapPin', grad: 'from-gray-500 to-gray-600 dark:from-[var(--icons-green)] dark:to-lime-200', color: 'text-gray-500 dark:text-[var(--icons-green)]', label: 'Otro' };
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <ModuleHeader
        title="Direcciones de Envío"
        subtitle="Gestiona las ubicaciones donde recibirás tus pedidos"
        icon="MapPin"
      />

      <div className="w-full sm:max-w-xs mx-auto md:mx-0 md:ml-auto">
        <BaseButton
          onClick={openAddModal}
          variant="action"
          leftIcon="Plus"
          size="lg"
          fullWidth
        >
          Agregar Dirección
        </BaseButton>
      </div>

      <div className="p-4 bg-sky-50 dark:bg-[var(--brand-green)]/10 rounded-2xl border border-sky-200 dark:border-[var(--icons-green)]/30 flex items-start gap-3">
        <Icon name="Star" className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)] shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-sky-800 dark:text-[var(--icons-green)]">
          Usa la estrella <Icon name="Star" className="w-3.5 h-3.5 inline fill-current text-sky-500 dark:text-[var(--icons-green)]" /> para marcar tu dirección principal. Solo una dirección puede ser la predeterminada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((address) => {
          const styles = getLabelStyles(address.etiqueta);
          return (
            <div
              key={address.id}
              className={`rounded-[2.5rem] shadow-2xl overflow-hidden group/card hover:-translate-y-2 transition-all duration-500 ${address.is_default ? 'bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-[var(--brand-green)]/40 dark:to-[var(--bg-primary)]/60 ring-2 ring-emerald-300 dark:ring-[var(--icons-green)]/50' : 'bg-white dark:bg-[var(--bg-secondary)]'}`}
            >
              <div className={`h-2 bg-gradient-to-r ${styles.grad}`}></div>
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 bg-sky-50 dark:bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center border border-sky-100 dark:border-[var(--border-subtle)] group-hover/card:scale-110 transition-transform duration-500`}>
                    <Icon name={styles.icon as any} className={`w-7 h-7 ${styles.color}`} />
                  </div>
                  {address.is_default && (
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-sky-500 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white text-[9px] font-black uppercase rounded-full shadow-sm flex items-center gap-1">
                      <Icon name="Star" className="w-3 h-3 fill-current" />
                      Principal
                    </span>
                  )}
                </div>
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">{styles.label}</h3>
                  <div className="space-y-3 p-5 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)]">
                    <div className="flex items-start gap-3">
                      <Icon name="User" className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)] mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">Destinatario</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{address.destinatario}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="MapPin" className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)] mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">Dirección</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] leading-snug">
                          {address.avenida} {address.numero}, {address.distrito}
                        </p>
                        {address.referencia && (
                          <p className="text-xs text-sky-600 dark:text-[var(--icons-green)] font-bold mt-1 italic">Ref: {address.referencia}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openEditModal(address)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] text-xs font-bold hover:bg-sky-50 dark:hover:bg-[var(--bg-hover)] hover:text-sky-600 dark:hover:text-[var(--icons-green)] transition-all"
                  >
                    <Icon name="Pencil" className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setAsDefault(address.id)}
                    title={address.is_default ? 'Dirección principal actual' : 'Establecer como dirección principal'}
                    className={`group w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${address.is_default ? 'bg-sky-100 dark:bg-[var(--brand-green)]/30 text-sky-600 dark:text-[var(--icons-green)] hover:bg-sky-200 dark:hover:bg-[var(--brand-green)]/40 ring-2 ring-sky-400 dark:ring-[var(--icons-green)]/60' : 'bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-500 dark:text-[var(--icons-green)] hover:bg-sky-100 dark:hover:bg-[var(--bg-hover)]'} hover:scale-110 active:scale-95`}
                  >
                    <Icon name="Star" className={`w-5 h-5 transition-all duration-200 group-hover:rotate-12 ${address.is_default ? 'fill-current text-sky-600 dark:text-[var(--icons-green)]' : ''}`} style={address.is_default ? { fill: 'currentColor' } : undefined} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(address.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-all"
                  >
                    <Icon name="Trash2" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={openAddModal}
          className="border-2 border-dashed border-sky-200 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl bg-white/50 dark:bg-[var(--bg-secondary)]/50 hover:bg-sky-50/30 dark:hover:bg-[#1f2f1f]/30 hover:border-sky-400 dark:hover:border-[var(--icons-green)] transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[340px]"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-sky-500 dark:bg-[var(--brand-green)] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-500">
              <Icon name="Plus" className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-sky-900 dark:text-[var(--text-primary)]">Nueva Dirección</h3>
            <p className="text-xs font-bold text-sky-400 dark:text-[var(--icons-green)] max-w-[150px] mx-auto">Registra un nuevo punto de entrega</p>
          </div>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={editingAddress ? 'Editar Dirección' : 'Nueva Dirección'} onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3.5rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green-hover)] dark:to-[var(--brand-green)] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Icon name="MapPin" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">
                      {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h3>
                    <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Configuración de Entrega</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Etiqueta de ubicación</label>
                  <select
                    value={formData.etiqueta || ''}
                    onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value as 'casa' | 'trabajo' | 'otro' | undefined })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="casa">🏠 Casa</option>
                    <option value="trabajo">💼 Trabajo</option>
                    <option value="otro">📍 Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Nombre Destinatario</label>
                  <input
                    type="text"
                    value={formData.destinatario}
                    onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">País</label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Departamento</label>
                  <select
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value, provincia: '', distrito: '' })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Amazonas">Amazonas</option>
                    <option value="Áncash">Áncash</option>
                    <option value="Apurímac">Apurímac</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Ayacucho">Ayacucho</option>
                    <option value="Cajamarca">Cajamarca</option>
                    <option value="Callao">Callao</option>
                    <option value="Cusco">Cusco</option>
                    <option value="Huancavelica">Huancavelica</option>
                    <option value="Huánuco">Huánuco</option>
                    <option value="Ica">Ica</option>
                    <option value="Junín">Junín</option>
                    <option value="La Libertad">La Libertad</option>
                    <option value="Lambayeque">Lambayeque</option>
                    <option value="Lima">Lima</option>
                    <option value="Loreto">Loreto</option>
                    <option value="Madre de Dios">Madre de Dios</option>
                    <option value="Moquegua">Moquegua</option>
                    <option value="Pasco">Pasco</option>
                    <option value="Piura">Piura</option>
                    <option value="Puno">Puno</option>
                    <option value="San Martín">San Martín</option>
                    <option value="Tacna">Tacna</option>
                    <option value="Tumbes">Tumbes</option>
                    <option value="Ucayali">Ucayali</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Ciudad / Provincia</label>
                  <select
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value, distrito: '' })}
                    required
                    disabled={!formData.departamento || loadingProvincias}
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.departamento ? 'Selecciona un departamento primero' : loadingProvincias ? 'Cargando...' : 'Seleccionar...'}
                    </option>
                    {provincias.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Urbanización / Distrito</label>
                  <select
                    value={formData.distrito}
                    onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                    required
                    disabled={!formData.provincia || loadingDistritos}
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.provincia ? 'Selecciona una provincia primero' : loadingDistritos ? 'Cargando...' : 'Seleccionar...'}
                    </option>
                    {distritos.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Av / Calle / Jr</label>
                  <input
                    type="text"
                    value={formData.avenida}
                    onChange={(e) => setFormData({ ...formData, avenida: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Número</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Piso / Lote / Dpto</label>
                  <input
                    type="text"
                    value={formData.piso_lote || ''}
                    onChange={(e) => setFormData({ ...formData, piso_lote: e.target.value })}
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Puntos de referencia</label>
                <textarea
                  value={formData.referencia || ''}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  rows={2}
                  placeholder="Frente al parque, portón verde, etc."
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 resize-none dark:focus:border-[var(--icons-green)]"
                />
              </div>
              <div className="p-6 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-sky-100 dark:border-[var(--border-subtle)]">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default || false}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 accent-sky-500 dark:accent-[var(--icons-green)]"
                  />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] uppercase">
                    Marcar como dirección principal
                  </span>
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[var(--bg-hover)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green-hover)] dark:to-[var(--brand-green)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg"
                >
                  Guardar Dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => deleteAddress(confirmDeleteId!)}
        title="¿Eliminar Dirección?"
        message="Esta ubicación dejará de estar disponible."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
