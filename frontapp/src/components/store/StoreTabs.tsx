'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, SlidersHorizontal, Funnel, ArrowUpDown, Star, ShoppingCart, Eye, Heart, Tag, MapPin, Phone, Mail, Clock, MessageCircle, Shield, CheckCircle, Truck, CreditCard, Instagram, Facebook, Globe, Youtube, MapPinned } from 'lucide-react';
import { Producto, Tienda } from '@/types/public';

type Ordenamiento = 'recientes' | 'precio-asc' | 'precio-desc' | 'nombre' | 'popular';
type FiltroRapido = 'todos' | 'oferta' | 'destacado' | 'bio';

interface StoreTabsProps {
  tienda: Tienda;
  productos: Producto[];
  sucursales?: Sucursal[];
  opiniones?: Opinion[];
  fotos?: string[];
  politicas?: Politicas;
  plan?: 'basico' | 'premium';
}

interface Sucursal {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  horario: string;
}

interface Opinion {
  usuario: string;
  rating: number;
  comentario: string;
  fecha: string;
  utiles: number;
}

interface Politicas {
  envio: string;
  devolucion: string;
  privacidad: string;
}

interface ProductFilters {
  busqueda: string;
  ordenamiento: Ordenamiento;
  filtroRapido: FiltroRapido;
  precioMin?: number;
  precioMax?: number;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500' },
  promo: { label: 'Promo', class: 'bg-orange-500' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
};

const ordenOptions = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', label: 'Nombre A-Z' },
  { value: 'popular', label: 'Más vendidos' },
];

export default function StoreTabs({ tienda, productos, sucursales = [], opiniones = [], fotos = [], politicas, plan = 'basico' }: StoreTabsProps) {
  const [activeTab, setActiveTab] = useState('productos');
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>('recientes');
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>('todos');
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(1000);
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);

  const productosFiltrados = useMemo(() => {
    let result = [...productos];
    if (busqueda) {
      const b = busqueda.toLowerCase();
      result = result.filter(p => p.titulo?.toLowerCase().includes(b) || p.categoria?.toLowerCase().includes(b));
    }
    if (filtroRapido === 'oferta') {
      result = result.filter(p => p.descuento || p.precioOferta || p.tag === 'oferta');
    }
    result = result.filter(p => p.precio >= precioMin && p.precio <= precioMax);
    switch (ordenamiento) {
      case 'precio-asc': result.sort((a, b) => a.precio - b.precio); break;
      case 'precio-desc': result.sort((a, b) => b.precio - a.precio); break;
      case 'nombre': result.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '')); break;
      case 'popular': result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
    }
    return result;
  }, [productos, busqueda, ordenamiento, filtroRapido, precioMin, precioMax]);

  const tabs = [
    { id: 'productos', label: `Productos (${productos.length})` },
    { id: 'sucursales', label: `Sucursales (${sucursales.length})` },
    { id: 'contacto', label: 'Contacto' },
    { id: 'resenas', label: `Reseñas (${opiniones.length}★)` },
    { id: 'acercade', label: 'Acerca de' },
  ];

  return (
    <div className="mt-6">
      {/* FILTROS */}
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-4 mb-6">
        {/* Fila 1 */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, SKU, categoría..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'todos', label: 'Todos', icon: null },
              { value: 'oferta', label: 'Ofertas', icon: <Tag className="w-4 h-4" /> },
              { value: 'destacado', label: 'Destacados', icon: <Star className="w-4 h-4" /> },
              { value: 'bio', label: 'Bio', icon: <span className="text-xs">🌿</span> },
            ].map((f) => (
              <button key={f.value} onClick={() => setFiltroRapido(f.value as FiltroRapido)} className={`px-3 py-2 rounded-lg text-sm font-medium ${filtroRapido === f.value ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-[var(--bg-muted)]'}`}>
                {f.icon && <span className="mr-1">{f.icon}</span>}{f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Funnel className="w-4 h-4 text-gray-500" />
            <select value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value as Ordenamiento)} className="bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm">
              {ordenOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-lg text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4" />Filtros
          </button>
        </div>
        {showFiltrosAvanzados && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{productosFiltrados.length} productos</span>
              <button onClick={() => { setPrecioMin(0); setPrecioMax(1000); }} className="text-sm text-sky-600 hover:underline">Reset</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1"><input type="number" value={precioMin} onChange={(e) => setPrecioMin(Number(e.target.value))} min={0} placeholder="Min" className="w-full px-3 py-2 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm" /></div>
              <span className="text-gray-400">-</span>
              <div className="flex-1"><input type="number" value={precioMax} onChange={(e) => setPrecioMax(Number(e.target.value))} min={0} placeholder="Max" className="w-full px-3 py-2 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm" /></div>
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-[var(--border-subtle)] mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      {activeTab === 'productos' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map(producto => {
            const precioAnterior = producto.precioAnterior ?? producto.precioOferta;
            const tieneDescuento = precioAnterior && precioAnterior > producto.precio;
            const descuento = tieneDescuento ? Math.round((1 - producto.precio / precioAnterior) * 100) : 0;
            const stickerTag = producto.tag?.toLowerCase();
            const sticker = stickerTag && stickerTag in stickerConfig ? stickerConfig[stickerTag] : null;
            return (
              <div key={producto.id} className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative aspect-square bg-gray-100 dark:bg-[var(--bg-muted)]">
                  <Link href={producto.slug ? `/producto/${producto.slug}` : '#'}>
                    <Image src={producto.imagen || '/img/no-image.png'} alt={producto.titulo} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 25vw" />
                  </Link>
                  {descuento > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{descuento}%</span>}
                  {sticker && !descuento && <span className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full ${sticker.class}`}>{sticker.label}</span>}
                  <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button className="bg-white p-2 rounded-full shadow-lg"><Eye className="w-4 h-4" /></button>
                    <button className="bg-sky-500 p-2 rounded-full shadow-lg"><ShoppingCart className="w-4 h-4 text-white" /></button>
                  </div>
                </div>
                <div className="p-3">
                  <Link href={producto.slug ? `/producto/${producto.slug}` : '#'}><h4 className="font-medium text-sm line-clamp-2 mb-2">{producto.titulo}</h4></Link>
                  <div className="flex items-center gap-1 mb-2">{producto.estrellas && producto.estrellas.split('').map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sky-600 font-bold">S/{producto.precio.toFixed(2)}</p>{tieneDescuento && <p className="text-gray-400 text-xs line-through">S/{precioAnterior?.toFixed(2)}</p>}</div>
                  </div>
                  <div className="flex md:hidden mt-2 gap-2">
                    <button className="flex-1 py-1.5 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-lg text-xs">Ver</button>
                    <button className="flex-1 py-1.5 bg-sky-500 text-white rounded-lg text-xs">Añadir</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'sucursales' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sucursales.map((sucursal, idx) => (
            <div key={idx} className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-5">
              <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] mb-3">{sucursal.nombre}</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-sky-500" />{sucursal.direccion}, {sucursal.ciudad}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-sky-500" />{sucursal.telefono}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-500" />{sucursal.horario}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <a href={`https://maps.google.com/?q=${sucursal.direccion}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-sky-500 text-white text-center rounded-lg text-sm font-medium">Ver en Maps</a>
                <a href={`tel:${sucursal.telefono}`} className="flex-1 py-2 bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-primary)] text-center rounded-lg text-sm font-medium">Llamar</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'contacto' && (
        <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-6">
          <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-lg mb-4">Envíanos un mensaje</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre completo *" className="w-full px-4 py-3 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm" />
              <input type="email" placeholder="Correo electrónico *" className="w-full px-4 py-3 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm" />
            </div>
            <input type="tel" placeholder="Teléfono de contacto" className="w-full px-4 py-3 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm" />
            <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm">
              <option>Selecciona un asunto</option><option>Consulta general</option><option>Solicitar cotización</option><option>Seguimiento de pedido</option><option>Reclamo</option><option>Sugerencia</option>
            </select>
            <textarea placeholder="Tu mensaje *" rows={4} className="w-full px-4 py-3 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm resize-none" />
            <button type="submit" className="w-full py-3 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600">Enviar mensaje</button>
          </form>
        </div>
      )}

      {activeTab === 'resenas' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="text-center md:text-left">
                <p className="text-5xl font-black text-gray-900 dark:text-[var(--text-primary)]">{(tienda.valoracion ?? 0).toFixed(1)}</p>
                <div className="flex gap-0.5 my-2 justify-center md:justify-start">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.round(tienda.valoracion ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200'}`} />)}
                </div>
                <p className="text-sm text-gray-500">{tienda.reviews} reseñas</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map(stars => {
                  const count = stars === 5 ? 1 : stars === 4 ? 1 : 0;
                  const percent = stars === 5 ? 50 : stars === 4 ? 50 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-8">{stars} ★</span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-[var(--bg-muted)] rounded-full"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} /></div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Shield className="w-5 h-5 text-blue-500" /><span className="text-xs font-medium text-blue-700 dark:text-blue-400">Reseñas Reales</span></div>
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><MessageCircle className="w-5 h-5 text-green-500" /><span className="text-xs font-medium text-green-700 dark:text-green-400">Respuestas Rápidas</span></div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><CheckCircle className="w-5 h-5 text-purple-500" /><span className="text-xs font-medium text-purple-700 dark:text-purple-400">Vendedor Confiable</span></div>
                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><CreditCard className="w-5 h-5 text-amber-500" /><span className="text-xs font-medium text-amber-700 dark:text-amber-400">Transacciones Seguras</span></div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {opiniones.map((opinion, idx) => (
              <div key={idx} className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-5">
                <div className="flex items-start justify-between mb-2">
                  <div><p className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{opinion.usuario}</p><p className="text-sm text-gray-500">{opinion.fecha}</p></div>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < opinion.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200'}`} />)}</div>
                </div>
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">{opinion.comentario}</p>
                <p className="text-sm text-gray-400 mt-2">Útil ({opinion.utiles})</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'acercade' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-6">
            <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-lg mb-4">Galería de la tienda</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fotos.slice(0, 8).map((foto, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)]">
                  <Image src={foto} alt={`Foto ${idx + 1}`} width={200} height={200} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          {politicas && (
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-6">
              <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-lg mb-4">Información</h3>
              <div className="space-y-4">
                <div><h4 className="font-medium text-gray-800 dark:text-[var(--text-primary)] mb-1">Política de Envío</h4><p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">{politicas.envio}</p></div>
                <div><h4 className="font-medium text-gray-800 dark:text-[var(--text-primary)] mb-1">Política de Devolución</h4><p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">{politicas.devolucion}</p></div>
                <div><h4 className="font-medium text-gray-800 dark:text-[var(--text-primary)] mb-1">Política de Privacidad</h4><p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">{politicas.privacidad}</p></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
