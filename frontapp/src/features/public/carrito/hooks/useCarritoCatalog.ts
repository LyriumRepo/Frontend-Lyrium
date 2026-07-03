"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCarritoStore } from "@/store/carritoStore";
import { LARAVEL_API_URL } from "@/shared/lib/config/flags";
import type { ApiProduct } from "@/modules/cart/utils";
import type { LaravelProduct } from "@/features/public/product/types";

// ─── Fetch productos públicos de Laravel ──────────────────────────────────────
async function fetchLaravelProducts(): Promise<ApiProduct[]> {
  const res = await fetch(
    `${LARAVEL_API_URL}/products?per_page=50&status=approved`,
    {
      headers: { Accept: "application/json" },
    },
  );
  if (!res.ok) throw new Error(`Error ${res.status} al cargar productos`);
  const json = await res.json();

  // El backend devuelve { success, data: [...], meta: {...} }
  const raw: LaravelProduct[] = Array.isArray(json) ? json : (json.data ?? []);

  // Mapear LaravelProduct → ApiProduct (formato del carritoStore)
  return raw.map(mapToApiProduct);
}

// ─── Mapeo LaravelProduct → ApiProduct ───────────────────────────────────────
// ApiProduct es el tipo que usa el carritoStore, ProductCard y ProductGrid
function mapToApiProduct(p: LaravelProduct): ApiProduct {
  const finalPrice = p.price;
  const basePrice = p.regular_price > p.price ? p.regular_price : p.price;
  const hasOffer = p.regular_price > p.price;

  return {
    id: Number(p.id),
    nombre: p.name,
    descripcion_corta: p.description?.slice(0, 120) ?? "",
    descripcion_larga: p.description ?? "",
    precio: basePrice,
    precio_oferta: hasOffer ? finalPrice : undefined,
    precio_final: finalPrice,
    descuento_pct: hasOffer
      ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
      : 0,
    imagen_url: p.images[0]?.medium ?? p.images[0]?.src ?? "",
    categoria_nombre: p.categories[0]?.name ?? "General",
    slug: p.slug,
    tag: p.sticker,
    stock: p.stock,
    estado_stock: p.stock > 0 ? "in_stock" : "out_of_stock",
    sku: p.slug, // no hay SKU en el tipo LaravelProduct, usamos slug
    rating_promedio: p.rating?.average ?? 0,
    rating_total: p.rating?.count ?? 0,
    // Campos opcionales del ApiProduct
    vendedor_nombre: p.store?.name,
    vendedor_slug: p.store?.slug,
    tipo: p.type,
    store_logo_marketplace: p.store?.logo_marketplace ?? undefined,
  } as ApiProduct;
}

// ─────────────────────────────────────────────────────────────────────────────
// useCarritoCatalog
// Carga los productos del catálogo público de Laravel y los inyecta
// en el carritoStore.setProducts() para que ProductGrid y FilterBar funcionen.
// Sigue el mismo patrón de hooks de features: React Query + store.
// ─────────────────────────────────────────────────────────────────────────────
export function useCarritoCatalog() {
  const setProducts = useCarritoStore((s) => s.setProducts);

  const query = useQuery({
    queryKey: ["carrito-catalog"],
    queryFn: fetchLaravelProducts,
    staleTime: 60_000, // 1 minuto de cache
  });

  // Cuando llegan los datos, los carga en el store
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setProducts(query.data);
    }
  }, [query.data, setProducts]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
