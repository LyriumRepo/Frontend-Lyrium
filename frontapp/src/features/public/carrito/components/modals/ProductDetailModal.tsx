"use client";

import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShoppingCart,
  Star,
  Loader2,
  Check,
  AlertCircle,
  Leaf,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { money, resolveImg, NO_IMAGE, ApiProduct } from "@/modules/cart/utils";
import { useCarritoStore } from "@/store/carritoStore";
import { useAddToCart } from "@/features/public/product/hooks/useAddToCart";
import TopMedalBadge from '@/components/ui/TopMedalBadge';

const stickerConfig: Record<string, { label: string; class: string }> = {
    oferta: { label: 'Oferta', class: 'bg-red-500' },
    promo: { label: 'Promo', class: 'bg-orange-500' },
    nuevo: { label: 'Nuevo', class: 'bg-green-500' },
    limitado: { label: 'Limitado', class: 'bg-purple-500' },
    liquidacion: { label: 'Liquidación', class: 'bg-red-600' },
    descuento: { label: 'Dto.', class: 'bg-red-500' },
    bestseller: { label: 'Best Seller', class: 'bg-amber-500' },
    envio_gratis: { label: 'Envío Gratis', class: 'bg-teal-500' },
    organic: { label: 'Orgánico', class: 'bg-emerald-600' },
    natural: { label: 'Natural', class: 'bg-green-600' },
    eco: { label: 'Eco', class: 'bg-lime-600' },
    premium: { label: 'Premium', class: 'bg-purple-500' },
    vegan: { label: 'Vegano', class: 'bg-green-700' },
};

interface Props {
  onAdd: (id: number | string) => void;
  onOpenCart: () => void;
  productsCache: ApiProduct[];
}

export default function ProductDetailModal({
  onOpenCart,
  productsCache,
}: Props) {
  const detailOpen = useCarritoStore((s) => s.ui.detailModalOpen);
  const productId = useCarritoStore((s) => s.ui.detailProductId);
  const closeDetailModal = useCarritoStore((s) => s.closeDetailModal);

  const {
    addToCart,
    loading: cartLoading,
    addedToCart,
    error: cartError,
  } = useAddToCart();

  const p =
    productsCache.find((x) => String(x.id) === String(productId)) ?? null;
  const [mainImg, setMainImg] = useState("");

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);
  const zoomStep = (delta: number) =>
    setScale((s) =>
      Math.max(1, Math.min(3, parseFloat((s + delta).toFixed(2)))),
    );

  useEffect(() => {
    if (!detailOpen || !p) return;
    resetZoom();
    setMainImg(resolveImg(p.imagen_url));
  }, [detailOpen, p, resetZoom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetailModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDetailModal]);

  if (!detailOpen) return null;

  const finalPrice = Number(
    p?.precio_final ?? p?.precio_oferta ?? p?.precio ?? 0,
  );
  const basePrice = Number(p?.precio ?? 0);
  const hasOffer = finalPrice > 0 && basePrice > 0 && finalPrice < basePrice;
  const saving = hasOffer ? basePrice - finalPrice : 0;
  const stock = Number(p?.stock ?? 0);
  const outOfStock = p?.estado_stock === "out_of_stock" || stock <= 0;
  const rating = Number(p?.rating_promedio ?? 0);
  const totalR = Number(p?.rating_total ?? 0);
  const images: { url?: string; imagen_url?: string }[] = [];
  const pct = hasOffer
    ? (Number(p?.descuento_pct ?? 0) || Math.round(((basePrice - finalPrice) / basePrice) * 100))
    : 0;

  const handleAdd = () => {
    if (!p || !productId || outOfStock || cartLoading) return; // agregar !p
    addToCart(Number(p.id), 1); // usar p.id en lugar de productId
  };
  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-slate-900/58 dark:bg-black/70 backdrop-blur-[2px]"
        onClick={closeDetailModal}
      />
      <div className="fixed inset-0 z-[85] overflow-y-auto py-4 sm:py-8 px-4">
        <div className="relative max-w-5xl mx-auto bg-white dark:bg-[var(--bg-card)] shadow-2xl overflow-hidden border border-sky-100 dark:border-[var(--border-subtle)] rounded-[22px] flex flex-col max-h-[calc(100vh-32px)]">
          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-sky-50 dark:border-[var(--border-subtle)] px-5 py-3"
            style={{
              background:
                "linear-gradient(90deg, rgba(35,180,254,.10), rgba(132,204,22,.08))",
            }}
          >
            <div className="flex items-center gap-2 text-slate-700 dark:text-[var(--text-primary)]">
              <span className="text-xl">🖼️</span>
              <span className="text-sm font-medium">
                {p?.nombre ?? "Detalle del producto"}
              </span>
            </div>
            <button
              onClick={closeDetailModal}
              className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-[var(--bg-muted)] border border-sky-100 dark:border-[var(--border-subtle)] text-slate-700 dark:text-[var(--text-primary)] hover:bg-white dark:hover:bg-[var(--bg-secondary)] grid place-items-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: imagen + zoom */}
              <div className="p-4 border-b lg:border-b-0 lg:border-r border-sky-50 dark:border-[var(--border-subtle)]">
                <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-[var(--bg-muted)] border border-sky-100 dark:border-[var(--border-subtle)] relative select-none">
                  <div
                    className="relative w-full aspect-square overflow-hidden cursor-zoom-in"
                    onWheel={(e) => {
                      e.preventDefault();
                      zoomStep(e.deltaY < 0 ? 0.12 : -0.12);
                    }}
                    onDoubleClick={resetZoom}
                    onMouseDown={(e) => {
                      if (scale <= 1) return;
                      dragging.current = true;
                      dragStart.current = {
                        x: e.clientX - pos.x,
                        y: e.clientY - pos.y,
                      };
                    }}
                    onMouseMove={(e) => {
                      if (!dragging.current) return;
                      const lim = 220 * scale;
                      setPos({
                        x: Math.max(
                          -lim,
                          Math.min(lim, e.clientX - dragStart.current.x),
                        ),
                        y: Math.max(
                          -lim,
                          Math.min(lim, e.clientY - dragStart.current.y),
                        ),
                      });
                    }}
                    onMouseUp={() => {
                      dragging.current = false;
                    }}
                    onMouseLeave={() => {
                      dragging.current = false;
                    }}
                  >
                    <img
                      src={mainImg || NO_IMAGE}
                      alt={p?.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = NO_IMAGE;
                      }}
                      style={{
                        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                        transformOrigin: "50% 50%",
                        willChange: "transform",
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Store marketplace logo */}
                  {p?.store_logo_marketplace && (
                    <div className="absolute top-3 left-3 z-10 w-18 h-18 rounded-full bg-white shadow-md overflow-hidden flex items-center justify-center">
                      <img
                        src={resolveImg(p.store_logo_marketplace)}
                        alt="Logo tienda"
                        className="w-[80%] h-[80%] object-contain rounded-full"
                      />
                    </div>
                  )}

                  {/* Sticker / tag badge */}
                  {p?.tag && (
                    <div className="absolute top-4 right-0 z-10">
                      <div className={`flex flex-col items-center justify-center text-center leading-tight text-white w-[100px] h-[50px] pl-2 pr-1 rounded-l-full shadow-lg ${stickerConfig[p.tag.toLowerCase()]?.class ?? 'bg-gray-500'}`}>
                        <span className="text-[14px] font-extrabold uppercase tracking-wide line-clamp-2">
                          {pct > 0 && (
                            <span className="text-[17px] font-black mt-0.5">-{pct}% </span>
                          )}
                          {stickerConfig[p.tag.toLowerCase()]?.label ?? p.tag}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Lyrium badge + Zoom controls */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[var(--bg-card)]/85 border border-sky-100 dark:border-[var(--border-subtle)] backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] shadow-sm">
                      <Leaf className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Lyrium
                    </span>
                    {[
                      {
                        icon: <ZoomOut className="w-3.5 h-3.5" />,
                        fn: () => zoomStep(-0.2),
                      },
                      {
                        icon: <ZoomIn className="w-3.5 h-3.5" />,
                        fn: () => zoomStep(0.2),
                      },
                      {
                        icon: <Maximize2 className="w-3.5 h-3.5" />,
                        fn: resetZoom,
                      },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={btn.fn}
                        className="px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-[var(--bg-card)]/90 border border-sky-100 dark:border-[var(--border-subtle)] text-slate-700 dark:text-[var(--text-primary)] hover:bg-white dark:hover:bg-[var(--bg-secondary)] inline-flex items-center gap-1.5 text-xs transition"
                      >
                        {btn.icon}
                      </button>
                    ))}
                  </div>

                  {/* TopMedalBadge */}
                  {p?.id && (
                    <TopMedalBadge entityType="product" entityId={p.id} size="xxl" className="absolute bottom-2 right-2 z-10" />
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-6 gap-2">
                    {images.slice(0, 12).map((img, idx) => {
                      const url = img.url ?? img.imagen_url;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setMainImg(resolveImg(url));
                            resetZoom();
                          }}
                          className="rounded-xl overflow-hidden border border-sky-100 dark:border-[var(--border-subtle)] bg-slate-50 dark:bg-[var(--bg-muted)] hover:bg-white dark:hover:bg-[var(--bg-secondary)] aspect-square"
                        >
                          <img
                            src={resolveImg(url)}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = NO_IMAGE;
                            }}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl text-slate-800 dark:text-[var(--text-primary)] font-semibold">
                      {p?.nombre ?? "—"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                      {p?.categoria_nombre && (
                        <span className="px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)]">
                          Categoría: {p.categoria_nombre}
                        </span>
                      )}
                      {p?.sku && (
                        <span className="px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)]">
                          SKU: {p.sku}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {totalR > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-gradient-to-r from-sky-500/10 to-lime-500/8 dark:from-sky-500/20 dark:to-lime-500/15 border border-sky-200/50 dark:border-sky-800/30">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${rating >= i + 0.75 ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                          />
                        ))}
                        <span className="text-slate-500 dark:text-[var(--text-muted)] ml-1">
                          {rating.toFixed(1)} ({totalR})
                        </span>
                      </span>
                    )}
                    <p
                      className={`mt-2 text-xs ${outOfStock ? "text-rose-500" : "text-slate-400 dark:text-[var(--text-muted)]"}`}
                    >
                      {outOfStock ? "⚠️ Agotado" : `📦 Stock: ${stock}`}
                    </p>
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      {money(finalPrice)}
                    </p>
                    {hasOffer && (
                      <>
                        <p className="text-sm text-slate-400 dark:text-[var(--text-muted)] line-through">
                          {money(basePrice)}
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                          🏷️ Ahorra {money(saving)}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAdd}
                      disabled={outOfStock || cartLoading}
                      className={`px-4 py-3 rounded-2xl inline-flex items-center gap-2 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        addedToCart
                          ? "bg-emerald-500 text-white"
                          : "bg-sky-500 hover:bg-sky-600 dark:hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5"
                      }`}
                    >
                      {cartLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : addedToCart ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      {cartLoading
                        ? "Agregando…"
                        : addedToCart
                          ? "¡Agregado!"
                          : "Añadir"}
                    </button>

                    <button
                      onClick={() => {
                        closeDetailModal();
                        onOpenCart();
                      }}
                      className="px-4 py-3 rounded-2xl border border-sky-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-slate-700 dark:text-[var(--text-primary)] inline-flex items-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition"
                    >
                      🛍️ Ver carrito
                    </button>
                  </div>
                </div>

                {/* Error del carrito */}
                {cartError && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {cartError}
                  </div>
                )}

                {p?.descripcion_larga && String(p.descripcion_larga).trim() && (
                  <div>
                    <p className="text-sm text-slate-700 dark:text-[var(--text-primary)] flex items-center gap-2 mb-1">
                      📄 Detalle
                    </p>
                    <p className="text-sm text-slate-400 dark:text-[var(--text-muted)] leading-relaxed">
                      {p.descripcion_larga}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-sky-50 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] px-5 py-3">
            <p className="text-xs text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-2">
              ℹ️ Tip: miniatura cambia imagen · rueda = zoom · doble click =
              reset
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
