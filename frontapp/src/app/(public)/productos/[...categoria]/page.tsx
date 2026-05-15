import { notFound } from 'next/navigation';
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
  mapWooProductToLocal
} from '@/shared/lib/api/wooCommerce';
import { getCategories } from '@/shared/lib/api';
import { ProductCategory } from '@/shared/types/wp/wp-types';
import CategoryPageClient from './CategoryPageClient';

interface PageProps {
  params: Promise<{ categoria: string[] }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoria } = await params;

  const fullSlugs = categoria;
  const currentSlug = categoria[categoria.length - 1];

  // 🔥 VALIDAR TODA LA JERARQUÍA
  let parentId = 0;

  for (const slug of fullSlugs) {
    const cat = await getCategoryBySlug(slug);

    if (!cat) {
      console.error('Categoría no encontrada:', slug);
      notFound();
    }

    if (cat.parent !== parentId) {
      console.error('Jerarquía inválida en:', slug);
      notFound();
    }

    parentId = cat.id;
  }

  // 🔥 SOLO USAR EL ÚLTIMO PARA PRODUCTOS
  const [categoryRaw, wooProducts, allCategoriesRaw] = await Promise.all([
    getCategoryBySlug(currentSlug),
    getProductsByCategorySlug(currentSlug, 50),
    getCategories(),
  ]);

  if (!categoryRaw) {
    notFound();
  }

  const productos = wooProducts.map(mapWooProductToLocal);

  const category: ProductCategory = {
    id: categoryRaw.id,
    name: categoryRaw.name,
    slug: categoryRaw.slug,
    parent: categoryRaw.parent,
    description: categoryRaw.description || '',
    count: categoryRaw.count || 0,
    image: categoryRaw.image?.src
      ? {
          id: 0,
          src: categoryRaw.image.src,
          name: categoryRaw.name,
        }
      : undefined,
  };

  const mainCategories: ProductCategory[] = allCategoriesRaw
    .filter((cat: any) => cat.parent === 0)
    .map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent,
      description: cat.description || '',
      count: cat.count || 0,
      image: cat.image?.src
        ? {
            id: 0,
            src: cat.image.src,
            name: cat.name,
          }
        : undefined,
    }));

  return (
    <CategoryPageClient
      category={category}
      products={productos}
      allCategories={mainCategories}
    />
  );
}