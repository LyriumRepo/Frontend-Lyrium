export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/backend',
  wcApiUrl: process.env.NEXT_PUBLIC_WC_API_URL || 'http://localhost:3000/backend/woocommerce',
  dokanApiUrl: process.env.NEXT_PUBLIC_DOKAN_API_URL || 'http://localhost:3000/backend/dokan',
} as const;
