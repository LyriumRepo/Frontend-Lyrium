'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroPill from '@/components/layout/public/HeroPill';
import { forumApi, ForumTopic, ForumCategory } from '@/shared/lib/api/forum';
import Icon from '@/components/ui/Icon';
import { formatDate, getInitial } from '@/shared/lib/helpers';

function SafeImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return <Image {...props} src={src} alt={alt} onError={() => setErrored(true)} />;
}

const GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-emerald-600',
  'from-fuchsia-500 to-violet-600',
  'from-cyan-500 to-blue-600',
];

function topicGradient(id: number): string {
  return GRADIENTS[id % GRADIENTS.length];
}

function topicPlaceholderGradient(id: number): string {
  const gradients = [
    ['#059669', '#0d9488'],
    ['#0284c7', '#0891b2'],
    ['#7c3aed', '#9333ea'],
    ['#e11d48', '#db2777'],
    ['#d97706', '#ea580c'],
    ['#65a30d', '#4d7c0f'],
    ['#2563eb', '#4338ca'],
    ['#0d9488', '#059669'],
    ['#d946ef', '#7c3aed'],
    ['#06b6d4', '#0284c7'],
  ];
  const [c1, c2] = gradients[id % gradients.length];
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}

type SortMode = 'recent' | 'commented' | 'viewed' | 'reactions';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'recent', label: 'M\u00e1s recientes' },
  { value: 'commented', label: 'M\u00e1s comentados' },
  { value: 'viewed', label: 'M\u00e1s vistos' },
  { value: 'reactions', label: 'M\u00e1s reacciones' },
];

export default function BioForoPage() {
  const [forums, setForums] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [sharedId, setSharedId] = useState<number | null>(null);
  const [shareTopic, setShareTopic] = useState<ForumTopic | null>(null);
  const [selectedForum, setSelectedForum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [stats, setStats] = useState({ totalTopics: 0, totalReplies: 0, onlineUsers: 0 });

  useEffect(() => { loadData(); }, [selectedForum]);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalTopics: topics.length,
      totalReplies: topics.reduce((acc, t) => acc + (t.reply_count || 0), 0),
    }));
  }, [topics]);

  useEffect(() => {
    forumApi.getStats().then(data => {
      if (data) setStats(prev => ({ ...prev, onlineUsers: data.onlineUsers ?? 0 }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filtro-dropdown-container')) setShowDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [forumsData, topicsData] = await Promise.all([
        forumApi.getCategories(),
        forumApi.getTopics({ forum: selectedForum || undefined }),
      ]);
      setForums(Array.isArray(forumsData) ? forumsData : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedTopics = useMemo(() => {
    const list = [...topics];
    switch (sortMode) {
      case 'recent':
        return list.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      case 'commented':
        return list.sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0));
      case 'viewed':
        return list.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'reactions':
        return list.sort((a, b) => (b.votes_up || 0) - (a.votes_up || 0));
      default:
        return list;
    }
  }, [topics, sortMode]);

  const trendingTopics = useMemo(() => {
    return [...topics]
      .sort((a, b) => (b.votes_up || 0) - (a.votes_up || 0))
      .slice(0, 4);
  }, [topics]);

  const latestTopics = useMemo(() => {
    return [...topics]
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      .slice(0, 3);
  }, [topics]);

  const mostCommented = useMemo(() => {
    return [...topics]
      .sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0))
      .slice(0, 4);
  }, [topics]);

  const topViewed = useMemo(() => {
    return [...topics]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);
  }, [topics]);

  const allFeaturedIds = useMemo(() => {
    const ids = new Set<number>();
    trendingTopics.forEach(t => ids.add(t.id));
    latestTopics.forEach(t => ids.add(t.id));
    mostCommented.forEach(t => ids.add(t.id));
    topViewed.forEach(t => ids.add(t.id));
    return ids;
  }, [trendingTopics, latestTopics, mostCommented, topViewed]);

  function TopicImg({ topic }: { topic: ForumTopic }) {
    return (
      <>
        {topic.image ? (
          <img
            src={topic.image}
            alt={topic.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
          />
        ) : null}
        <div
          className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${topic.image ? 'hidden' : ''}`}
          style={{ background: topicPlaceholderGradient(topic.id) }}
        />
      </>
    );
  }

  function TrendingCard({ topic }: { topic: ForumTopic }) {
    return (
      <Link href={`/bioforo/${topic.id}`} className="group block bg-white dark:bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5">
        <div className="relative aspect-[4/3] overflow-hidden">
          <TopicImg topic={topic} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 bg-rose-500/90 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Icon name="Flame" className="w-3 h-3" />
              {topic.votes_up || 0}
            </span>
            <span className="px-2.5 py-1 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
              {topic.forum_name || 'General'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            <h3 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-lg line-clamp-2">
              {topic.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-white/80 text-[10px]">
              <span>{topic.author_name || 'Anónimo'}</span>
              <span>•</span>
              <span>{formatDate(topic.created)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  function LatestCard({ topic }: { topic: ForumTopic }) {
    return (
      <Link href={`/bioforo/${topic.id}`} className="group flex gap-4 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 p-3">
        <div className="relative w-28 md:w-36 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0">
          <TopicImg topic={topic} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
          <div>
            <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
              {topic.forum_name || 'General'}
            </span>
            <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-[var(--text-primary)] leading-tight mt-1.5 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-lime-300 transition-colors">
              {topic.title}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-[var(--text-muted)]">
              <Icon name="Clock" className="w-3 h-3" />
              {formatDate(topic.created)}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Icon name="Heart" className="w-3 h-3" />
                {topic.votes_up || 0}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="MessageSquare" className="w-3 h-3" />
                {topic.reply_count || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  function CommentedCard({ topic }: { topic: ForumTopic }) {
    return (
      <Link href={`/bioforo/${topic.id}`} className="group block bg-white dark:bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden">
          <TopicImg topic={topic} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
              {topic.forum_name || 'General'}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[var(--bg-secondary)] shadow-lg flex flex-col items-center justify-center">
              <span className="text-base font-black text-sky-600 dark:text-lime-400 leading-none">{topic.reply_count || 0}</span>
              <span className="text-[7px] text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-wider font-semibold">resp</span>
            </div>
          </div>
        </div>
        <div className="p-3 md:p-4">
          <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-lime-300 transition-colors">
            {topic.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 dark:text-[var(--text-muted)]">
            <span>{getInitial(topic.author_name)}</span>
            <span>{topic.author_name || 'Anónimo'}</span>
            <span>•</span>
            <span>{formatDate(topic.created)}</span>
          </div>
        </div>
      </Link>
    );
  }

  function ViewedCard({ topic }: { topic: ForumTopic }) {
    return (
      <Link href={`/bioforo/${topic.id}`} className="group block bg-white dark:bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden">
          <TopicImg topic={topic} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-xl border border-white/20">
              <Icon name="Eye" className="w-5 h-5 text-white drop-shadow-lg" />
              <span className="text-white text-lg font-black drop-shadow-lg">{topic.views || 0}</span>
              <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">vistas</span>
            </div>
          </div>
        </div>
        <div className="p-3 md:p-4">
          <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-lime-300 transition-colors">
            {topic.title}
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] mt-1.5 line-clamp-1">
            {topic.author_name || 'Anónimo'} · {topic.forum_name || 'General'}
          </p>
        </div>
      </Link>
    );
  }

  function ExploreCard({ topic }: { topic: ForumTopic }) {
    return (
      <div className="group bg-white dark:bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <Link href={`/bioforo/${topic.id}`} className="block relative aspect-[16/9] overflow-hidden">
          <TopicImg topic={topic} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
              {topic.forum_name || 'General'}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-white/90 dark:bg-[var(--bg-secondary)]/90 rounded-full flex items-center justify-center shadow-lg">
              <Icon name="MessageCircle" className="w-5 h-5 text-sky-600 dark:text-lime-400" />
            </div>
          </div>
        </Link>
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[var(--text-muted)] mb-2.5">
            <span className="flex items-center gap-1">
              <Icon name="Eye" className="w-3.5 h-3.5" />
              {topic.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="MessageSquare" className="w-3.5 h-3.5" />
              {topic.reply_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Heart" className="w-3.5 h-3.5" />
              {topic.votes_up || 0}
            </span>
          </div>
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-[var(--text-primary)] leading-tight mb-2">
            <Link href={`/bioforo/${topic.id}`} className="hover:text-sky-600 dark:hover:text-lime-300 transition-colors">
              {topic.title}
            </Link>
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
            {topic.content.substring(0, 200)}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-lime-100 dark:to-emerald-100 flex items-center justify-center text-blue-700 dark:text-lime-600 font-bold text-xs flex-shrink-0">
                {getInitial(topic.author_name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-[var(--text-primary)] truncate">
                  {topic.author_name || 'Anónimo'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-[var(--text-muted)]">
                  {formatDate(topic.created)}
                </p>
              </div>
            </div>
            <Link
              href={`/bioforo/${topic.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-lime-50 hover:bg-sky-100 dark:hover:bg-lime-100 text-sky-600 dark:text-lime-600 transition-all text-[11px] font-semibold flex-shrink-0"
            >
              <span>Ver</span>
              <Icon name="ArrowRight" className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
      <div className="pt-6 pb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="h-px w-12 bg-emerald-500" />
          <span className="text-emerald-600 dark:text-lime-400 font-bold tracking-widest text-sm uppercase">Lyrium</span>
          <span className="h-px w-12 bg-emerald-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)] drop-shadow-sm uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-600 dark:text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-light mt-2 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-8 md:space-y-12">
      <HeroPill icon="MessageCircle" text="BioForo" />

      <section className="relative mt-2 md:mt-8 rounded-xl md:rounded-[24px] overflow-hidden shadow-lg md:shadow-2xl min-h-[160px] md:min-h-[320px] bg-[#0b1220] group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform group-hover:scale-105"
          style={{ backgroundImage: "url('https://img.freepik.com/foto-gratis/alegre-amigos-telefono-prado_23-2147656274.jpg?semt=ais_rp_progressive&w=740&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent dark:hidden" />
        <div className="absolute inset-0 hidden dark:block" style={{ background: 'linear-gradient(to right, color-mix(in srgb, var(--brand-green-hover) 80%, transparent), color-mix(in srgb, var(--brand-green) 40%, transparent), transparent)' }} />
        <div className="relative z-10 p-4 md:p-14 max-w-3xl text-white h-full flex flex-col justify-center">
          <h1 className="text-2xl md:text-6xl font-extrabold tracking-tight uppercase drop-shadow-xl mb-2 md:mb-4 leading-tight">
            Conecta <span className="text-[#2ea8ff] dark:text-lime-500">BioForo</span>
          </h1>
          <p className="text-xs md:text-base font-medium text-slate-200 tracking-widest uppercase mb-4 md:mb-8 max-w-lg leading-relaxed opacity-90">
            Explora foros destacados, nuevas ideas y una comunidad apasionada.
          </p>
          <div className="w-16 md:w-24 h-1 md:h-1.5 rounded-full bg-[#2ea8ff] dark:bg-[var(--icons-green)] shadow-[0_10px_25px_rgba(14,165,233,0.2)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)]" />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4 md:gap-8 items-center bg-white dark:bg-[var(--bg-secondary)] rounded-xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-slate-100 dark:border-[var(--border-subtle)]">
        <div className="rounded-lg md:rounded-2xl overflow-hidden shadow-md md:shadow-lg aspect-[4/3] relative group order-2 md:order-1 bg-gradient-to-br from-emerald-100/50 to-blue-100/50 dark:from-emerald-900/20 dark:to-blue-900/20">
          <SafeImage
            src="https://img.magnific.com/foto-gratis/primer-plano-mujer-trabajando-su-portatil-al-aire-libre_1150-380.jpg?semt=ais_hybrid&w=740&q=80"
            alt="BioForo Intro"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="flex flex-col gap-3 md:gap-6 order-1 md:order-2">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/40 dark:to-blue-900/40 border border-slate-200 grid place-items-center shadow-sm">
              <SafeImage
                src="https://img.magnific.com/foto-gratis/primer-plano-mujer-trabajando-su-portatil-al-aire-libre_1150-380.jpg?semt=ais_hybrid&w=740&q=80"
                alt="Icon"
                width={40}
                height={40}
                className="w-6 h-6 md:w-10 md:h-10 object-contain"
              />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-[var(--text-primary)] mb-1">Bienvenido a la comunidad</h3>
              <p className="text-slate-600 dark:text-[var(--text-muted)] leading-relaxed text-sm md:text-[15px]">
                <strong className="text-slate-900 dark:text-[var(--text-primary)]">BioForo</strong> es el espacio donde expertos, emprendedores y entusiastas se conectan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-200" />
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-300" />
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-400" />
            </div>
            <span className="text-xs md:text-sm font-semibold text-slate-500">&Uacute;nete a la conversaci&oacute;n</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="relative bg-white dark:bg-[var(--bg-secondary)] rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-4 shadow-sm border border-slate-100 dark:border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[9px] rounded-l-xl" style={{ background: '#67ce00' }} />
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(182, 255, 123)', color: '#499100' }}>
            <Icon name="TrendingUp" className="text-xl md:text-2xl" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-xs md:text-sm text-slate-500 dark:text-[var(--text-muted)] font-normal">Temas activos</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)]">{stats.totalTopics}</p>
          </div>
        </div>
        <div className="relative bg-white dark:bg-[var(--bg-secondary)] rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-4 shadow-sm border border-slate-100 dark:border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[9px] rounded-l-xl" style={{ background: '#78e69d' }} />
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ccfbf1', color: '#019895' }}>
            <Icon name="MessageSquare" className="text-xl md:text-2xl" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-xs md:text-sm text-slate-500 dark:text-[var(--text-muted)] font-normal">Respuestas</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)]">{stats.totalReplies}</p>
          </div>
        </div>
        <div className="relative bg-white dark:bg-[var(--bg-secondary)] rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-4 shadow-sm border border-slate-100 dark:border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[9px] rounded-l-xl" style={{ background: '#3b82f6' }} />
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dbeafe', color: '#3b82f6' }}>
            <Icon name="Users" className="text-xl md:text-2xl" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-xs md:text-sm text-slate-500 dark:text-[var(--text-muted)] font-normal">Usuarios en l&iacute;nea</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] flex items-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              {stats.onlineUsers || 23}
            </p>
          </div>
        </div>
        <div className="relative bg-white dark:bg-[var(--bg-secondary)] rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-4 shadow-sm border border-slate-100 dark:border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[9px] rounded-l-xl" style={{ background: '#f59e0b' }} />
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Icon name="Heart" className="text-xl md:text-2xl" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-xs md:text-sm text-slate-500 dark:text-[var(--text-muted)] font-normal">Reacciones</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)]">{topics.reduce((acc, t) => acc + (t.votes_up || 0) + (t.votes_down || 0), 0)}</p>
          </div>
        </div>
      </div>

      {!loading && topics.length > 0 && (
        <>
          <section>
            <SectionHeader title="En tendencia" subtitle="Los temas con m&aacute;s reacciones de la comunidad" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {trendingTopics.map(topic => (
                <TrendingCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="&Uacute;ltimos temas" subtitle="Las discusiones m&aacute;s recientes del foro" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {latestTopics.map(topic => (
                <LatestCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="M&aacute;s comentados" subtitle="Los temas que generan m&aacute;s conversaci&oacute;n" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {mostCommented.map(topic => (
                <CommentedCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="M&aacute;s vistos" subtitle="Los temas con mayor cantidad de visitas" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {topViewed.map(topic => (
                <ViewedCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>
        </>
      )}

      <section>
        <SectionHeader title="Explorar todos los temas" subtitle="Navega por todos los temas del foro" />

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-stretch md:items-center">
          <div className="flex-1 flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative w-full md:w-auto filtro-dropdown-container">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between md:justify-start gap-2 px-4 py-2 rounded-full bg-white dark:bg-[var(--bg-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] hover:bg-slate-50 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] transition-all w-full md:w-auto text-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon name="Filter" className="w-4 h-4" />
                  <span className="truncate">{selectedForum ? (forums.find(f => f.id === selectedForum)?.name || 'Categoría') : 'Filtrar categoría'}</span>
                </div>
                <Icon name="ChevronDown" className="w-4 h-4" />
              </button>

              {showDropdown && (
                <div className="filtro-dropdown show absolute top-full left-0 mt-1 bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-slate-200 dark:border-[var(--border-subtle)] py-2 z-[9999] min-w-[200px]">
                  <button
                    onClick={() => { setSelectedForum(null); setShowDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] flex items-center gap-2 text-sm ${selectedForum === null ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}
                  >
                    <Icon name="Globe" className="w-4 h-4" />
                    <span>Todas las categorías</span>
                  </button>
                  {forums.map(forum => (
                    <button
                      key={forum.id}
                      onClick={() => { setSelectedForum(forum.id); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] flex items-center gap-2 text-sm ${selectedForum === forum.id ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}
                    >
                      <Icon name="FolderTree" className="w-4 h-4" />
                      <span>{forum.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedForum && (
              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium flex items-center justify-between md:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <Icon name="Check" className="w-4 h-4" />
                  <span className="truncate">
                    {forums.find(f => f.id === selectedForum)?.name || 'Categoría'}
                  </span>
                </div>
                <button onClick={() => setSelectedForum(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300">
                  <Icon name="X" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  sortMode === opt.value
                    ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-md'
                    : 'bg-white dark:bg-[var(--bg-secondary)] text-slate-600 dark:text-[var(--text-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] hover:bg-slate-50 dark:hover:bg-[#182420]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="px-4 py-2 rounded-full bg-slate-100 dark:bg-[var(--bg-secondary)] text-slate-400 dark:text-[var(--text-muted)] text-xs font-medium flex items-center gap-2 flex-shrink-0">
            <Icon name="Lock" className="w-3.5 h-3.5" />
            <span>Crear temas desde el panel Seller</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="loader-small" />
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-slate-200 dark:border-[var(--border-subtle)]">
            <Icon name="MessageCircle" className="w-12 h-12 text-slate-300 dark:text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">No hay temas a&uacute;n</h3>
            <p className="text-slate-500 dark:text-[var(--text-secondary)] mb-4 md:mb-6 text-sm md:text-base">S&eacute; el primero en crear un tema de discusi&oacute;n</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-[var(--bg-secondary)] text-slate-400 dark:text-[var(--text-muted)] text-sm font-medium">
              <Icon name="Lock" className="w-4 h-4" />
              Crear temas desde el panel Seller
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {sortedTopics.map(topic => (
              <ExploreCard key={`${topic.id}-${sortMode}`} topic={topic} />
            ))}
          </div>
        )}

        {!loading && topics.length > 0 && (
          <div className="flex justify-center mt-6">
            <span className="text-slate-500 dark:text-[var(--text-muted)] text-sm">
              {topics.length} temas mostrados
            </span>
          </div>
        )}
      </section>

      {shareTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShareTopic(null)}>
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)]">Compartir</h3>
              <button onClick={() => setShareTopic(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition">
                <Icon name="X" className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-[var(--text-muted)] mb-4 line-clamp-2">{shareTopic.title}</p>

            <div className="grid grid-cols-4 gap-3 mb-5">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareTopic.title + ' ' + window.location.origin + '/bioforo/' + shareTopic.id)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"><Icon name="MessageCircle" className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">WhatsApp</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/bioforo/' + shareTopic.id)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><Icon name="Facebook" className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">Facebook</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTopic.title + ' ' + window.location.origin + '/bioforo/' + shareTopic.id)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600"><Icon name="Twitter" className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">Twitter / X</span>
              </a>
              <a href={`mailto:?subject=${encodeURIComponent(shareTopic.title)}&body=${encodeURIComponent(window.location.origin + '/bioforo/' + shareTopic.id)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition">
                <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600"><Icon name="Mail" className="w-5 h-5" /></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-[var(--text-muted)]">Correo</span>
              </a>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[var(--bg-card)] rounded-xl">
              <input type="text" readOnly value={`${window.location.origin}/bioforo/${shareTopic.id}`} className="flex-1 text-xs bg-transparent text-slate-600 dark:text-[var(--text-muted)] outline-none truncate" />
              <button onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/bioforo/${shareTopic.id}`); setSharedId(shareTopic.id); setTimeout(() => setSharedId(null), 2000); }} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition shrink-0">
                <Icon name={sharedId === shareTopic.id ? 'Check' : 'File'} className="w-3.5 h-3.5" />
                {sharedId === shareTopic.id ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .filtro-dropdown { display: none; }
        .filtro-dropdown.show { display: block; animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .loader-small {
          width: 12px; height: 12px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
