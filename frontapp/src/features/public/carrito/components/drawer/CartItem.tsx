'use client';

import { X, Minus, Plus } from 'lucide-react';
import { money, resolveImg, NO_IMAGE, ApiCartItem, ApiProduct } from '@/modules/cart/utils';

interface Props {
    item: ApiCartItem;
    product?: ApiProduct;
    isFirst?: boolean;
    onIncrease: (id: number | string) => void;
    onDecrease: (id: number | string) => void;
    onDelete: (id: number | string) => void;
    onView: (productId: number | string) => void;
}

export default function CartItem({ item, product, isFirst = false, onIncrease, onDecrease, onDelete, onView }: Props) {
    const cant = Number(item.cantidad ?? 0);
    const pu = Number(item.precio_unitario ?? 0);
    const lineTotal = cant * pu;
    const imgSrc = resolveImg(item.imagen_url ?? product?.imagen_url);
    const nombre = item.producto_nombre ?? product?.nombre ?? 'Producto';

    if (isFirst) {
        return (
            <div className="relative border border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-sky-50/30 to-white">
                <button
                    onClick={() => onDelete(item.id)}
                    className="absolute right-2 top-2 w-6 h-6 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 grid place-items-center text-xs transition shadow-sm border border-gray-200"
                    title="Eliminar"
                >
                    <X className="w-3 h-3" />
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={() => onView(item.producto_id)}
                        className="w-24 h-24 rounded-xl overflow-hidden bg-white shrink-0 border-2 border-sky-100 shadow-sm"
                    >
                        <img
                            src={imgSrc}
                            alt={nombre}
                            onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE; }}
                            className="w-full h-full object-cover"
                        />
                    </button>

                    <div className="flex-1 min-w-0">
                        <button onClick={() => onView(item.producto_id)} className="text-left w-full">
                            <p className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">{nombre}</p>
                        </button>
                        <p className="text-xs text-gray-500 mt-1">🏪 Vendedor: Lyrium</p>

                        <div className="flex items-center justify-between mt-3">
                            <div className="inline-flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                                <button onClick={() => onDecrease(item.id)} className="w-9 h-9 hover:bg-gray-50 grid place-items-center text-gray-600 transition">
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-12 h-9 grid place-items-center text-sm font-semibold text-gray-800 border-x-2 border-gray-200">{cant}</span>
                                <button onClick={() => onIncrease(item.id)} className="w-9 h-9 hover:bg-gray-50 grid place-items-center text-gray-600 transition">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            <span className="text-lg font-bold text-sky-600">{money(lineTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative border-b border-gray-100 pb-3">
            <button
                onClick={() => onDelete(item.id)}
                className="absolute -left-1 -top-1 w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 grid place-items-center text-xs transition"
                title="Eliminar"
            >
                <X className="w-2.5 h-2.5" />
            </button>

            <div className="flex gap-3 pl-3">
                <button onClick={() => onView(item.producto_id)} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img
                        src={imgSrc}
                        alt={nombre}
                        onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE; }}
                        className="w-full h-full object-cover"
                    />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <button onClick={() => onView(item.producto_id)} className="text-left flex-1">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{nombre}</p>
                        </button>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{money(lineTotal)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Vendedor: Lyrium</p>
                    <div className="mt-2 inline-flex items-center border border-gray-300 rounded overflow-hidden">
                        <button onClick={() => onDecrease(item.id)} className="w-7 h-7 hover:bg-gray-100 grid place-items-center text-gray-600 transition">
                            <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-9 h-7 grid place-items-center text-xs text-gray-800 border-x border-gray-300 bg-gray-50">{cant}</span>
                        <button onClick={() => onIncrease(item.id)} className="w-7 h-7 hover:bg-gray-100 grid place-items-center text-gray-600 transition">
                            <Plus className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
