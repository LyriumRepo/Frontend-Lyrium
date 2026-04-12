import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategorySlug, mapWooProductToLocal } from '@/shared/lib/api/wooCommerce';
import { getCategories } from '@/shared/lib/api';
import { ProductCategory } from '@/shared/types/wp/wp-types';
import CategoryPageClient from './CategoryPageClient';

interface PageProps {
  params: Promise<{ categoria: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoria } = await params;
  
  const [categoryRaw, wooProducts, allCategoriesRaw] = await Promise.all([
    getCategoryBySlug(categoria),
    getProductsByCategorySlug(categoria, 50),
    getCategories(),
  ]);

  if (!categoryRaw) {
    notFound();
  }

  const productos = wooProducts.map(mapWooProductToLocal);

  // Convertir categoría actual al tipo correcto
  const category: ProductCategory = {
    id: categoryRaw.id,
    name: categoryRaw.name,
    slug: categoryRaw.slug,
    parent: categoryRaw.parent,
    description: categoryRaw.description || '',
    count: categoryRaw.count || 0,
    image: categoryRaw.image?.src ? {
      id: 0,
      src: categoryRaw.image.src,
      name: categoryRaw.name,
    } : undefined,
  };

  // Convertir y filtrar solo categorías principales
  const mainCategories: ProductCategory[] = allCategoriesRaw
    .filter((cat: any) => cat.parent === 0)
    .map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent,
      description: cat.description || '',
      count: cat.count || 0,
      image: cat.image?.src ? {
        id: 0,
        src: cat.image.src,
        name: cat.name,
      } : undefined,
    }));

  return (
    <CategoryPageClient 
      category={category}
      products={productos}
      allCategories={mainCategories}
    />
  );
}
