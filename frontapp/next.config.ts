import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/backend/:path*', destination: 'http://127.0.0.1:8000/:path*' },
      { source: '/storage/:path*', destination: 'http://127.0.0.1:8000/storage/:path*' },
    ];
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },

  // === CONFIGURACIÓN DE IMÁGENES ===
  images: {
    unoptimized: true,   // Útil mientras desarrollas con Laravel
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'lyriumbiomarketplace.com' },

      {
        protocol: 'https',
        hostname: '**.woocommerce.com',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname:'/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1', 
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.lyrium.com',
      },
      {
        protocol: 'https',
        hostname: 'lyrium.com',
      },
      {
        protocol: 'https',
        hostname: 'lyriumbiomarketplace.com',
      },
      {
        protocol: 'https',
        hostname: '**.lyriumbiomarketplace.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
      {
        protocol: 'https',
        hostname: '*.up.railway.app',
      },
    ],
  },
};

export default nextConfig;