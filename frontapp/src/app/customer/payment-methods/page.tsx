'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { paymentMethodApi, PaymentMethod } from '@/shared/lib/api/paymentMethodRepository';
import TokenizeNewCardModal from '@/features/customer/payment-methods/TokenizeNewCardModal';

export default function CustomerPaymentMethodsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showTokenizeModal, setShowTokenizeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pagos' | 'facturacion'>('pagos');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [creatingMethod, setCreatingMethod] = useState<'yape' | 'plin' | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    tipo_metodo: undefined,
    documento: '',
    titular: '',
    detalle_extra: '',
    is_default: false,
    ruc_dni: '',
    razon_social: '',
    direccion_fiscal: '',
  });

  const loadMethods = useCallback(async () => {
    try {
      setFetching(true);
      const data = await paymentMethodApi.list();
      setMethods(data);
    } catch {
      setMethods([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadMethods();
    }
  }, [loading, isAuthenticated, loadMethods]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const openAddCardModal = () => {
    setShowTokenizeModal(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      tipo_metodo: method.tipo_metodo,
      documento: method.tipo_metodo === 'tarjeta' ? '' : method.documento,
      titular: method.titular,
      detalle_extra: method.detalle_extra,
      is_default: method.is_default,
      ruc_dni: method.ruc_dni,
      razon_social: method.razon_social,
      direccion_fiscal: method.direccion_fiscal,
    });
    setActiveTab('pagos');
  };

  const deleteMethod = async (id: number) => {
    setConfirmDeleteId(null);
    try {
      await paymentMethodApi.delete(id);
      setMethods(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  const openAddYapePlin = (tipo: 'yape' | 'plin') => {
    setCreatingMethod(tipo);
    setEditingMethod(null);
    setFormData({
      tipo_metodo: tipo,
      documento: '',
      titular: '',
      detalle_extra: '',
      is_default: false,
      ruc_dni: '',
      razon_social: '',
      direccion_fiscal: '',
    });
  };

  const handleSubmitYapePlin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        tipo_metodo: formData.tipo_metodo,
        documento: formData.documento,
        titular: formData.titular,
        detalle_extra: formData.detalle_extra,
        is_default: formData.is_default,
      };
      if (editingMethod) {
        const updated = await paymentMethodApi.update(editingMethod.id, payload);
        setMethods(prev => prev.map(m => m.id === updated.id ? updated : m));
      } else {
        const created = await paymentMethodApi.create(payload);
        setMethods(prev => [...prev, created]);
      }
      setEditingMethod(null);
      setCreatingMethod(null);
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const handleSubmitBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ruc_dni: formData.ruc_dni,
        razon_social: formData.razon_social,
        direccion_fiscal: formData.direccion_fiscal,
      };
      if (editingMethod) {
        const updated = await paymentMethodApi.update(editingMethod.id, payload);
        setMethods(prev => prev.map(m => m.id === updated.id ? updated : m));
      } else {
        const created = await paymentMethodApi.create({
          tipo_metodo: 'tarjeta',
          documento: '-',
          titular: '-',
          ...payload,
        });
        setMethods(prev => [...prev, created]);
      }
      setEditingMethod(null);
    } catch (err) {
      console.error('Error al guardar datos fiscales:', err);
    }
  };

  const getMethodStyles = (tipo: string | undefined, method?: PaymentMethod) => {
    switch (tipo) {
      case 'tarjeta': {
        const brand = method?.card_brand || 'Desconocida';
        return {
          icon: 'CreditCard' as const,
          grad: 'from-sky-500 to-blue-500 dark:from-[var(--icons-green)] dark:to-lime-200',
          color: 'text-sky-500 dark:text-[var(--icons-green)]',
          label: 'Tarjeta de Débito',
          subtitle: method?.card_last4 ? `•••• ${method.card_last4}` : null,
        };
      }
      case 'yape':
        return { icon: 'Phone' as const, grad: 'from-purple-500 to-pink-500', color: 'text-purple-600', label: 'Yape', subtitle: null };
      case 'plin':
        return { icon: 'Wallet' as const, grad: 'from-blue-500 to-sky-500', color: 'text-blue-600', label: 'Plin', subtitle: null };
      default:
        return { icon: 'CreditCard' as const, grad: 'from-gray-500 to-gray-600', color: 'text-gray-500 dark:text-gray-400', label: 'Método', subtitle: null };
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <ModuleHeader
        title="Métodos de Pago"
        subtitle="Gestiona tus datos de facturación de forma segura"
        icon="CreditCard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {methods.map((method) => {
          const styles = getMethodStyles(method.tipo_metodo, method);
          const needsUpdate = method.tipo_metodo === 'tarjeta' && method.token_status === 'needs_update' && !method.card_token;
          return (
            <div
              key={method.id}
              className={`bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl overflow-hidden group/card hover:-translate-y-2 transition-all duration-500 ${method.is_default ? 'bg-gradient-to-br from-white to-sky-50/30 dark:from-[var(--bg-card)] dark:to-[var(--bg-muted)]' : ''}`}
            >
              <div className={`h-2 bg-gradient-to-r ${styles.grad}`} />
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-sky-50 dark:bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center border border-sky-100 dark:border-[var(--border-subtle)] group-hover/card:scale-110 transition-transform duration-500">
                    <Icon name={styles.icon} className={`w-7 h-7 ${styles.color}`} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {method.is_default && (
                      <span className="px-3 py-1 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[var(--brand-green)] dark:via-[var(--icons-green)] dark:to-[var(--brand-green-hover)] text-white text-[9px] font-black uppercase rounded-full shadow-sm">
                        Predeterminado
                      </span>
                    )}
                    {needsUpdate && (
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase rounded-full">
                        Requiere actualización
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1 mb-8">
                  <h3 className="text-lg font-black text-gray-800 dark:text-[var(--text-primary)]">{styles.label}</h3>
                  {styles.subtitle ? (
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-400">{styles.subtitle}</p>
                  ) : method.tipo_metodo !== 'tarjeta' ? (
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase">{method.documento}</p>
                  ) : method.card_brand ? (
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-400">{method.card_brand} • Débito</p>
                  ) : (
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-400">Débito</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] mb-8">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">Titular</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-[var(--text-primary)] truncate">{method.titular}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">
                      {method.tipo_metodo === 'tarjeta' ? 'Expira' : 'Detalle'}
                    </p>
                    <p className="text-xs font-bold text-gray-700 dark:text-[var(--text-primary)]">
                      {method.tipo_metodo === 'tarjeta'
                        ? (method.card_exp_month && method.card_exp_year
                          ? `${method.card_exp_month}/${method.card_exp_year.slice(-2)}`
                          : 'Débito')
                        : (method.detalle_extra || '--')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {method.tipo_metodo === 'tarjeta' ? (
                    <button
                      onClick={openAddCardModal}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-50 dark:bg-[#1f2f1f] text-sky-600 dark:text-[var(--icons-green)] text-xs font-bold hover:bg-sky-100 dark:hover:bg-[#2A3F33] transition-all"
                    >
                      <Icon name="RefreshCw" className="w-4 h-4" />
                      Actualizar
                    </button>
                  ) : (
                    <button
                      onClick={() => openEditModal(method)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] text-xs font-bold hover:bg-sky-50 dark:hover:bg-[#2A3F33] hover:text-sky-600 dark:hover:text-[var(--icons-green)] transition-all"
                    >
                      <Icon name="Pencil" className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(method.id)}
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
          onClick={openAddCardModal}
          className="border-2 border-dashed border-sky-200 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl bg-white/50 dark:bg-[var(--bg-secondary)]/50 hover:bg-sky-50/30 dark:hover:bg-[#1f2f1f]/30 hover:border-sky-400 dark:hover:border-[var(--icons-green)] transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[340px]"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-sky-500 dark:bg-[var(--icons-green)] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-500">
              <Icon name="Plus" className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-sky-900 dark:text-[var(--text-primary)]">Nueva Tarjeta</h3>
            <p className="text-xs font-bold text-sky-400 dark:text-[var(--icons-green)] max-w-[180px] mx-auto">
              Agrega una tarjeta de forma segura con tokenización
            </p>
          </div>
        </button>

        <button
          onClick={() => openAddYapePlin('yape')}
          className="border-2 border-dashed border-purple-200 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl bg-white/50 dark:bg-[var(--bg-secondary)]/50 hover:bg-purple-50/30 dark:hover:bg-[#1f2f1f]/30 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[340px]"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-500">
              <Icon name="Phone" className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-purple-900 dark:text-[var(--text-primary)]">Nuevo Yape</h3>
            <p className="text-xs font-bold text-purple-500 dark:text-purple-400 max-w-[180px] mx-auto">
              Registra tu número de Yape para recibir pagos
            </p>
          </div>
        </button>

        <button
          onClick={() => openAddYapePlin('plin')}
          className="border-2 border-dashed border-blue-200 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl bg-white/50 dark:bg-[var(--bg-secondary)]/50 hover:bg-blue-50/30 dark:hover:bg-[#1f2f1f]/30 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[340px]"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-500">
              <Icon name="Wallet" className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-blue-900 dark:text-[var(--text-primary)]">Nuevo Plin</h3>
            <p className="text-xs font-bold text-blue-500 dark:text-blue-400 max-w-[180px] mx-auto">
              Registra tu número de Plin para recibir pagos
            </p>
          </div>
        </button>
      </div>

      <div className="bg-gradient-to-br from-sky-500/30 to-green-500/10 dark:from-[var(--brand-green)]/40 dark:via-[var(--icons-green)]/50 dark:to-[var(--brand-green-hover)]/40 rounded-[2.5rem] shadow-xl p-8">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[var(--brand-green)] dark:via-[var(--icons-green)] dark:to-[var(--brand-green-hover)] rounded-[2rem] flex items-center justify-center shrink-0">
            <Icon name="ShieldCheck" className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">
              Tu seguridad es nuestra prioridad
            </h4>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-300 leading-relaxed max-w-2xl">
              En <span className="text-sky-600 dark:text-[var(--icons-green)] font-black">Lyrium</span>, ya no almacenamos números de tarjeta. Usamos tokenización con Izipay — tus datos viajan directamente al procesador sin pasar por nuestros servidores.
            </p>
          </div>
        </div>
      </div>

      {showTokenizeModal && (
        <TokenizeNewCardModal
          onClose={() => setShowTokenizeModal(false)}
          onSuccess={() => {
            setShowTokenizeModal(false);
            loadMethods();
          }}
        />
      )}

      {(editingMethod && editingMethod.tipo_metodo !== 'tarjeta' || creatingMethod) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => { setEditingMethod(null); setCreatingMethod(null); }}>
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3.5rem] max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Icon name="Wallet" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">
                      {editingMethod
                        ? `Editar ${editingMethod.tipo_metodo === 'yape' ? 'Yape' : 'Plin'}`
                        : `Nuevo ${creatingMethod === 'yape' ? 'Yape' : 'Plin'}`}
                    </h3>
                    <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Configuración</p>
                  </div>
                </div>
                <button onClick={() => { setEditingMethod(null); setCreatingMethod(null); }} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-10 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={handleSubmitYapePlin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Número de Celular</label>
                  <input
                    type="text"
                    value={formData.documento || ''}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    required
                    placeholder="900 000 000"
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Nombre del Titular</label>
                  <input
                    type="text"
                    value={formData.titular || ''}
                    onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
                    required
                    placeholder="Nombre completo"
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
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
                    <span className="text-xs font-bold text-gray-600 dark:text-[var(--text-primary)] uppercase">
                      Establecer como predeterminado
                    </span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setEditingMethod(null); setCreatingMethod(null); }}
                    className="flex-1 px-8 py-4 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2rem] p-8 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CreditCard" className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="text-lg font-black text-center text-gray-800 dark:text-[var(--text-primary)] mb-2">¿Eliminar Método?</h3>
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] text-center mb-6">Esta tarjeta o cuenta dejará de estar disponible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all">Cancelar</button>
              <button onClick={() => deleteMethod(confirmDeleteId)} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
