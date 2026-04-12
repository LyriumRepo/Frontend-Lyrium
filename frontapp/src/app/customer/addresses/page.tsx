'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface Address {
  id: number;
  etiqueta: 'casa' | 'trabajo' | 'otro';
  destinatario: string;
  telefono: string;
  pais: string;
  departamento: string;
  provincia: string;
  distrito: string;
  avenida: string;
  numero: string;
  pisoLote: string;
  referencia: string;
  is_default: boolean;
}

const mockAddresses: Address[] = [
  {
    id: 1,
    etiqueta: 'casa',
    destinatario: 'Jeyson Demo',
    telefono: '+51 900 000 123',
    pais: 'Perú',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Miraflores',
    avenida: 'Av. Larco',
    numero: '123',
    pisoLote: 'Dpto 501',
    referencia: 'Frente al parque central',
    is_default: true,
  },
  {
    id: 2,
    etiqueta: 'trabajo',
    destinatario: 'Jeyson Demo',
    telefono: '+51 900 000 456',
    pais: 'Perú',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'San Isidro',
    avenida: 'Av. Javier Prado',
    numero: '456',
    pisoLote: 'Piso 10',
    referencia: 'Edificio Torre Azul',
    is_default: false,
  },
];

export default function CustomerAddressesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [formData, setFormData] = useState<Partial<Address>>({
    etiqueta: undefined,
    destinatario: '',
    telefono: '',
    pais: 'Perú',
    departamento: '',
    provincia: '',
    distrito: '',
    avenida: '',
    numero: '',
    pisoLote: '',
    referencia: '',
    is_default: false,
  });

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
      telefono: '',
      pais: 'Perú',
      departamento: '',
      provincia: '',
      distrito: '',
      avenida: '',
      numero: '',
      pisoLote: '',
      referencia: '',
      is_default: addresses.length === 0,
    });
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({ ...address });
    setShowModal(true);
  };

  const deleteAddress = (id: number) => {
    if (confirm('¿Eliminar Dirección? Esta ubicación deje de estar disponible.')) {
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  const setAsDefault = (id: number) => {
    setAddresses(addresses.map(a => ({
      ...a,
      is_default: a.id === id,
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedAddresses = [...addresses];
    
    if (formData.is_default) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, is_default: false }));
    }
    
    if (editingAddress) {
      updatedAddresses = updatedAddresses.map(a => 
        a.id === editingAddress.id ? { ...a, ...formData } as Address : a
      );
    } else {
      updatedAddresses.push({ ...formData, id: Date.now() } as Address);
    }
    
    setAddresses(updatedAddresses);
    setShowModal(false);
  };

  const getLabelStyles = (etiqueta: string | undefined) => {
    switch (etiqueta) {
      case 'casa':
        return { icon: 'Home', grad: 'from-sky-500 to-[#11B4FC]', color: 'text-sky-500', label: 'Casa' };
      case 'trabajo':
        return { icon: 'Building2', grad: 'from-[#11B4FC] to-[#95EA64]', color: 'text-blue-500', label: 'Trabajo' };
      case 'otro':
        return { icon: 'MapPin', grad: 'from-[#95EA64] to-[#F1C40F]', color: 'text-emerald-500', label: 'Otro' };
      default:
        return { icon: 'MapPin', grad: 'from-gray-500 to-gray-600', color: 'text-gray-500 dark:text-gray-400', label: 'Otro' };
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Direcciones de Envío
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
            Gestiona tus direcciones de entrega
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white dark:bg-[var(--bg-secondary)] backdrop-blur-md text-black dark:text-[var(--text-primary)] font-bold text-sm border border-gray-200 dark:border-[var(--border-subtle)] hover:text-sky-500 transition-all"
        >
          <Icon name="Plus" className="w-5 h-5" />
          <span>Agregar Dirección</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((address) => {
          const styles = getLabelStyles(address.etiqueta);
          return (
            <div
              key={address.id}
              className={`bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden group/card hover:-translate-y-2 transition-all duration-500 ${address.is_default ? 'ring-2 ring-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-[var(--bg-secondary)] dark:to-[var(--bg-muted)]' : ''}`}
            >
              <div className={`h-2 bg-gradient-to-r ${styles.grad}`}></div>
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 bg-sky-50 dark:bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center border border-sky-100 dark:border-[var(--border-subtle)] group-hover/card:scale-110 transition-transform duration-500`}>
                    <Icon name={styles.icon as any} className={`w-7 h-7 ${styles.color}`} />
                  </div>
                  {address.is_default && (
                    <span className="px-3 py-1 bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-600 dark:text-[#6BAF7B] text-[9px] font-black uppercase rounded-full border border-sky-100 dark:border-[var(--border-subtle)]">
                      Predeterminada
                    </span>
                  )}
                </div>
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">{styles.label}</h3>
                  <div className="space-y-3 p-5 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)]">
                    <div className="flex items-start gap-3">
                      <Icon name="User" className="w-5 h-5 text-sky-500 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">Destinatario</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{address.destinatario}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Phone" className="w-5 h-5 text-sky-500 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">Teléfono</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{address.telefono}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="MapPin" className="w-5 h-5 text-sky-500 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">Dirección</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] leading-snug">
                          {address.avenida} {address.numero}, {address.distrito}
                        </p>
                        {address.referencia && (
                          <p className="text-xs text-sky-600 font-bold mt-1 italic">Ref: {address.referencia}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openEditModal(address)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] text-xs font-bold hover:bg-sky-50 dark:hover:bg-[#2A3F33] hover:text-sky-600 transition-all"
                  >
                    <Icon name="Pencil" className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setAsDefault(address.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-500 hover:bg-sky-100 dark:hover:bg-[#2A3F33] transition-all"
                  >
                    <Icon name="Star" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteAddress(address.id)}
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
          className="border-2 border-dashed border-sky-200 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl bg-white/50 dark:bg-[var(--bg-secondary)]/50 hover:bg-sky-50/30 dark:hover:bg-[#182420]/30 hover:border-sky-400 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[340px]"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-500">
              <Icon name="Plus" className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-sky-900 dark:text-[var(--text-primary)]">Nueva Dirección</h3>
            <p className="text-xs font-bold text-sky-400 max-w-[150px] mx-auto">Registra un nuevo punto de entrega</p>
          </div>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3.5rem] max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 p-8 text-white relative">
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

            <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Etiqueta de ubicación</label>
                  <select
                    value={formData.etiqueta || ''}
                    onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value as 'casa' | 'trabajo' | 'otro' | undefined })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
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
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Teléfono de contacto</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">País</label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Departamento</label>
                  <select
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Lima">Lima</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Cusco">Cusco</option>
                    <option value="La Libertad">La Libertad</option>
                    <option value="Piura">Piura</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Ciudad / Provincia</label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Urbanización / Distrito</label>
                  <input
                    type="text"
                    value={formData.distrito}
                    onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
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
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Número</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Piso / Lote / Dpto</label>
                  <input
                    type="text"
                    value={formData.pisoLote}
                    onChange={(e) => setFormData({ ...formData, pisoLote: e.target.value })}
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Puntos de referencia</label>
                <textarea
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  rows={2}
                  placeholder="Frente al parque, portón verde, etc."
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 resize-none"
                />
              </div>
              <div className="p-6 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-sky-100 dark:border-[var(--border-subtle)]">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 accent-sky-500"
                  />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] uppercase">
                    Establecer como dirección principal
                  </span>
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg"
                >
                  Guardar Dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
