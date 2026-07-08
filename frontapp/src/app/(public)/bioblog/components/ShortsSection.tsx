'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { blogApi } from '@/shared/lib/api/blog';
import { Play, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoScrollCarousel } from '../hooks/useAutoScrollCarousel';

interface ShortItem {
  id: number;
  title: string;
  description: string;
  platform: string;
  url: string;
  cover_image: string | null;
  thumbnail: string | null;
  duration: string | number | null;
  tags: string[] | null;
  published_at: string | null;
}

function ShortCard({ short }: { short: ShortItem }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !imgError && (short.cover_image || short.thumbnail);

  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-slate-100 dark:bg-[#1e2a2a] aspect-[9/16]">
      <Link href={`/bioblog/short/${short.id}`} className="absolute inset-0 z-10" />
      {hasImage ? (
        <img
          src={short.cover_image || short.thumbnail || ''}
          alt={short.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lime-900/40 to-emerald-900/40 pointer-events-none">
          <Play className="w-12 h-12 text-white/60" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
        <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">{short.title}</h4>
        {short.duration && (
          <span className="text-xs text-white/70 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(short.duration)}
          </span>
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
          <Play className="w-7 h-7 ml-0.5 text-slate-800" fill="currentColor" />
        </div>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
        <ExternalLink className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

function formatDuration(duration: string | number | null): string {
  if (duration === null || duration === undefined || duration === '') return '';
  if (typeof duration === 'number') return `${duration}s`;
  if (duration.includes(':')) return duration;
  const secs = Number(duration);
  return isNaN(secs) ? '' : `${secs}s`;
}

export default function ShortsSection() {
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldDuplicate = shorts.length > 3;
  const { shift, trackRef, pausedRef, resumeTimerRef, pauseTemporarily } = useAutoScrollCarousel(shouldDuplicate);

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

  const items = shouldDuplicate ? [...shorts, ...shorts] : shorts;

  return (
    <div className="w-full py-16 bg-white dark:bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="pt-8 pb-12 text-center max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="h-px w-12 bg-lime-500" />
            <span className="text-lime-600 dark:text-lime-400 font-bold tracking-widest text-sm uppercase">Lyrium</span>
            <span className="h-px w-12 bg-lime-500" />
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-6 drop-shadow-sm uppercase">SHORTS</h3>
          <p className="text-slate-600 dark:text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light text-center max-w-5xl mx-auto">
            Contenido rápido y directo. Descubre videos cortos sobre productos ecológicos, tips y más.
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
          <div className="relative group/carousel">
            <div className="flex items-center justify-between mb-6">
              <div />
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500" />
                </span>
                <span className="text-xs font-semibold text-lime-600 dark:text-lime-400 uppercase tracking-wider">
                  Auto-scroll
                </span>
              </div>
            </div>

            <button
              onClick={() => shift('left')}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
                border border-lime-100 dark:border-lime-900/40
                flex items-center justify-center
                text-lime-600 dark:text-lime-400
                hover:bg-lime-50 dark:hover:bg-lime-950/40 hover:border-lime-400
                transition-all duration-200
                opacity-0 group-hover/carousel:opacity-100
                -translate-x-1 group-hover/carousel:translate-x-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => shift('right')}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
                border border-lime-100 dark:border-lime-900/40
                flex items-center justify-center
                text-lime-600 dark:text-lime-400
                hover:bg-lime-50 dark:hover:bg-lime-950/40 hover:border-lime-400
                transition-all duration-200
                opacity-0 group-hover/carousel:opacity-100
                translate-x-1 group-hover/carousel:translate-x-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              className="overflow-hidden relative"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              }}
              onMouseEnter={() => { pausedRef.current = true; if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); }}
              onMouseLeave={() => { pausedRef.current = false; }}
              onTouchStart={() => pauseTemporarily()}
              onTouchEnd={() => {}}
            >
              <div
                ref={trackRef}
                className="flex gap-5 will-change-transform py-4 px-2 items-stretch"
                style={{ width: 'max-content' }}
              >
                {items.map((short, i) => (
                  <div key={`${short.id}-${i}`} className="flex-shrink-0 w-[250px] flex">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (i % shorts.length) * 0.04 }}
                      className="w-full"
                    >
                      <ShortCard short={short} />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}