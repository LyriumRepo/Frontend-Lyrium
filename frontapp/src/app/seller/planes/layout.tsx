import '@/features/seller/plans/styles/Planes.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mi Plan - LYRIUM Biomarketplace' };

export default function PlanesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
