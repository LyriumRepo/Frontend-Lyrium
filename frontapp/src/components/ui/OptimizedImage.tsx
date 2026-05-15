// src/components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  priority = false,
  fill = false,
  fallbackSrc = "/img/no-image.png"
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const finalSrc = fixImageUrl(imgSrc);

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      fill={fill}
      onError={() => setImgSrc(fallbackSrc)}
      style={{ objectFit: fill ? 'cover' : 'contain' }}
    />
  );
}

// Función auxiliar (puedes moverla a un utils si prefieres)
function fixImageUrl(url: string): string {
  if (!url) return '/img/no-image.png';
  if (url.startsWith('http')) return url;
  
  let clean = url.trim();
  clean = clean.replace('/backend/storage', '/storage');
  if (!clean.startsWith('/')) clean = '/' + clean;
  return clean;
}