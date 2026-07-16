import type { Metadata } from 'next';
import { Suspense } from 'react';
import BioBlogHero from './components/BioBlogHero';
import HeroCarousel from './components/HeroCarousel';
import PostGridCarousel from './components/PostGridCarousel';
import FeaturedCarousel from './components/FeaturedCarousel';
import PodcastSection from './components/PodcastSection';
import ShortsSection from './components/ShortsSection';
import VideoGallery from './components/VideoGallery';
import SectionHeader from './components/SectionHeader';
import AnimatedWrapper from './components/AnimatedWrapper';

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

            {/* Hero Banner Carrusel */}
            <AnimatedWrapper>
                <HeroCarousel />
            </AnimatedWrapper>

            {/* Últimas Publicaciones */}
            <SectionHeader
                label="Novedades"
                title="ÚLTIMAS PUBLICACIONES"
                description="Los artículos más recientes sobre vida saludable, sostenibilidad y alimentación ecológica."
            />
            <AnimatedWrapper>
                <PostGridCarousel />
            </AnimatedWrapper>

            {/* Destacados */}
            <SectionHeader
                label="Lo Mejor"
                title="DESTACADOS"
                description="Artículos seleccionados por su calidad e impacto para ayudarte a vivir mejor."
            />
            <AnimatedWrapper>
                <FeaturedCarousel />
            </AnimatedWrapper>

            {/* Podcast Section */}
            <AnimatedWrapper>
                <PodcastSection />
            </AnimatedWrapper>

            {/* Shorts Section */}
            <AnimatedWrapper>
                <ShortsSection />
            </AnimatedWrapper>

            {/* Video Gallery */}
            <AnimatedWrapper>
                <VideoGallery />
            </AnimatedWrapper>
        </div>
    );
}
