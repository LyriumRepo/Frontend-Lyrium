import { getProductBySlug, getProductsByCategorySlug, WooProduct, mapWooProductToLocal } from '@/shared/lib/api/wooCommerce';
import { notFound } from 'next/navigation';
import { Producto } from '@/types/public';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug) as WooProduct | null;

  if (!product) {
    notFound();
  }

  let relatedProducts: Producto[] = [];
  if (product.categories?.[0]) {
    const categorySlug = product.categories[0].slug;
    const related = await getProductsByCategorySlug(categorySlug, 6);
    relatedProducts = related
      .filter((p) => p.slug !== slug)
      .slice(0, 5)
      .map(mapWooProductToLocal);
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
