'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { blogApi } from '@/shared/lib/api/blog';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface HeroPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    category_name: string;
    published_at: string;
}

export default function HeroCarousel() {
    const [posts, setPosts] = useState<HeroPost[]>([]);

    useEffect(() => {
        blogApi.getFeaturedPosts(4).then(setPosts).catch(console.error);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="w-full pb-16 px-4 max-w-[1920px] mx-auto overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="relative px-0 md:px-12">
                {/* Custom Navigation Arrows */}
                <button
                    id="hero-prev-btn"
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-sky-500 dark:hover:bg-[var(--brand-green)] text-white cursor-pointer transition-all duration-300 flex items-center justify-center group"
                >
                    <ChevronLeft className="w-5 h-5 md:w-8 md:h-8 transform group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                    id="hero-next-btn"
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-sky-500 dark:hover:bg-[var(--brand-green)] text-white cursor-pointer transition-all duration-300 flex items-center justify-center group"
                >
                    <ChevronRight className="w-5 h-5 md:w-8 md:h-8 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
                    effect="coverflow"
                    centeredSlides={true}
                    slidesPerView="auto"
                    spaceBetween={30}
                    loop={true}
                    speed={1000}
                    grabCursor={true}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: false,
                    }}
                    autoplay={{
                        delay: 6000,
                        disableOnInteraction: false,
                    }}
                    navigation={{
                        prevEl: '#hero-prev-btn',
                        nextEl: '#hero-next-btn',
                    }}
                    pagination={{
                        el: '.swiper-pagination',
                        clickable: true,
                        renderBullet: (index, className) => {
                            return `<span class="${className} w-3 h-3 bg-slate-300 dark:bg-white/30 hover:bg-slate-500 dark:hover:bg-white/60 transition-all duration-300"></span>`;
                        },
                    }}
                    breakpoints={{
                        768: {
                            slidesPerView: 'auto',
                            spaceBetween: 30,
                        },
                    }}
                    className="swiper w-full h-[360px] min-[360px]:h-[440px] md:h-[650px] overflow-visible"
                >
                    {posts.map((post) => (
                        <SwiperSlide
                            key={post.id}
                            className="w-full md:w-[85%] lg:w-[70%] h-full transition-transform duration-500 scale-95 opacity-90 swiper-slide-active:scale-100 swiper-slide-active:opacity-100"
                        >
                            <div className="relative w-full h-[320px] min-[360px]:h-[400px] md:h-full rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer">
                                {/* Background Image with Zoom Effect */}
                                <Image
                                    src={post.featured_image}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 70vw"
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent" />

                                {/* Content Container */}
                                <div className="absolute inset-0 p-4 min-[360px]:p-6 md:p-16 flex flex-col justify-end md:justify-center items-start max-w-2xl">
                                    {/* Category Pill */}
                                    <div className="mb-2 md:mb-6 overflow-hidden">
                                        <span className="inline-block px-4 py-1.5 bg-sky-500/20 dark:bg-[var(--icons-green)] backdrop-blur-md border border-sky-400/30 text-sky-300 dark:text-[var(--brand-green-hover)] rounded-full text-xs font-black tracking-widest uppercase transform transition-transform duration-500 translate-y-0 group-hover:-translate-y-1">
                                            {post.category_name}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-lg min-[360px]:text-xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-3 md:mb-6 drop-shadow-lg line-clamp-2">
                                        <Link
                                            href={`/bioblog/${post.slug}`}
                                            className="hover:text-sky-400 transition-colors duration-300"
                                        >
                                            {post.title}
                                        </Link>
                                    </h2>

                                    {/* Date & Excerpt */}
                                    <div className="flex flex-col gap-2 md:gap-4">
                                        <div className="flex items-center gap-2 md:gap-3 text-slate-300 text-[9px] md:text-xs font-bold tracking-widest uppercase">
                                            <span className="text-sky-500 dark:text-[var(--icons-green)]">BY LYRIUM</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                                            <span>{formatDate(post.published_at)}</span>
                                        </div>
                                        <p className="text-slate-300 text-lg line-clamp-2 max-w-lg hidden md:block">
                                            {post.excerpt}
                                        </p>
                                    </div>

                                    {/* Call to Action */}
                                    <div className="mt-4 md:mt-8">
                                        <Link
                                            href={`/bioblog/${post.slug}`}
                                            className="inline-flex items-center gap-2 text-white font-bold tracking-widest text-sm hover:gap-4 transition-all duration-300 group/btn"
                                        >
                                            LEER ARTÍCULO
                                            <ChevronRight className="text-sky-500 dark:text-[var(--icons-green)] group-hover/btn:text-white transition-colors" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                    <div className="swiper-pagination !bottom-2 min-[360px]:!bottom-3 !left-0 !right-0 !w-full text-center" />
                </Swiper>
            </div>
        </div>
    );
}
