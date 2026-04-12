export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://lyriumbiomarketplace.com',
  wcApiUrl: process.env.NEXT_PUBLIC_WC_API_URL || 'https://lyriumbiomarketplace.com/wp-json/wc/v3',
  dokanApiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://lyriumbiomarketplace.com/wp-json/dokan/v1',
} as const;

export const WC_ENDPOINTS = {
  products: '/products',
  orders: '/orders',
  customers: '/customers',
  categories: '/products/categories',
  reviews: '/products/reviews',
} as const;

export const DOKAN_ENDPOINTS = {
  stores: '/stores',
  withdraw: '/withdraw',
  reports: '/reports',
  verifications: '/verification-requests',
} as const;
