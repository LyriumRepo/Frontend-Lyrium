import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

<<<<<<< HEAD
=======
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361

async rewrites() {
  const storageUrl = process.env.NEXT_PUBLIC_LARAVEL_STORAGE_URL ?? 'http://127.0.0.1:8000';
  return [
    { source: '/backend/:path*', destination: `${storageUrl}/:path*` },
    { source: '/storage/:path*', destination: `${storageUrl}/storage/:path*` }
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
    ],
  },
};

export default nextConfig;