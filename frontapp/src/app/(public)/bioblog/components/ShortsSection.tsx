'use client';

import { useState, useEffect } from 'react';
import { blogApi } from '@/shared/lib/api/blog';
import { Play, Clock, ExternalLink } from 'lucide-react';

interface ShortItem {
  id: number;
  title: string;
  description: string;
  platform: string;
  url: string;
  cover_image: string | null;
  thumbnail: string | null;
  duration: string | number | null; // Updated to allow numbers from the API
  tags: string[] | null;
  published_at: string | null;
}

function formatDuration(duration: string | number | null): string {
  // 1. Safe guard against empty, null, or undefined values
  if (duration === null || duration === undefined || duration === '') return '';

  // 2. If the API returns a pure number (seconds), format it directly
  if (typeof duration === 'number') {
    return `${duration}s`;
  }

  // 3. If it's a string timestamp (e.g., "1:30")
  if (duration.includes(':')) return duration;

  // 4. Fallback for stringified numbers (e.g., "45")
  const secs = Number(duration);
  return isNaN(secs) ? '' : `${secs}s`;
}

export default function ShortsSection() {
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi
      .getShorts()
      .then((data: any[]) => {
        const items = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description ?? '',
          platform: p.platform ?? '',
          url: p.url ?? '',
          cover_image: p.thumbnail ?? null,
          thumbnail: p.thumbnail ?? null,
          duration: p.duration ?? null,
          tags: p.tags ?? null,
          published_at: p.published_at ?? null,
        }));
        setShorts(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full py-16 bg-white dark:bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="pt-8 pb-12 text-center max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="h-px w-12 bg-lime-500" />
            <span className="text-lime-600 dark:text-lime-400 font-bold tracking-widest text-sm uppercase">
              Lyrium
            </span>
            <span className="h-px w-12 bg-lime-500" />
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-6 drop-shadow-sm uppercase">
            SHORTS
          </h3>
          <p className="text-slate-600 dark:text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light text-center max-w-5xl mx-auto">
            Contenido rápido y directo. Descubre videos cortos sobre productos
            ecológicos, tips y más.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shorts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Play className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No hay shorts disponibles aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {shorts.map((short) => (
              <a
                key={short.id}
                href={short.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                    e.preventDefault();
                    blogApi.registerShortView(short.id);
                    window.open(short.url, '_blank');
                }}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-slate-100 dark:bg-[#1e2a2a] aspect-[9/16]"
              >
                {short.cover_image || short.thumbnail ? (
                  <img
                    src={short.cover_image || short.thumbnail || ''}
                    alt={short.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">
                    {short.title}
                  </h4>
                  {short.duration && (
                    <span className="text-xs text-white/70 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(short.duration)}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play
                      className="w-7 h-7 ml-0.5 text-slate-800"
                      fill="currentColor"
                    />
                  </div>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
