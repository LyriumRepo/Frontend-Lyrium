import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Producto } from '@/types/public';

interface ProductCardProps {
  producto: Producto;
  minWidth?: string;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500' },
  promo: { label: 'Promo', class: 'bg-orange-500' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
};

export default function ProductCard({ producto, minWidth }: ProductCardProps) {
  const precioAnterior = producto.precioAnterior ?? producto.precioOferta;
  const tieneDescuento = !!producto.descuento || (!!precioAnterior && precioAnterior > producto.precio);
  const descuentoPorcentaje = producto.descuento ?? (precioAnterior ? Math.round((1 - producto.precio / precioAnterior) * 100) : 0);
  
  const stickerTag = producto.tag ? producto.tag.toLowerCase() : null;
  const sticker = stickerTag && stickerTag in stickerConfig ? stickerConfig[stickerTag] : null;

  return (
    <Link
      href={producto.slug ? `/producto/${producto.slug}` : producto.enlace ?? '#'}
      className="block bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
      style={minWidth ? { minWidth } : undefined}
      aria-label={`Ver detalles de ${producto.titulo}`}
    >
      <div className="relative h-48 bg-gray-100 dark:bg-[var(--bg-muted)]">
        <Image
          src={producto.imagen || '/img/no-image.png'}
          alt={producto.titulo}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {descuentoPorcentaje > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full" aria-label={`Descuento de ${descuentoPorcentaje}%`}>
            -{descuentoPorcentaje}%
          </span>
        )}
        {sticker && !descuentoPorcentaje && (
          <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded-full ${sticker.class}`}>
            {sticker.label}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2 line-clamp-2">
          {producto.titulo}
        </h3>
        <div className="flex items-center gap-1 mb-2" role="img" aria-label="Calificación">
          {producto.estrellas &&
            producto.estrellas.split('').map((estrella, idx) => (
              <Star
                key={`${estrella}-${idx}`}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                aria-hidden="true"
              />
            ))}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sky-600 dark:text-[var(--color-success)] font-bold text-lg">
            S/{producto.precio.toFixed(2)}
          </p>
          {precioAnterior && precioAnterior > producto.precio && (
            <p className="text-gray-400 dark:text-gray-500 text-sm line-through">
              S/{precioAnterior.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
