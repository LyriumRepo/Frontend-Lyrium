'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Truck, Clock, ShieldCheck, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import BaseModal from '@/components/ui/BaseModal';
import { Producto } from '@/types/public';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
  onAddToCart?: (producto: Producto, cantidad: number) => void;
  onAddToWishlist?: (producto: Producto) => void;
}

interface TiendaInfo {
  nombre: string;
  logo?: string;
  slug: string;
  valoracion: number;
  reviews: number;
}

interface QuickViewProps extends QuickViewModalProps {
  tienda?: TiendaInfo;
}

const defaultTienda: TiendaInfo = {
  nombre: 'Tienda',
  slug: 'tienda',
  valoracion: 4.5,
  reviews: 0,
};

export default function QuickViewModal({ 
  isOpen, 
  onClose, 
  producto, 
  onAddToCart,
  onAddToWishlist,
  tienda = defaultTienda 
}: QuickViewProps) {
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState(0);
  
  const imagenes = producto?.imagen ? [producto.imagen] : [];
  
  const precioAnterior = producto?.precioAnterior ?? producto?.precioOferta;
  const tieneDescuento = precioAnterior && precioAnterior > (producto?.precio ?? 0);

  const handleCantidadChange = (delta: number) => {
    setCantidad(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleAddToCart = () => {
    if (producto && onAddToCart) {
      onAddToCart(producto, cantidad);
      onClose();
    }
  };

  const handleAddToWishlist = () => {
    if (producto && onAddToWishlist) {
      onAddToWishlist(producto);
    }
  };

  const renderEstrellas = (rating?: string) => {
    if (!rating) return null;
    const stars = rating.split('');
    return stars.map((s, i) => (
      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
    ));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={producto?.titulo}
      size="2xl"
      showCloseButton
    >
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        {/* Columna izquierda: Galería */}
        <div className="flex flex-col gap-3">
          {/* Imagen principal */}
          <div className="relative aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] rounded-xl overflow-hidden flex items-center justify-center">
            {imagenes.length > 1 && (
              <>
                <button 
                  onClick={() => setImagenActual(prev => (prev - 1 + imagenes.length) % imagenes.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-all z-5"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <button 
                  onClick={() => setImagenActual(prev => (prev + 1) % imagenes.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-all z-5"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </>
            )}
            {producto?.imagen ? (
              <Image
                src={producto.imagen || '/img/no-image.png'}
                alt={producto.titulo}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <Image src="/img/no-image.png" alt="Sin imagen" fill className="object-contain" />
            )}
          </div>
          
          {/* Miniaturas */}
          {imagenes.length > 1 && (
            <div className="flex gap-2 justify-center">
              {imagenes.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImagenActual(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === imagenActual 
                      ? 'border-sky-500 dark:border-[var(--brand-sky)]' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-[var(--border-subtle)]'
                  }`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Columna derecha: Info */}
        <div className="flex flex-col">
          {/* Categoría */}
          {producto?.categoria && (
            <span className="text-sm text-sky-600 dark:text-[var(--brand-sky)] mb-1">
              {producto.categoria}
            </span>
          )}
          
          {/* Rating y código */}
          <div className="flex items-center gap-3 mb-3 text-sm flex-wrap">
            <div className="flex items-center gap-0.5">
              {renderEstrellas(producto?.estrellas)}
            </div>
            {producto?.reviews && (
              <span className="text-gray-500 dark:text-gray-400">
                {producto.reviews} valoraciones
              </span>
            )}
          </div>
          
          {/* Precio y stock */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-800 dark:text-[var(--text-primary)]">
                S/{producto?.precio.toFixed(2)}
              </span>
              {tieneDescuento && (
                <span className="text-sm text-gray-400 line-through">
                  S/{precioAnterior?.toFixed(2)}
                </span>
              )}
            </div>
            {producto?.stock !== undefined && producto.stock > 0 && (
              <span className="text-sm font-medium text-green-500 dark:text-[var(--color-success)]">
                En stock ({producto.stock})
              </span>
            )}
          </div>
          
          {/* Descripción */}
          {producto?.descripcion && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              {producto.descripcion}
            </p>
          )}
          
          {/* Cantidad y botón añadir */}
          <div className="flex gap-3 mb-4">
            {/* Contador */}
            <div className="inline-flex items-center border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg h-10 bg-white dark:bg-[var(--bg-card)]">
              <button 
                onClick={() => handleCantidadChange(-1)}
                className="w-9 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input 
                type="number" 
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                className="w-10 h-full border-x border-gray-200 dark:border-[var(--border-subtle)] text-center text-sm font-medium text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-card)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={1}
                max={99}
              />
              <button 
                onClick={() => handleCantidadChange(1)}
                className="w-9 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            {/* Botón carrito */}
            <button 
              onClick={handleAddToCart}
              className="flex-1 h-10 px-5 bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-sky)] dark:hover:bg-sky-600 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Añadir a la cesta
            </button>
          </div>
          
          {/* Acciones secundarias */}
          <div className="flex gap-5 mb-4 pb-4 border-b border-gray-100 dark:border-[var(--border-subtle)]">
            <button 
              onClick={handleAddToWishlist}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Añadir a favoritos
            </button>
          </div>
          
          {/* Info de la tienda */}
          <Link 
            href={`/tienda/${tienda.slug}`}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-lg mb-4 hover:bg-gray-100 dark:hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center overflow-hidden">
              {tienda.logo ? (
                <Image src={tienda.logo || '/img/no-image.png'} alt={tienda.nombre} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <span className="text-white font-bold">{tienda.nombre.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <span className="block text-xs text-gray-400">Vendido por:</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                {tienda.nombre}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {tienda.valoracion.toFixed(1)} ({tienda.reviews})
              </span>
            </div>
          </Link>
          
          {/* Beneficios */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Truck className="w-4 h-4 text-green-500" />
              <span>Envío gratis en pedidos mayores a S/50</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 text-green-500" />
              <span>Entrega en 3-5 días laborables</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Garantía de devolución de dinero</span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
