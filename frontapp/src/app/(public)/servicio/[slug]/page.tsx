import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { serviceRepository } from '@/shared/lib/api/serviRepository';
import { ServiceDetailPageClient } from './ServiceDetailPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await serviceRepository.getBySlug(slug);

  if (!service) return { title: 'Servicio no encontrado | Lyrium' };

  return {
    title: `${service.name} | Lyrium Biomarketplace`,
    description: service.description?.slice(0, 160) ?? `Agenda ${service.name} en Lyrium`,
  };
}

export default async function ServicioPage({ params }: PageProps) {
  const { slug } = await params;

  const service = await serviceRepository.getBySlug(slug);
  if (!service) notFound();

  return (
    <Suspense fallback={<BaseLoading />}>
      <ServiceDetailPageClient service={service} />
    </Suspense>
  );
}
