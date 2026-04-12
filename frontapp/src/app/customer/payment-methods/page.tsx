'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface PaymentMethod {
  id: number;
  tipo_metodo: 'tarjeta' | 'yape' | 'plin';
  documento: string;
  titular: string;
  detalle_extra: string;
  is_default: boolean;
}

interface BillingData {
  ruc_dni: string;
  razon_social: string;
  direccion_fiscal: string;
}

const mockMethods: PaymentMethod[] = [
  { id: 1, tipo_metodo: 'tarjeta', documento: '**** **** **** 4242', titular: 'Jeyson Demo', detalle_extra: '12/25', is_default: true },
  { id: 2, tipo_metodo: 'yape', documento: '900 000 123', titular: 'Jeyson Demo', detalle_extra: 'Yape Directo', is_default: false },
];

const mockBilling: BillingData = {
  ruc_dni: '10745678901',
  razon_social: 'Jeyson Demo EIRL',
  direccion_fiscal: 'Av. Principal 123, Lima',
};

export default function CustomerPaymentMethodsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [methods, setMethods] = useState<PaymentMethod[]>(mockMethods);
  const [billingData, setBillingData] = useState<BillingData>(mockBilling);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pagos' | 'facturacion'>('pagos');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    tipo_metodo: undefined,
    documento: '',
    titular: '',
    detalle_extra: '',
    is_default: false,
  });

  const [billingForm, setBillingForm] = useState<BillingData>(mockBilling);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const openAddModal = () => {
    setEditingMethod(null);
    setFormData({
      tipo_metodo: undefined,
      documento: '',
      titular: '',
      detalle_extra: '',
      is_default: methods.length === 0,
    });
    setActiveTab('pagos');
    setShowModal(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      tipo_metodo: method.tipo_metodo as 'tarjeta' | 'yape' | 'plin',
      documento: method.documento,
      titular: method.titular,
      detalle_extra: method.detalle_extra,
      is_default: method.is_default,
    });
    setActiveTab('pagos');
    setShowModal(true);
  };

  const deleteMethod = (id: number) => {
    if (confirm('¿Eliminar Método? Esta tarjeta o cuenta dejará de estar disponible.')) {
      setMethods(methods.filter(m => m.id !== id));
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedMethods = [...methods];
    
    if (formData.is_default) {
      updatedMethods = updatedMethods.map(m => ({ ...m, is_default: false }));
    }
    
    if (editingMethod) {
      updatedMethods = updatedMethods.map(m => 
        m.id === editingMethod.id ? { ...m, ...formData } as PaymentMethod : m
      );
    } else {
      updatedMethods.push({ ...formData, id: Date.now() } as PaymentMethod);
    }
    
    setMethods(updatedMethods);
    setShowModal(false);
  };

  const handleSubmitBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingData(billingForm);
    alert('Datos guardados correctamente');
    setShowModal(false);
  };

  const getMethodStyles = (tipo: string | undefined) => {
    switch (tipo) {
      case 'tarjeta':
        return { icon: 'CreditCard', grad: 'from-sky-500 to-blue-500', color: 'text-sky-500', label: 'Tarjeta de Crédito' };
      case 'yape':
        return { icon: 'Smartphone', grad: 'from-purple-500 to-pink-500', color: 'text-purple-600', label: 'Yape' };
      case 'plin':
        return { icon: 'Circle', grad: 'from-blue-500 to-sky-500', color: 'text-blue-600', label: 'Plin' };
      default:
        return { icon: 'CreditCard', grad: 'from-gray-500 to-gray-600', color: 'text-gray-500 dark:text-gray-400', label: 'Método' };
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
            Métodos de Pago
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
            Gestiona tus datos de facturación de forma segura
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white dark:bg-[var(--bg-secondary)] backdrop-blur-md text-black dark:text-[var(--text-primary)] font-bold text-sm border border-gray-200 dark:border-[var(--border-subtle)] hover:text-sky-500 transition-all"
        >
          <Icon name="Plus" className="w-5 h-5" />
          <span>Agregar Método</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {methods.map((method) => {
          const styles = getMethodStyles(method.tipo_metodo);
          return (
            <div
              key={method.id}
              className={`bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl overflow-hidden group/card hover:-translate-y-2 transition-all duration-500 ${method.is_default ? 'ring-2 ring-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-[var(--bg-card)] dark:to-[var(--bg-muted)]' : ''}`}
            >
              <div className={`h-2 bg-gradient-to-r ${styles.grad}`}></div>
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 bg-sky-50 dark:bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center border border-sky-100 dark:border-[var(--border-subtle)] group-hover/card:scale-110 transition-transform duration-500`}>
                    <Icon name={styles.icon as any} className={`w-7 h-7 ${styles.color}`} />
                  </div>
                  {method.is_default && (
                    <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-sky-500 text-white text-[9px] font-black uppercase rounded-full shadow-sm">
                      Predeterminado
                    </span>
                  )}
                </div>
                <div className="space-y-1 mb-8">
                  <h3 className="text-lg font-black text-gray-800 dark:text-[var(--text-primary)]">{styles.label}</h3>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase">{method.documento}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] mb-8">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">Titular</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-[var(--text-primary)] truncate">{method.titular}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase">{method.tipo_metodo === 'tarjeta' ? 'Expira' : 'Detalle'}</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-[var(--text-primary)]">{method.detalle_extra}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openEditModal(method)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] text-xs font-bold hover:bg-sky-50 dark:hover:bg-[#2A3F33] hover:text-sky-600 transition-all"
                  >
                    <Icon name="Pencil" className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteMethod(method.id)}
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
            <h3 className="text-xl font-black text-sky-900 dark:text-[var(--text-primary)]">Nuevo Método</h3>
            <p className="text-xs font-bold text-sky-400 max-w-[150px] mx-auto">Agrega tarjetas, Yape, Plin o datos fiscales</p>
          </div>
        </button>
      </div>

      <div className="bg-gradient-to-br from-sky-500/10 to-green-500/10 rounded-[2.5rem] shadow-xl p-8">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-sky-500 rounded-[2rem] flex items-center justify-center shrink-0">
            <Icon name="ShieldCheck" className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">Tu seguridad es nuestra prioridad</h4>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              En <span className="text-sky-600 font-black">Lyrium</span>, tus datos financieros están protegidos bajo estándares bancarios. Nunca almacenamos tus códigos de seguridad CVV y toda la información viaja encriptada.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3.5rem] max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Icon name="Wallet" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">{editingMethod ? 'Editar Método' : 'Nuevo Método'}</h3>
                    <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Configuración Segura</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex gap-2 mt-8 bg-black/10 p-1.5 rounded-2xl">
                <button
                  onClick={() => setActiveTab('pagos')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pagos' ? 'bg-white text-sky-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                  <Icon name="CreditCard" className="w-4 h-4 inline mr-2" />
                  Pago
                </button>
                <button
                  onClick={() => setActiveTab('facturacion')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'facturacion' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                  <Icon name="FileText" className="w-4 h-4 inline mr-2" />
                  Facturación
                </button>
              </div>
            </div>

            <div className="p-10 space-y-6 overflow-y-auto max-h-[calc(90vh-280px)]">
              {activeTab === 'pagos' ? (
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Tipo de Método</label>
                      <select
                        value={formData.tipo_metodo || ''}
                        onChange={(e) => setFormData({ ...formData, tipo_metodo: e.target.value as 'tarjeta' | 'yape' | 'plin' | undefined })}
                        required
                        className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="tarjeta">💳 Tarjeta de Crédito/Débito</option>
                        <option value="yape">📲 Yape</option>
                        <option value="plin">💠 Plin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                        {formData.tipo_metodo === 'tarjeta' ? 'Número de Tarjeta' : 'Número de Celular'}
                      </label>
                      <input
                        type="text"
                        value={formData.documento}
                        onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                        required
                        placeholder={formData.tipo_metodo === 'tarjeta' ? '0000 0000 0000 0000' : '900 000 000'}
                        className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Nombre del Titular</label>
                    <input
                      type="text"
                      value={formData.titular}
                      onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
                      required
                      placeholder="Nombre completo"
                      className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                    />
                  </div>

                  {formData.tipo_metodo === 'tarjeta' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Vencimiento (MM/YY)</label>
                      <input
                        type="text"
                        value={formData.detalle_extra}
                        onChange={(e) => setFormData({ ...formData, detalle_extra: e.target.value })}
                        placeholder="00/00"
                        className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  <div className="p-6 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-sky-100 dark:border-[var(--border-subtle)]">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                        className="w-5 h-5 accent-sky-500"
                      />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 dark:text-[var(--text-primary)] uppercase">
                        Establecer como predeterminado
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
                      Guardar Método
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmitBilling} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">RUC / DNI</label>
                      <input
                        type="text"
                        value={billingForm.ruc_dni}
                        onChange={(e) => setBillingForm({ ...billingForm, ruc_dni: e.target.value })}
                        required
                        className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Razón Social</label>
                      <input
                        type="text"
                        value={billingForm.razon_social}
                        onChange={(e) => setBillingForm({ ...billingForm, razon_social: e.target.value })}
                        required
                        className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">Dirección Fiscal</label>
                    <input
                      type="text"
                      value={billingForm.direccion_fiscal}
                      onChange={(e) => setBillingForm({ ...billingForm, direccion_fiscal: e.target.value })}
                      required
                      className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 flex items-start gap-4">
                    <Icon name="Info" className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-emerald-900/70 dark:text-emerald-400">
                      Estos datos se utilizarán para generar tus comprobantes electrónicos automáticamente.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg"
                  >
                    Guardar Datos Fiscales
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
