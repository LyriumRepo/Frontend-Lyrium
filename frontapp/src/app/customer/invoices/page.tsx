import type { Metadata } from 'next';
import { InvoicesPageClient } from '@/features/customer/invoices/InvoicesPageClient';

export const metadata: Metadata = {
    title: 'Mis Confirmaciones de Pago | Lyrium',
};

export default function InvoicesPage() {
    return <InvoicesPageClient />;
}
