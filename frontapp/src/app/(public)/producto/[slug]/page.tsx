
// app/(public)/producto/[slug]/page.tsx

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  getPublicProductBySlug,
  getProductsByCategory,
} from '@/shared/lib/api/laravelProductRepository';
import { ProductDetailPageClient } from './ProductDetailPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) return { title: 'Producto no encontrado | Lyrium' };

  const description =
    product.short_description ??
    product.description?.slice(0, 160) ??
    `Compra ${product.name} en Lyrium Biomarketplace`;

  return {
    title: `${product.name} | Lyrium Biomarketplace`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images[0]?.large
        ? [
            {
              url: product.images[0].large,
              alt: product.images[0].alt ?? product.name,
            },
          ]
        : [],
    },
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  // Si el fetch de relacionados falla, la página del producto debe renderizar igual
  // (sin carrusel), no tumbar todo el server render con un 500.
  const firstCategorySlug = product.categories[0]?.slug;
  const relatedProducts = firstCategorySlug
    ? await getProductsByCategory(firstCategorySlug, 9)
        .then((products) => products.filter((p) => p.id !== product.id))
        .catch(() => [])
    : [];


  return (
    <Suspense fallback={<BaseLoading />}>
      <ProductDetailPageClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </Suspense>
  );
}
