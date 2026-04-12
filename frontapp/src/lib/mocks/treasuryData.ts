import { TreasuryData, PaymentDirection, CashInStatus, CashOutStatus } from '@/lib/types/admin/treasury';

export const MOCK_TREASURY_DATA: TreasuryData = {
    windowOpen: new Date().getDay() >= 1 && new Date().getDay() <= 3, // Ventana lunes a miércoles
    resumen: {
        ventas_totales: 3450000.50,
        ventas_mes_actual: 450000.20,
        crecimiento_mensual: 12.5,
        total_vendedores: 154,
        comisiones_totales: 41400.06,
        costos_operativos: 12000.00,
        utilidad_neta: 29400.06,
        margen_operativo: 71.01
    },
    liquidacionesMensuales: [
        { mes: 'Ene', cashIn: 320000, cashOut: 200000, comisiones: 12000 },
        { mes: 'Feb', cashIn: 380000, cashOut: 280000, comisiones: 10000 },
        { mes: 'Mar', cashIn: 450000, cashOut: 350000, comisiones: 10000 },
        { mes: 'Abr', cashIn: 420000, cashOut: 300000, comisiones: 12000 },
        { mes: 'May', cashIn: 540000, cashOut: 450000, comisiones: 9000 },
        { mes: 'Jun', cashIn: 610000, cashOut: 500000, comisiones: 110000 },
    ],
    cashIn: [
        {
            id: 'PAY-IN-9844',
            referenceId: 'ORD-2993',
            direction: PaymentDirection.IN,
            amount: { amount: 1540.00, currency: 'PEN' },
            createdAt: '2025-06-15T12:00:00Z',
            updatedAt: '2025-06-15T12:30:00Z',
            status: CashInStatus.PENDING_VALIDATION,
            customer: { id: 'CUST-102', name: 'Ana Torres', taxId: '45612378' },
            voucherUrl: '/assets/vouchers/v-9844.png',
            orderHierarchy: { company: 'Tech Store', seller: 'SEL-122', customer: 'CUST-102' },
            auditTrail: 'LOG-991',
            timeline: [
                { id: 'T-1', timestamp: '2025-06-15T12:00:00Z', previousStatus: 'CREATED', newStatus: 'PENDING_VALIDATION', actor: { id: 'SYS', name: 'System', role: 'SYSTEM' }, reason: 'Voucher uploaded' }
            ]
        },
        {
            id: 'PAY-IN-8822',
            referenceId: 'ORD-2991',
            direction: PaymentDirection.IN,
            amount: { amount: 8400.00, currency: 'PEN' },
            createdAt: '2025-06-14T10:00:00Z',
            updatedAt: '2025-06-14T15:30:00Z',
            status: CashInStatus.VALIDATED,
            customer: { id: 'CUST-992', name: 'Inversiones XYZ', taxId: '20123456781' },
            voucherUrl: '/assets/vouchers/v-8822.pdf',
            rapifacDocumentUrl: '/assets/invoices/F001-332.pdf',
            orderHierarchy: { company: 'Comercializadora Sur', seller: 'SEL-055', customer: 'CUST-992' },
            auditTrail: 'LOG-882',
            timeline: [
                { id: 'T-1', timestamp: '2025-06-14T15:30:00Z', previousStatus: 'PENDING_VALIDATION', newStatus: 'VALIDATED', actor: { id: 'ADM-1', name: 'Admin', role: 'ADMIN' }, reason: 'Bank check passed' }
            ]
        }
    ],
    cashOut: [
        {
            id: 'PAY-OUT-7766',
            referenceId: 'BCH-661',
            direction: PaymentDirection.OUT,
            amount: { amount: 12500.00, currency: 'PEN' },
            createdAt: '2025-06-10T09:00:00Z',
            updatedAt: '2025-06-10T14:20:00Z',
            status: CashOutStatus.SCHEDULED,
            seller: { id: 'SEL-54', name: 'ElectroHogar S.A.', bankName: 'BCP', accountNumber: '191-2342342-0-12', cci: '00219100234234201211' },
            commission: { amount: 1500.00, currency: 'PEN' },
            netAmount: { amount: 11000.00, currency: 'PEN' },
            liquidationPeriod: { start: '2025-06-01', end: '2025-06-07' },
            auditTrail: 'LOG-331',
            timeline: []
        },
        {
            id: 'PAY-OUT-7767',
            referenceId: 'BCH-661',
            direction: PaymentDirection.OUT,
            amount: { amount: 5000.00, currency: 'PEN' },
            createdAt: '2025-06-10T09:05:00Z',
            updatedAt: '2025-06-11T16:00:00Z',
            status: CashOutStatus.PAID,
            seller: { id: 'SEL-12', name: 'AgroInsumos S.A.C', bankName: 'BBVA', accountNumber: '0011-0123-0100123456' },
            commission: { amount: 500.00, currency: 'PEN' },
            netAmount: { amount: 4500.00, currency: 'PEN' },
            disbursementVoucherUrl: '/assets/transfers/tr-7767.pdf',
            liquidationPeriod: { start: '2025-06-01', end: '2025-06-07' },
            auditTrail: 'LOG-332',
            timeline: []
        },
        {
            id: 'PAY-OUT-7768',
            referenceId: 'BCH-661',
            direction: PaymentDirection.OUT,
            amount: { amount: 8000.00, currency: 'PEN' },
            createdAt: '2025-06-10T09:10:00Z',
            updatedAt: '2025-06-12T10:00:00Z',
            status: CashOutStatus.DISPUTED,
            seller: { id: 'SEL-88', name: 'Textil Norte E.I.R.L.', bankName: 'Interbank', accountNumber: '200-3001234567' },
            commission: { amount: 800.00, currency: 'PEN' },
            netAmount: { amount: 7200.00, currency: 'PEN' },
            liquidationPeriod: { start: '2025-06-01', end: '2025-06-07' },
            auditTrail: 'LOG-333',
            timeline: [
                { id: 'T-1', timestamp: '2025-06-12T10:00:00Z', previousStatus: 'PAID', newStatus: 'DISPUTED', actor: { id: 'SEL-88', name: 'Textil Norte', role: 'SELLER' }, reason: 'Monto recibido no coincide por S/ 100 menos' }
            ]
        }
    ]
};
