export interface ProductImage {
  id: number;
  src: string;
  name: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image?: {
    id: number;
    src: string;
    name: string;
  };
}

export interface ProductStore {
  id: number;
  name: string;
  shop_name: string;
  url: string;
  avatar: string;
  banner: string;
}

export interface Product {
  id: number;
  name: string;
  status: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: ProductImage[];
  categories: ProductCategory[];
  store: ProductStore;
  sku: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  permalink: string;
}

export interface OrderLineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  total: string;
  sku: string;
  price: number;
}

export interface Order {
  id: number;
  status: string;
  currency: string;
  total: string;
  date_created: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  line_items: OrderLineItem[];
  payment_method_title: string;
}

export interface ProductReview {
  id: number;
  date_created: string;
  product_id: number;
  status: string;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
}

export interface SalesReport {
  total_sales: string;
  net_sales: string;
  average_sales: string;
  total_orders: number;
  total_items: number;
  total_tax: string;
  total_shipping: string;
  total_refunds: number;
  total_discount: string;
  totals_grouped_by: string;
  totals: {
    [key: string]: {
      sales: string;
      orders: number;
      items: number;
      tax: string;
      shipping: string;
      discount: string;
      customers: number;
    }
  };
}

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  status: number; // 0: pending, 1: completed, 2: cancelled
  method: string;
  ip: string;
  notes: string;
  created: string;
  user_data?: {
    store_name: string;
  }
}
