import { Suspense } from 'react';
import { ExpensesPageClient } from './ExpensesPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function OperationalExpensesPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando gastos..." />}><ExpensesPageClient /></Suspense>);
}
