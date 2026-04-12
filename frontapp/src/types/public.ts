export interface Banner {
  id: number;
  imagen: string;
  imagenMobile?: string;
  titulo: string;
  descripcion?: string;
  precio?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
  descripcion?: string;
  slug?: string;
}

export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  imagen: string;
  categoria?: string;
  estrellas?: string;
  descuento?: number;
  tag?: string;
  slug?: string;
  enlace?: string;
  descripcion?: string;
  precioOferta?: number;
  precioAnterior?: number;
  reviews?: number;
  stock?: number;
  vendedor?: {
    slug: string;
    nombre: string;
  };
  categorias?: string[];
  descripcionCorta?: string;
}

export interface Marca {
  id: number;
  nombre: string;
  logo: string;
}

export interface Beneficio {
  id: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

export interface BannerSlide {
  id: number;
  imagenes: string[];
}

export interface BannersPub {
  slider1: BannerSlide[];
  sliderMedianos1: BannerSlide[];
  pequenos1: string[];
  sliderMedianos2: BannerSlide[];
  pequenos2: string[];
}

export interface HomeData {
  banners: Banner[];
  categorias: Categoria[];
  categoriasProductos: Categoria[];
  productos: Producto[];
  marcas: Marca[];
  beneficios: Beneficio[];
  ofertasServicios: Producto[];
  ofertasProductos: Producto[];
  productosNuevos: Producto[];
  productosDigestion: Producto[];
  productosBelleza: Producto[];
  productosServicios: Producto[];
  productosMedicina: Producto[];
  bannersPub: BannersPub;
}

export interface SearchResult {
  id: number;
  type: 'product' | 'category';
  titulo: string;
  precio?: number;
  imagen: string;
  slug?: string;
  categoria?: string;
}

export interface SearchFilters {
  query: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface Tienda {
  id: number;
  user_id?: number;
  nombre: string;
  slug: string;
  store_name?: string;
  trade_name?: string;
  descripcion?: string;
  logo?: string;
  cover?: string;
  banner?: string;
  plan?: 'basico' | 'premium';
  categoria?: string;
  category_id?: number;
  telefono?: string;
  correo?: string;
  direccion?: string;
  valoracion?: number;
  reviews?: number;
  ruc?: string;
  razon_social?: string;
  nombre_comercial?: string;
  rep_legal_nombre?: string;
  rep_legal_dni?: string;
  rep_legal_foto?: string;
  experience_years?: number;
  tax_condition?: string;
  direccion_fiscal?: string;
  cuenta_bcp?: string;
  cci?: string;
  bank_secondary?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  policies?: string;
  gallery?: string[];
  status?: 'pending' | 'active' | 'suspended' | 'rejected';
}