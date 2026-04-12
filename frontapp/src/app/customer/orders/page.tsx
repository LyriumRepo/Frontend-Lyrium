'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface Order {
  id: string;
  fecha: string;
  establecimiento: string;
  detalle: string;
  total: string;
  estado: 'pendiente' | 'confirmado' | 'en_camino' | 'completado' | 'cancelado';
  estadoLabel: string;
  tipo: 'productos' | 'servicios';
}

const mockOrders: Order[] = [
  { id: '#PED-2024-001', fecha: '15 Feb 2024', establecimiento: 'Vida Natural Perú', detalle: '3 productos', total: 'S/ 125.50', estado: 'completado', estadoLabel: 'Entregado', tipo: 'productos' },
  { id: '#PED-2024-002', fecha: '14 Feb 2024', establecimiento: 'Tech Store Lima', detalle: '1 producto', total: 'S/ 450.00', estado: 'en_camino', estadoLabel: 'Enviado', tipo: 'productos' },
  { id: '#PED-2024-003', fecha: '10 Feb 2024', establecimiento: 'Moda & Estilo', detalle: '5 productos', total: 'S/ 280.00', estado: 'en_camino', estadoLabel: 'Procesando', tipo: 'productos' },
  { id: '#SRV-2024-001', fecha: '16 Feb 2024', establecimiento: 'Clínica Dental Pro', detalle: 'Limpieza Dental Profunda', total: 'S/ 180.00', estado: 'confirmado', estadoLabel: 'Confirmado', tipo: 'servicios' },
  { id: '#SRV-2024-002', fecha: '12 Feb 2024', establecimiento: 'Centro Estético Lyra', detalle: 'Masaje Relajante (60 min)', total: 'S/ 120.00', estado: 'completado', estadoLabel: 'Realizado', tipo: 'servicios' },
  { id: '#SRV-2024-003', fecha: '08 Feb 2024', establecimiento: 'Clínica Dental Pro', detalle: 'Consulta Odontológica', total: 'S/ 50.00', estado: 'cancelado', estadoLabel: 'Cancelado', tipo: 'servicios' },
];

const getStatusStyles = (estado: string) => {
  switch (estado) {
    case 'completado':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: 'CheckCircle' };
    case 'en_camino':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'Truck' };
    case 'confirmado':
      return { bg: 'bg-sky-100', text: 'text-sky-700', icon: 'CalendarCheck' };
    case 'pendiente':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'Clock' };
    case 'cancelado':
      return { bg: 'bg-red-100', text: 'text-red-700', icon: 'XCircle' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700 dark:text-[var(--text-primary)]', icon: 'Clock' };
  }
};

export default function CustomerOrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState({
    categoria: 'todos',
    empresa: '',
    fechaInicio: '',
    fechaFin: '',
    estado: '',
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const applyFilters = () => {
    let result = [...orders];
    
    if (filters.categoria !== 'todos') {
      result = result.filter(o => o.tipo === filters.categoria);
    }
    
    if (filters.empresa) {
      result = result.filter(o => o.establecimiento.toLowerCase().includes(filters.empresa.toLowerCase()));
    }
    
    if (filters.estado) {
      result = result.filter(o => o.estado === filters.estado);
    }
    
    setFilteredOrders(result);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedOrder(null), 300);
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
          Historial de Pedidos
        </h1>
        <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
          Revisa todos tus pedidos realizados en Lyrium
        </p>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="Search" className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">Filtros de Búsqueda</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
            <select
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="productos">Productos</option>
              <option value="servicios">Servicios</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">Establecimiento</label>
            <select
              value={filters.empresa}
              onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="Vida Natural Perú">Vida Natural Perú</option>
              <option value="Tech Store Lima">Tech Store Lima</option>
              <option value="Clínica Dental Pro">Clínica Dental Pro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">Desde</label>
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">Hasta</label>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest ml-1">Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all duration-300 cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado / Pagado</option>
              <option value="en_camino">En camino / En proceso</option>
              <option value="completado">Entregado / Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-sm hover:from-sky-600 hover:to-sky-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Icon name="Search" className="w-5 h-5" />
            <span>Aplicar Filtros</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-300 p-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="flex items-center gap-5 text-white relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Icon name="Package" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter leading-none">Mis Pedidos</h3>
              <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1">Historial Completo</p>
            </div>
          </div>
          <div className="relative z-10">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
              {filteredOrders.length} Pedidos
            </span>
          </div>
        </div>

        <div className="p-8 overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package" className="w-12 h-12 text-gray-400 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)] mb-2">No se encontraron registros</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-[var(--text-muted)]">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
                  <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">ID Pedido</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Fecha</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Tienda</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Detalle</th>
                  <th className="text-right py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="text-center py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="text-center py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusStyles = getStatusStyles(order.estado);
                  return (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-black text-sky-600">{order.id}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-700 dark:text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                        {order.fecha}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-800 dark:text-[var(--text-primary)]">
                        {order.establecimiento}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-600 dark:text-gray-300 dark:text-[var(--text-muted)]">
                        {order.detalle}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-[var(--text-primary)]">
                        {order.total}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text} text-[10px] font-black uppercase tracking-wider`}>
                          <Icon name={statusStyles.icon as any} className="w-3 h-3" />
                          {order.estadoLabel}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => openDetails(order)}
                          className="px-4 py-2 rounded-lg bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-600 dark:text-[#6BAF7B] text-[10px] font-black uppercase tracking-widest hover:bg-sky-100 dark:hover:bg-[#2A3F33] transition-colors"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex justify-end p-4 lg:p-6 animate-fadeIn" onClick={closeModal}>
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] w-full lg:w-[500px] h-full rounded-[2.5rem] shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col transition-all duration-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-300 p-6 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                    <Icon name="Receipt" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter leading-none">Detalles del Pedido</h3>
                    <p className="text-[9px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1">Información detallada</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all">
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-5 overflow-y-auto max-h-[calc(100vh-120px)]">
              <div className="p-8 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-[2.5rem] border border-sky-100/50 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-white dark:bg-[var(--bg-secondary)] rounded-[1.5rem] flex items-center justify-center shadow-lg border border-sky-50">
                  <Icon name="Store" className="w-10 h-10 text-sky-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Establecimiento</p>
                  <h4 className="text-2xl font-black text-gray-800 dark:text-[var(--text-primary)] tracking-tighter">{selectedOrder.establecimiento}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Verificado por Lyrium</span>
                  </div>
                </div>
                <div className={`px-5 py-2.5 rounded-2xl text-white ${
                  selectedOrder.estado === 'completado' ? 'bg-gradient-to-r from-green-400 to-sky-500' :
                  selectedOrder.estado === 'cancelado' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  selectedOrder.estado === 'en_camino' ? 'bg-gradient-to-r from-sky-500 to-sky-600' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">Estado</p>
                  <p className="text-xs font-black uppercase tracking-tighter">{selectedOrder.estadoLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] dark:border-[var(--border-subtle)] flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center shadow-sm text-sky-500 border border-gray-100 dark:border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
                    <Icon name="Calendar" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-0.5">Fecha de Emisión</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] dark:text-[var(--text-primary)]">{selectedOrder.fecha}</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] dark:border-[var(--border-subtle)] flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center shadow-sm text-sky-500 border border-gray-100 dark:border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
                    <Icon name="FileText" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-0.5">ID de Transacción</p>
                    <p className="text-sm font-black text-sky-600">{selectedOrder.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h5 className="text-xs font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Resumen de Pago</h5>
                  <div className="h-px flex-1 mx-4 bg-gray-100 dark:bg-[var(--border-subtle)]"></div>
                </div>
                <div className="p-8 bg-white dark:bg-[var(--bg-secondary)] rounded-[3rem] border border-gray-100 dark:border-[var(--border-subtle)] dark:border-[var(--border-subtle)] shadow-xl space-y-5">
                  <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-sky-50 dark:bg-[var(--bg-muted)] rounded-xl flex items-center justify-center text-sky-500">
                        <Icon name="Package" className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{selectedOrder.detalle}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider">Subtotal Bruto</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-700 dark:text-[var(--text-primary)] dark:text-[var(--text-primary)]">{selectedOrder.total}</span>
                  </div>

                  <div className="pt-6 border-t border-dashed border-gray-200 dark:border-[var(--border-subtle)]">
                    <div className="bg-gradient-to-br from-slate-900 to-gray-900 p-8 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl">
                      <div>
                        <p className="text-[10px] font-bold text-sky-300 uppercase tracking-[0.3em] mb-1">Monto Total Final</p>
                        <h6 className="text-4xl font-black tracking-tighter">{selectedOrder.total}</h6>
                      </div>
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/20">
                        <Icon name="CheckCircle" className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={closeModal}
                  className="py-5 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-300 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all"
                >
                  Cerrar Ventana
                </button>
                <button className="py-5 rounded-2xl bg-gradient-to-r from-green-400 to-sky-500 text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-sky-200 transition-all flex items-center justify-center gap-3">
                  <Icon name="Upload" className="w-5 h-5" />
                  Descargar Comprobante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
