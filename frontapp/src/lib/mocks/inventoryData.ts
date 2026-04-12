import { InventoryItem } from '@/lib/types/admin/inventory';

export const MOCK_INVENTORY_DATA: InventoryItem[] = [
    {
        id: 'INV-001',
        name: 'Smartphone Galaxy S23',
        type: 'PRODUCT',
        sku: 'SAM-S23-BLK',
        seller: { id: 'SEL-101', name: 'Tech Store' },
        category: 'Electrónica',
        price: 3500,
        stock: 5,
        status: 'LOW_STOCK',
        lastUpdate: '2026-02-20'
    },
    {
        id: 'INV-002',
        name: 'Asesoría Legal Corporativa',
        type: 'SERVICE',
        seller: { id: 'SEL-102', name: 'Legal Solutions' },
        category: 'Legal',
        price: 500,
        stock: 100, // Representing availability
        status: 'ACTIVE',
        lastUpdate: '2026-02-19'
    },
    {
        id: 'INV-003',
        name: 'Audífonos Bluetooth Pro',
        type: 'PRODUCT',
        sku: 'AUD-BTP-WH',
        seller: { id: 'SEL-101', name: 'Tech Store' },
        category: 'Accesorios',
        price: 250,
        stock: 0,
        status: 'OUT_OF_STOCK',
        lastUpdate: '2026-02-18'
    },
    {
        id: 'INV-004',
        name: 'Mantenimiento de Aire Acondicionado',
        type: 'SERVICE',
        seller: { id: 'SEL-103', name: 'Clima Fix' },
        category: 'Servicios de Hogar',
        price: 150,
        stock: 1, // Busy tomorrow
        status: 'LOW_STOCK',
        lastUpdate: '2026-01-10'
    },
    {
        id: 'INV-005',
        name: 'Laptop Workstation X',
        type: 'PRODUCT',
        sku: 'LAP-WKS-GR',
        seller: { id: 'SEL-101', name: 'Tech Store' },
        category: 'Computación',
        price: 8500,
        stock: 12,
        status: 'IN_STOCK',
        lastUpdate: '2026-02-15'
    }
];
