'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { Receipt, TrendingDown, DollarSign, Plus } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ExpensesPageClientProps { }
export function ExpensesPageClient(_props: ExpensesPageClientProps) {
    const expenses = [
        { id: 1, label: 'Hosting & Server (AWS)', amount: 450, category: 'Infraestructura', status: 'Pagado', trend: '+2%' },
        { id: 2, label: 'Soporte Nivel 2 (Outsourced)', amount: 1200, category: 'Operación', status: 'Pendiente', trend: '0%' },
        { id: 3, label: 'Marketing Digital (FB/IG)', amount: 3000, category: 'Crecimiento', status: 'Pagado', trend: '-5%' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="Gastos Operativos" subtitle="Control de expenses y costos operativos" icon="Receipt" actions={<BaseButton variant="primary" leftIcon="Plus" size="md">Nuevo Gasto</BaseButton>} />
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full" aria-label="Tabla de gastos operativos"><thead><tr className="border-b border-gray-100"><th scope="col" className="p-6 text-left text-xs font-black text-gray-400 uppercase">Concepto</th><th scope="col" className="p-6 text-left text-xs font-black text-gray-400 uppercase">Monto</th><th scope="col" className="p-6 text-left text-xs font-black text-gray-400 uppercase">Categoría</th><th scope="col" className="p-6 text-left text-xs font-black text-gray-400 uppercase">Estado</th></tr></thead><tbody>{expenses.map(e => (<tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50"><td className="p-6 font-bold text-gray-800">{e.label}</td><td className="p-6 font-black text-gray-900">S/ {e.amount}</td><td className="p-6"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">{e.category}</span></td><td className="p-6"><span className={`px-3 py-1 rounded-full text-xs font-bold ${e.status === 'Pagado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{e.status}</span></td></tr>))}</tbody></table>
            </div>
        </div>
    );
}
