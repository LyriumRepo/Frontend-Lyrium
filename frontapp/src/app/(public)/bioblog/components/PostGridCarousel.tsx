'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { blogApi } from '@/shared/lib/api/blog';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    category_name: string;
    published_at: string;
}

export default function PostGridCarousel() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        blogApi.getRecentPosts(6).then(setPosts).catch(console.error);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="w-full py-16 px-4 max-w-[1600px] mx-auto bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="relative md:px-12">
                {/* Custom Navigation Arrows */}
                <button
                    id="alter-prev-btn"
                    className="hidden md:block absolute md:left-0 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors cursor-pointer z-50 p-2"
                >
                    <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 transform rotate-180" />
                </button>
                <button
                    id="alter-next-btn"
                    className="hidden md:block absolute md:right-0 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors cursor-pointer z-50 p-2"
                >
                    <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                </button>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    slidesPerView={1}
                    slidesPerGroup={1}
                    spaceBetween={20}
                    loop={true}
                    speed={600}
                    grabCursor={true}
                    observer={true}
                    observeParents={true}
                    watchSlidesProgress={true}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    navigation={{
                        prevEl: '#alter-prev-btn',
                        nextEl: '#alter-next-btn',
                    }}
                    pagination={{
                        el: '.swiper-pagination',
                        clickable: true,
                    }}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 3, spaceBetween: 30 },
                        1280: { slidesPerView: 3, spaceBetween: 40 },
                    }}
                    className="swiper overflow-visible"
                >
                    {posts.map((post) => (
                        <SwiperSlide key={post.id} className="h-auto">
                            <div className="flex flex-col h-[450px] group bg-white dark:bg-[var(--bg-secondary)] border border-slate-100 dark:border-[var(--border-subtle)] rounded-[2rem] p-5 shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-500">
                                {/* Imagen: Rectangular */}
                                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl mb-5">
                                    <Image
                                        src={post.featured_image}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                {/* Contenido */}
                                <div className="flex flex-col flex-grow">
                                    {/* Categoría */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] md:text-xs font-black text-sky-500 uppercase tracking-widest leading-none">
                                            {post.category_name}
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] leading-tight mb-3 group-hover:text-sky-600 transition-colors line-clamp-2">
                                        <Link href={`/bioblog/${post.slug}`}>{post.title}</Link>
                                    </h3>

                                    {/* Extracto */}
                                    <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm leading-relaxed mb-4 line-clamp-3 font-medium text-justify">
                                        {post.excerpt}
                                    </p>

                                    {/* Footer */}
                                    <div className="mt-auto text-[10px] font-bold text-slate-400 dark:text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
                                        LYRIUM <span className="text-slate-300">|</span> {formatDate(post.published_at)}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                    <div className="swiper-pagination !relative !mt-8" />
                </Swiper>
            </div>
        </div>
    );
}
