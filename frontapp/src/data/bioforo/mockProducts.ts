// src/data/mockProducts.ts
export interface MockProduct {
  id: number;
  titulo: string;
  precio: number;
  precioOferta?: number | null;
  imagen: string;
  categoria: string;
}

export const mockProductos: MockProduct[] = [
  {
    id: 101,
    titulo: "Aceite de Coco Orgánico 500ml",
    precio: 28.90,
    precioOferta: 24.90,
    imagen: "/img/iconologo.png",
    categoria: "Belleza",
  },
  {
    id: 102,
    titulo: "Vitamina D3 + K2 60 cápsulas",
    precio: 45.00,
    precioOferta: 39.90,
    imagen: "/img/iconologo.png",
    categoria: "Suplementos",
  },
  {
    id: 103,
    titulo: "Crema Facial Hidratante Ácido Hialurónico",
    precio: 52.00,
    precioOferta: null,
    imagen: "/img/iconologo.png",
    categoria: "Belleza",
  },
  {
    id: 104,
    titulo: "Té Digestivo Manzanilla + Menta",
    precio: 12.90,
    precioOferta: 9.90,
    imagen: "/img/iconologo.png",
    categoria: "Digestión",
  },
];