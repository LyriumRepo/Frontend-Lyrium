export interface ProductAttribute {
    name?: string;
    values: string[];
}

export type ProductSticker = 'liquidacion' | 'oferta' | 'descuento' | 'nuevo' | 'bestseller' | 'envio_gratis' | null;

export interface ProductFormData {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image: string;
    sticker: ProductSticker;
    discountPercentage?: number;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    weight?: number;
    dimensions?: string;
    description: string;
    image: string;
    sticker: ProductSticker;
    discountPercentage?: number;
    mainAttributes: ProductAttribute[];
    additionalAttributes: ProductAttribute[];
    createdAt: string;
}
