import { Voucher, InvoiceKPIs } from './types';

export const MOCK_VOUCHERS: Voucher[] = [
    {
        id: 'V-2026-001',
        series: 'F001',
        number: '00000214',
        type: 'FACTURA',
        customer_name: 'Agro Industrias del Norte S.A.C.',
        customer_ruc: '20600123456',
        order_id: 'ORD-2026-001',
        amount: 1250.80,
        emission_date: '2026-02-12T10:30:00Z',
        sunat_status: 'ACCEPTED',
        pdf_path: '#',
        xml_path: '#',
        cdr_path: '#',
        history: [
            { status: 'DRAFT', note: 'Documento borrador generado', timestamp: '2026-02-12 10:25', user: 'Vendedor' },
            { status: 'SENT_WAIT_CDR', note: 'Enviado a OSE/SUNAT via Rapifac', timestamp: '2026-02-12 10:30', user: 'Sistema' },
            { status: 'ACCEPTED', note: 'Comprobante aceptado por SUNAT', timestamp: '2026-02-12 10:32', user: 'SUNAT' }
        ]
    },
    {
        id: 'V-2026-003',
        series: 'B001',
        number: '00000102',
        type: 'BOLETA',
        customer_name: 'Juan Pérez García',
        customer_ruc: '10445566778',
        order_id: 'ORD-2026-003',
        amount: 450.00,
        emission_date: '2026-02-13T14:20:00Z',
        sunat_status: 'REJECTED',
        pdf_path: '#',
        history: [
            { status: 'DRAFT', note: 'Documento borrador generado', timestamp: '2026-02-13 14:15', user: 'Vendedor' },
            { status: 'SENT_WAIT_CDR', note: 'Enviado a OSE/SUNAT via Rapifac', timestamp: '2026-02-13 14:20', user: 'Sistema' },
            { status: 'REJECTED', note: 'Error RUC receptor no activo', timestamp: '2026-02-13 14:22', user: 'SUNAT' }
        ]
    },
    {
        id: 'V-2026-005',
        series: 'F001',
        number: '00000215',
        type: 'FACTURA',
        customer_name: 'Distribuidora Bio-Médica Lima',
        customer_ruc: '20556677889',
        order_id: 'ORD-2026-005',
        amount: 8900.50,
        emission_date: '2026-02-14T09:00:00Z',
        sunat_status: 'SENT_WAIT_CDR',
        history: [
            { status: 'DRAFT', note: 'Documento borrador generado', timestamp: '2026-02-14 08:55', user: 'Vendedor' },
            { status: 'SENT_WAIT_CDR', note: 'Enviado a Rapifac para procesamiento', timestamp: '2026-02-14 09:00', user: 'Sistema' }
        ]
    }
];

export function calculateKPIs(vouchers: Voucher[]): InvoiceKPIs {
    const accepted = vouchers.filter(v => v.sunat_status === 'ACCEPTED');
    const totalFacturado = accepted.reduce((sum, v) => sum + v.amount, 0);
    const successRate = vouchers.length > 0 ? (accepted.length / vouchers.length) * 100 : 0;
    const pendingCount = vouchers.filter(v => v.sunat_status === 'SENT_WAIT_CDR').length;
    const rejectedCount = vouchers.filter(v => v.sunat_status === 'REJECTED' || v.sunat_status === 'OBSERVED').length;

    return { totalFacturado, successRate, pendingCount, rejectedCount };
}
