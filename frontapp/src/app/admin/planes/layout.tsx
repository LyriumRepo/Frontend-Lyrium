import '@/features/admin/planes/styles/admin.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel Admin - LYRIUM Biomarketplace',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
