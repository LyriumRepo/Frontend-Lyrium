"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Store,
  Package,
  Weight,
  Ruler,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  RotateCcw,
  BadgeCheck,
  Tag,
  Phone,
  Mail,
} from "lucide-react";
import type { LaravelProduct } from "@/features/public/product/types";
import { useAddToCart } from "@/features/public/product/hooks/useAddToCart";
import { useWishlist } from "@/shared/hooks/useWishlist";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  return `S/ ${price.toFixed(2)}`;
}

function discountPercent(price: number, regular: number): number {
  if (!regular || regular <= price) return 0;
  return Math.round(((regular - price) / regular) * 100);
}

// ─── Galería de imágenes ──────────────────────────────────────────────────────
function ProductGallery({
  images,
  name,
}: {
  images: LaravelProduct["images"];
  name: string;
}) {
  const [active, setActive] = useState(0);

  const prev = useCallback(
    () => setActive((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length],
  );

  const mainSrc =
    images[active]?.large ??
    images[active]?.medium ??
    images[active]?.src ??
    "/no-image.png";
  const mainAlt = images[active]?.alt ?? name;

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-[var(--bg-secondary)] shadow-lg group">
        <Image
          key={mainSrc}
          src={mainSrc}
          alt={mainAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-black/60 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-black/60 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-sky-500 dark:border-[#4A7C59] shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.thumb ?? img.src}
                alt={img.alt ?? name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sección de rating ────────────────────────────────────────────────────────
function RatingStars({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-4 h-4 ${
              n <= Math.round(average)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
        {average > 0 ? average.toFixed(1) : "Sin reseñas"}
        {count > 0 && <span className="ml-1">({count} reseñas)</span>}
      </span>
    </div>
  );
}

// ─── Badge de sticker ─────────────────────────────────────────────────────────
function StickerBadge({ sticker }: { sticker: string | null }) {
  if (!sticker) return null;

  const stickerMap: Record<string, { label: string; className: string }> = {
    oferta: { label: "Oferta", className: "bg-red-500 text-white" },
    liquidacion: {
      label: "Liquidación",
      className: "bg-orange-500 text-white",
    },
    nuevo: { label: "Nuevo", className: "bg-emerald-500 text-white" },
    bestseller: { label: "Más vendido", className: "bg-purple-500 text-white" },
    envio_gratis: { label: "Envío gratis", className: "bg-sky-500 text-white" },
    descuento: { label: "Descuento", className: "bg-yellow-500 text-gray-900" },
  };

  const config = stickerMap[sticker] ?? {
    label: sticker,
    className: "bg-gray-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${config.className}`}
    >
      <Tag className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL — ProductDetailPageClient
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  product: LaravelProduct;
  relatedProducts?: LaravelProduct[];
}

export function ProductDetailPageClient({
  product,
  relatedProducts = [],
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "descripcion" | "atributos" | "tienda"
  >("descripcion");
  const { isWishlisted, toggle: toggleWishlist } = useWishlist(product.id);

  const discount = discountPercent(product.price, product.regular_price);
  const inStock = product.stock > 0;

  const mainAttrs = product.mainAttributes ?? [];
  const additionalAttrs = product.additionalAttributes ?? [];
  const allAttributes = [
    ...mainAttrs.flatMap((a) => a.values),
    ...additionalAttrs.flatMap((a) => a.values),
  ];

  const {
    addToCart,
    loading: cartLoading,
    addedToCart,
    error: cartError,
  } = useAddToCart();
  const handleAddToCart = () => addToCart(Number(product.id), quantity);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      {/* ── Breadcrumb ── */}
      <div className="bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-sky-500 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          {product.categories[0] && (
            <>
              <Link
                href={`/productos/${product.categories[0].slug}`}
                className="hover:text-sky-500 transition-colors"
              >
                {product.categories[0].name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800 dark:text-[var(--text-primary)] font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Botón volver ── */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        {/* ── Grid principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Galería */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Info del producto */}
          <div className="flex flex-col gap-5">
            {/* Categorías + sticker */}
            <div className="flex flex-wrap items-center gap-2">
              {product.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos/${cat.slug}`}
                  className="px-3 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-full hover:bg-sky-200 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <StickerBadge sticker={product.sticker} />
            </div>

            {/* Nombre */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-[var(--text-primary)] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <RatingStars
              average={product.rating.average}
              count={product.rating.count}
            />

            {/* Precio */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black text-sky-600 dark:text-sky-400">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.regular_price)}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${
                inStock
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500"
              }`}
            >
              <Package className="w-4 h-4" />
              {inStock ? `${product.stock} unidades disponibles` : "Sin stock"}
            </div>

            {/* Selector de cantidad */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-[var(--text-primary)]">
                  Cantidad:
                </span>
                <div className="flex items-center border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)] transition-colors font-bold"
                    aria-label="Reducir cantidad"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-bold text-gray-800 dark:text-[var(--text-primary)] min-w-[3ch] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)] transition-colors font-bold"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-2xl transition-all shadow-lg ${
                  addedToCart
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : inStock
                      ? "bg-sky-500 hover:bg-sky-600 dark:bg-[#4A7C59] dark:hover:bg-[#3D6B4A] text-white shadow-sky-500/30 hover:-translate-y-0.5"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {addedToCart
                  ? "¡Agregado!"
                  : inStock
                    ? "Agregar al carrito"
                    : "Sin stock"}
              </button>

              <button
                onClick={toggleWishlist}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isWishlisted
                    ? "border-red-400 text-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-[var(--border-subtle)] text-gray-500 hover:border-red-400 hover:text-red-500"
                }`}
                aria-label={
                  isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"
                }
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>

              <button
                onClick={() =>
                  navigator.share?.({
                    title: product.name,
                    url: window.location.href,
                  })
                }
                className="p-4 rounded-2xl border-2 border-gray-200 dark:border-[var(--border-subtle)] text-gray-500 hover:border-sky-400 hover:text-sky-500 transition-all"
                aria-label="Compartir"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Garantías rápidas */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, text: "Compra segura" },
                { icon: Truck, text: "Envío rápido" },
                { icon: RotateCcw, text: "Devoluciones" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] text-center"
                >
                  <Icon className="w-5 h-5 text-sky-500 dark:text-[#4A7C59]" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-[var(--text-secondary)]">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Card de la tienda */}
            <Link
              href={`/tienda/${product.store.slug}`}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-300 dark:hover:border-[#4A7C59]/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                {product.store.logo ? (
                  <Image
                    src={product.store.logo}
                    alt={product.store.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Store className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                  Vendido por
                </p>
                <p className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-1">
                  {product.store.name}
                  <BadgeCheck className="w-4 h-4 text-sky-500 dark:text-[#4A7C59]" />
                </p>
                {product.store.phone && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {product.store.phone}
                  </p>
                )}
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:text-sky-500 transition-colors" />
            </Link>
          </div>
        </div>

        {/* ── Tabs: descripción, atributos, tienda ── */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-gray-200 dark:border-[var(--border-subtle)] mb-6">
            {(
              [
                { key: "descripcion", label: "Descripción" },
                { key: "atributos", label: "Características" },
                { key: "tienda", label: "Tienda" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                  activeTab === key
                    ? "border-sky-500 dark:border-[#4A7C59] text-sky-600 dark:text-[#4A7C59]"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Descripción */}
          {activeTab === "descripcion" && (
            <div className="bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
              {product.description ? (
                <p className="text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-600 italic">
                  Sin descripción disponible.
                </p>
              )}

              {/* Detalles técnicos */}
              {(product.weight ||
                product.dimensions ||
                product.expirationDate) && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.weight && (
                    <div className="flex items-center gap-3 text-sm">
                      <Weight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">Peso</p>
                        <p className="font-semibold text-gray-700 dark:text-[var(--text-primary)]">
                          {product.weight} kg
                        </p>
                      </div>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-center gap-3 text-sm">
                      <Ruler className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">Dimensiones</p>
                        <p className="font-semibold text-gray-700 dark:text-[var(--text-primary)]">
                          {product.dimensions}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.expirationDate && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">Vence</p>
                        <p className="font-semibold text-gray-700 dark:text-[var(--text-primary)]">
                          {product.expirationDate}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Atributos */}
          {activeTab === "atributos" && (
            <div className="bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
              {allAttributes.length > 0 ? (
                <div className="space-y-4">
                  {mainAttrs.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                        Características principales
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mainAttrs.flatMap((a) => a.values)
                          .map((val, i) => {
                            const label =
                              typeof val === "object" && val !== null
                                ? val.label
                                : String(val);
                            const value =
                              typeof val === "object" && val !== null
                                ? val.value
                                : null;
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 text-sm font-semibold rounded-full border border-sky-200 dark:border-sky-800"
                              >
                                <span className="opacity-70">{label}:</span>
                                <span>{value ?? label}</span>
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  {additionalAttrs.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                        Características adicionales
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {additionalAttrs.flatMap((a) => a.values)
                          .map((val, i) => {
                            const label =
                              typeof val === "object" && val !== null
                                ? val.label
                                : String(val);
                            const value =
                              typeof val === "object" && val !== null
                                ? val.value
                                : null;
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-600 dark:text-[var(--text-secondary)] text-sm font-semibold rounded-full border border-gray-200 dark:border-[var(--border-subtle)]"
                              >
                                <span className="opacity-70">{label}:</span>
                                <span>{value ?? label}</span>
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-600 italic">
                  Sin características especificadas.
                </p>
              )}
            </div>
          )}

          {/* Tab: Tienda */}
          {activeTab === "tienda" && (
            <div className="bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  {product.store.logo ? (
                    <Image
                      src={product.store.logo}
                      alt={product.store.name}
                      width={64}
                      height={64}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                    {product.store.name}
                    <BadgeCheck className="w-5 h-5 text-sky-500 dark:text-[#4A7C59]" />
                  </h3>
                  <div className="mt-3 space-y-1.5">
                    {product.store.email && (
                      <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)] flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {product.store.email}
                      </p>
                    )}
                    {product.store.phone && (
                      <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)] flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {product.store.phone}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/tienda/${product.store.slug}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-sm font-bold rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    Ver tienda completa
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Productos relacionados ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] mb-6">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 8).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/producto/${rel.slug}`}
                  className="group bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-lg hover:border-sky-200 dark:hover:border-[#4A7C59]/40 transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)]">
                    <Image
                      src={
                        rel.images[0]?.medium ??
                        rel.images[0]?.src ??
                        "/no-image.png"
                      }
                      alt={rel.images[0]?.alt ?? rel.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {rel.sticker && (
                      <div className="absolute top-2 left-2">
                        <StickerBadge sticker={rel.sticker} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight">
                      {rel.name}
                    </p>
                    <p className="text-sky-600 dark:text-sky-400 font-black mt-1 text-sm">
                      {formatPrice(rel.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
