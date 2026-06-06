// Mocks eliminados — toda la data proviene de la API Laravel (InvoiceController)
// Mantenemos el archivo para no romver imports, pero está vacío.
import { Voucher, InvoiceKPIs } from './types';
export const MOCK_VOUCHERS: Voucher[] = [];
export function calculateKPIs(_vouchers: Voucher[]): InvoiceKPIs {
    return { totalFacturado: 0, successRate: 0, pendingCount: 0, totalComprobantes: 0 };
}
