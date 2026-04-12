'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
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
    comments_count: number;
}

export default function FeaturedCarousel() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        blogApi.getFeaturedPosts(4).then(setPosts).catch(console.error);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="w-full py-16 px-4 max-w-[1600px] mx-auto bg-slate-50 dark:bg-[var(--bg-primary)]">
            <div className="relative md:px-12">
                {/* Navigation */}
                <button
                    id="ramble-prev-btn"
                    className="hidden md:block absolute md:left-0 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors cursor-pointer z-50 p-2"
                >
                    <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 transform rotate-180" />
                </button>
                <button
                    id="ramble-next-btn"
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
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    navigation={{
                        prevEl: '#ramble-prev-btn',
                        nextEl: '#ramble-next-btn',
                    }}
                    pagination={{
                        el: '.swiper-pagination',
                        clickable: true,
                    }}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 3, spaceBetween: 30 },
                        1280: { slidesPerView: 4, spaceBetween: 30 },
                    }}
                    className="swiper overflow-visible"
                >
                    {posts.map((post) => (
                        <SwiperSlide key={post.id} className="h-auto">
                            <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl bg-slate-900 border border-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                                {/* Background Image */}
                                <Image
                                    src={post.featured_image}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                                />
                                {/* Dark Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

                                {/* Top Left: Logo & Metadata */}
                                <div className="absolute top-8 left-8 flex flex-col items-start gap-2">
                                    <Image
                                        src="/img/bioblog/ICON.png"
                                        alt="Lyrium"
                                        width={40}
                                        height={40}
                                        className="rounded-full shadow-lg"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-tight">
                                            LYRIUM
                                        </span>
                                        <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                            {formatDate(post.published_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Content */}
                                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                                    <h3 className="text-3xl font-bold text-white leading-tight mb-3 drop-shadow-md line-clamp-2">
                                        {post.title}
                                    </h3>

                                    <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-8 line-clamp-2 max-w-2xl text-justify">
                                        {post.excerpt}
                                    </p>

                                    {/* Footer Bar */}
                                    <div className="w-full flex justify-between items-center py-4 border-t border-white/20">
                                        <Link href={`/bioblog/${post.slug}`} className="text-xs font-bold text-white hover:text-sky-300 transition-colors">
                                            Leer Más
                                        </Link>
                                        <span className="text-xs text-white/60 font-medium flex items-center gap-1">
                                            <MessageCircle className="w-3 h-3" />
                                            {post.comments_count} Comments
                                        </span>
                                    </div>
                                </div>
                                <Link href={`/bioblog/${post.slug}`} className="absolute inset-0 z-20" />
                            </div>
                        </SwiperSlide>
                    ))}
                    <div className="swiper-pagination !relative !mt-8" />
                </Swiper>
            </div>
        </div>
    );
}
