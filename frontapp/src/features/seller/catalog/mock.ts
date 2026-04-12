import { Product } from './types';

export const MOCK_CATALOG_DATA: Product[] = [
    {
        id: '1',
        name: 'Aceite Esencial de Lavanda Orgánico',
        category: 'cuidado_personal',
        price: 45.00,
        stock: 24,
        weight: 0.1,
        description: 'Aceite esencial 100% puro para relajación y aromaterapia.',
        image: 'https://images.unsplash.com/photo-1608248593801-18cb1f0b0cdd?w=300',
        sticker: 'bestseller',
        mainAttributes: [{ values: ['Volumen', '15ml'] }, { values: ['Ingredientes', 'Lavandula angustifolia'] }],
        additionalAttributes: [{ values: ['Origen', 'Francia'] }],
        createdAt: '2026-02-15T10:00:00.000Z'
    },
    {
        id: '2',
        name: 'Mix de Frutos Secos Energético',
        category: 'alimentos',
        price: 25.50,
        stock: 50,
        weight: 0.25,
        description: 'Mezcla perfecta de almendras, nueces, pasas y castañas.',
        image: 'https://images.unsplash.com/photo-1599598425947-330026e95c1a?w=300',
        sticker: 'oferta',
        mainAttributes: [{ values: ['Peso Neto', '250g'] }],
        additionalAttributes: [],
        createdAt: '2026-02-16T11:00:00.000Z'
    },
    {
        id: '3',
        name: 'Vitamina C + Zinc Liposomal',
        category: 'suplementos',
        price: 89.90,
        stock: 12,
        weight: 0.2,
        description: 'Suplemento de alta absorción para el sistema inmunológico.',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300',
        sticker: 'nuevo',
        mainAttributes: [{ values: ['Dosis', '2 cápsulas/día'] }],
        additionalAttributes: [{ values: ['Presentación', '60 Cápsulas'] }],
        createdAt: '2026-02-17T09:30:00.000Z'
    }
];
