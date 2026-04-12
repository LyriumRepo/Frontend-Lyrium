import type { Metadata } from 'next';
import { Suspense } from 'react';
import BioBlogHero from './components/BioBlogHero';
import HeroCarousel from './components/HeroCarousel';
import PostGridCarousel from './components/PostGridCarousel';
import FeaturedCarousel from './components/FeaturedCarousel';
import PodcastSection from './components/PodcastSection';
import VideoGallery from './components/VideoGallery';
import CommentsSection from './components/CommentsSection';

export const metadata: Metadata = {
    title: 'BioBlog - Lyrium Biomarketplace',
    description: 'Explora artículos sobre vida saludable, sostenibilidad y alimentación ecológica en el BioBlog de Lyrium.',
};

export default function BioBlogPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
            <Suspense fallback={null}>
                <BioBlogHero />
            </Suspense>
            
            {/* Sección de Publicaciones Header */}
            <div className="pt-16 pb-8 text-center max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <span className="h-px w-12 bg-lime-500" />
                    <span className="text-lime-600 dark:text-lime-400 font-bold tracking-widest text-sm uppercase">Novedades</span>
                    <span className="h-px w-12 bg-lime-500" />
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-6 drop-shadow-sm uppercase">
                    PUBLICACIONES</h3>
                <p className="text-slate-600 dark:text-[var(--text-muted)] text-base md:text-lg leading-relaxed font-light text-center max-w-5xl mx-auto">
                    Explora nuestro blog y mantente al día con artículos sobre vida saludable,
                    sostenibilidad, alimentación ecológica y consejos para aprovechar al máximo
                    los productos bio disponibles en nuestro marketplace.
                </p>
            </div>

            {/* Hero Carousel (Sección 2) */}
            <HeroCarousel />

            {/* Post Grid Carousel (Sección 3) */}
            <PostGridCarousel />

            {/* Featured Carousel (Sección 4) */}
            <FeaturedCarousel />

            {/* Podcast Section (Sección 5) */}
            <PodcastSection />

            {/* Video Gallery (Sección 6) */}
            <VideoGallery />

            {/* Comments Section (Sección 7) */}
            <CommentsSection />
        </div>
    );
}
