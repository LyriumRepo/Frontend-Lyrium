import axios from "axios";
import { Product, ProductCategory, Order, ProductReview, SalesReport, Withdrawal } from "../../lib/types/wp/wp-types";
import { Store } from "../../lib/types/stores/store";
import { API_CONFIG } from "./config/api";

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: string | number;
  regular_price?: string | number;
  stock_quantity?: number;
  manage_stock?: boolean;
  categories?: { id: number }[];
  images?: { src: string }[];
  status?: string;
  sku?: string;
}

export interface CategoryData {
  name?: string;
  description?: string;
  parent?: number;
  image?: { src: string };
}

// Cliente para Dokan (Tiendas)
const dokanClient = axios.create({
  baseURL: API_CONFIG.dokanApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cliente para WooCommerce (Productos) - Usando Basic Auth (más compatible con CORS/WP)
const wcClient = axios.create({
  baseURL: API_CONFIG.wcApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProducts = async (vendorId?: string): Promise<Product[]> => {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (!key || !secret || key === 'undefined' || secret === 'undefined') {
      throw new Error("WooCommerce credentials not configured");
    }

    const auth = btoa(`${key}:${secret}`);

    const response = await wcClient.get("/products", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      params: {
        per_page: 100,
        // En Dokan, el vendor ID es el ID de autor del producto
        status: 'publish',
        author: vendorId
      }
    });
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ WC API Error:", message);
    throw error;
  }
};

export const getOrders = async (vendorId?: string): Promise<Order[]> => {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
    const auth = btoa(`${key}:${secret}`);

    // Para pedidos de un vendedor específico en Dokan, 
    // usualmente se usa el endpoint de Dokan o el parámetro 'vendor_id' en WC si está integrado
    const response = await wcClient.get("/orders", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      params: {
        per_page: 50,
        // Algunos plugins de multi-vendor usan vendor_id, Dokan usa autor o endpoints específicos
        // Para esta implementación usaremos el filtro por metadatos o autor si aplica
        ...(vendorId ? { vendor_id: vendorId } : {})
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders from WC:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<ProductCategory[]> => {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (!key || !secret) {
      console.warn("WooCommerce credentials not configured");
      return [];
    }

    const auth = btoa(`${key}:${secret}`);

    const response = await wcClient.get("/products/categories", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      params: {
        per_page: 100,
        hide_empty: false
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories from WC:", error);
    return [];
  }
};

export const getSubcategories = async (parentId: number): Promise<ProductCategory[]> => {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
    const auth = btoa(`${key}:${secret}`);

    const response = await wcClient.get("/products/categories", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      params: {
        per_page: 50,
        parent: parentId,
        hide_empty: false
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subcategories from WC:", error);
    return [];
  }
};

export const getStores = async (search?: string, status: string = 'all'): Promise<Store[]> => {
  try {
    const response = await dokanClient.get("/stores", {
      params: {
        search: search,
        status: status,
        per_page: 50
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stores from Dokan:", error);
    throw error;
  }
};

export const getCurrentVendorStore = async (userEmail: string): Promise<Store | null> => {
  try {
    const stores = await getStores(userEmail, 'active');
    if (stores && stores.length > 0) {
      return stores[0];
    }
    console.warn("No store found for user:", userEmail);
    return null;
  } catch (error) {
    console.error("Error fetching current vendor store:", error);
    return null;
  }
};

export const getReviews = async (vendorId?: string): Promise<ProductReview[]> => {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
    const auth = btoa(`${key}:${secret}`);

    const response = await wcClient.get("/products/reviews", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      params: {
        per_page: 50,
        ...(vendorId ? { status: 'approved' } : {}) // Simplificación
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews from WC:", error);
    throw error;
  }
};

export const getSalesReport = async (period: string = "month", vendorId?: string): Promise<SalesReport[]> => {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
    const auth = btoa(`${key}:${secret}`);

    const response = await wcClient.get("/reports/sales", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      params: {
        period: period,
        // Nota: El reporte de ventas nativo de WC no siempre filtra por vendor fácilmente sin plugins adicionales
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales reports from WC:", error);
    throw error;
  }
};

export const getWithdrawals = async (): Promise<Withdrawal[]> => {
  try {
    const response = await dokanClient.get("/withdraw");
    return response.data;
  } catch (error) {
    console.error("Error fetching withdrawals from Dokan:", error);
    throw error;
  }
};

export const getDetailStore = async (id: string = "1126"): Promise<Store> => {
  try {
    const response = await dokanClient.get(`/stores/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching store detail:", error);
    throw error;
  }
};

// --- CRUD: PRODUCTOS (WooCommerce) ---

export const updateProduct = async (id: number, data: ProductUpdateData): Promise<Product> => {
  const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
  const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
  const auth = btoa(`${key}:${secret}`);

  const response = await wcClient.put(`/products/${id}`, data, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.data;
};

// --- CRUD: CATEGORÍAS (WooCommerce) ---

export const createCategory = async (data: CategoryData): Promise<ProductCategory> => {
  const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
  const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
  const auth = btoa(`${key}:${secret}`);

  const response = await wcClient.post('/products/categories', data, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.data;
};

export const updateCategory = async (id: number, data: CategoryData): Promise<ProductCategory> => {
  const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
  const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
  const auth = btoa(`${key}:${secret}`);

  const response = await wcClient.put(`/products/categories/${id}`, data, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.data;
};

export const deleteCategory = async (id: number): Promise<ProductCategory> => {
  const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
  const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
  const auth = btoa(`${key}:${secret}`);

  const response = await wcClient.delete(`/products/categories/${id}`, {
    headers: { Authorization: `Basic ${auth}` },
    params: { force: true }
  });
  return response.data;
};

// --- CRUD: TIENDAS (Dokan) ---

export const updateStoreStatus = async (id: number, status: string): Promise<any> => {
  // Dokan usualmente requiere privilegios de admin para esto
  // 'status' puede ser 'approved', 'pending', etc.
  const response = await dokanClient.put(`/stores/${id}`, {
    status: status
  });
  return response.data;
};

// ============================================
// NEW API LAYER (Tarea 2)
// ============================================
import { WPOrderRepository, WPProductRepository, WPAuthRepository, WPUserRepository, WPHomeRepository } from './api/wp';
import { LaravelOrderRepository, LaravelProductRepository, LaravelAuthRepository, LaravelUserRepository, LaravelHomeRepository } from './api/laravel';
import type { IOrderRepository, IProductRepository, IAuthRepository, IUserRepository, IHomeRepository } from './api/contracts';
import { API_BACKEND } from './config/flags';

const wpRepositories = {
  orders: new WPOrderRepository(),
  products: new WPProductRepository(),
  auth: new WPAuthRepository(),
  users: new WPUserRepository(),
  home: new WPHomeRepository(),
};

const laravelRepositories = {
  orders: new LaravelOrderRepository(),
  products: new LaravelProductRepository(),
  auth: new LaravelAuthRepository(),
  users: new LaravelUserRepository(),
  home: new LaravelHomeRepository(),
};

const repositories = API_BACKEND === 'laravel' ? laravelRepositories : wpRepositories;

export const orders: IOrderRepository = repositories.orders;
export const products: IProductRepository = repositories.products;
export const auth: IAuthRepository = repositories.auth;
export const users: IUserRepository = repositories.users;
export const home: IHomeRepository = repositories.home;

export const api = { orders, products, auth, users, home };

export type { IOrderRepository, IProductRepository, IAuthRepository, IUserRepository, IHomeRepository };