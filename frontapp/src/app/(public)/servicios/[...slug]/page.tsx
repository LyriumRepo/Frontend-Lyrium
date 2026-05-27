import { notFound } from 'next/navigation';
import { serviceRepository } from '@/shared/lib/api/serviRepository'; // Verifica que el nombre del archivo esté bien escrito aquí
import ServicesCategoryPageClient from './ServicesCategoryPageClient';

interface PageProps {
  params: Promise<{ slug: string[] }>; // Next.js 15+ maneja params como Promesa
}

export default async function ServicesCategoryPage({ params }: PageProps) {
  const { slug } = await params;

  // Si entras a /servicios/servicios-belleza/servicios-belleza-faciales
  // slug será: ['servicios-belleza', 'servicios-belleza-faciales']
  // categorySlug tomará el último: 'servicios-belleza-faciales'
  const categorySlug = slug[slug.length - 1];

  const [category, services, allCategories] = await Promise.all([
    serviceRepository.getCategoryBySlug(categorySlug),
    serviceRepository.getByCategory(categorySlug),
    serviceRepository.getCategories(),
  ]);

  // Si tu API no encuentra la subcategoría por su slug exacto, mandará al 404 de Next
  if (!category) notFound();

  return (
    <ServicesCategoryPageClient
      category={category}
      services={services}
      allCategories={allCategories}
    />
  );
}
