'use client';

import { useState, useEffect } from 'react';
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

export default function BioForoPage() {
  const [forums, setForums] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [sharedId, setSharedId] = useState<number | null>(null);
  const [shareTopic, setShareTopic] = useState<ForumTopic | null>(null);
  const [selectedForum, setSelectedForum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [stats, setStats] = useState({ totalTopics: 0, totalReplies: 0 });

  useEffect(() => {
    loadData();
  }, [selectedForum]);

  useEffect(() => {
    setStats({
      totalTopics: topics.length,
      totalReplies: topics.reduce((acc, t) => acc + (t.reply_count || 0), 0),
    });
  }, [topics]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filtro-dropdown-container')) {
        setShowDropdown(false);
      }
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

  return (
    <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-6 md:space-y-10">
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
            <span className="text-xs md:text-sm font-semibold text-slate-500">Únete a la conversación</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
            <p className="text-xs md:text-sm text-slate-500 dark:text-[var(--text-muted)] font-normal">Usuarios en línea</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] flex items-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              23
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8 items-stretch md:items-center">
        <div className="flex-1 flex flex-col md:flex-row gap-2 md:items-center">
          <div className="relative w-full md:w-auto filtro-dropdown-container">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between md:justify-start gap-2 px-4 py-2 rounded-full bg-white dark:bg-[var(--bg-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] hover:bg-slate-50 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] transition-all w-full md:w-auto"
            >
              <div className="flex items-center gap-2">
                <Icon name="Filter" className="w-4 h-4" />
                <span className="truncate">Filtrar categoría</span>
              </div>
              <Icon name="ChevronDown" className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="filtro-dropdown show absolute top-full left-0 mt-1 bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-slate-200 dark:border-[var(--border-subtle)] py-2 z-[9999] min-w-[200px]">
                <button
                  onClick={() => { setSelectedForum(null); setShowDropdown(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] flex items-center gap-2 ${selectedForum === null ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}
                >
                  <Icon name="Globe" className="w-4 h-4" />
                  <span>Todas las categorías</span>
                </button>
                {forums.map((forum) => (
                  <button
                    key={forum.id}
                    onClick={() => { setSelectedForum(forum.id); setShowDropdown(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] flex items-center gap-2 ${selectedForum === forum.id ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}
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
                  {forums.find((f) => f.id === selectedForum)?.name || 'Categoría'}
                </span>
              </div>
              <button onClick={() => setSelectedForum(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300">
                <Icon name="X" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <Link
          href="/bioforo/crear"
          className="bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white px-4 py-3 rounded-full font-semibold shadow-lg shadow-[0_10px_25px_rgba(14,165,233,0.2)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Icon name="Pencil" className="w-4 h-4" />
          <span className="truncate">Crear Nuevo Tema</span>
        </Link>
      </div>

      <div className="space-y-4 md:space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loader-small" />
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-slate-200 dark:border-[var(--border-subtle)]">
            <Icon name="MessageCircle" className="w-12 h-12 text-slate-300 dark:text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">No hay temas aún</h3>
            <p className="text-slate-500 dark:text-[var(--text-secondary)] mb-4 md:mb-6 text-sm md:text-base">Sé el primero en crear un tema de discusión</p>
            <Link
              href="/bioforo/crear"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-medium inline-flex items-center gap-2 text-sm md:text-base"
            >
              <Icon name="Plus" className="w-4 h-4" />
              Crear primer tema
            </Link>
          </div>
        ) : (
          topics.map((topic) => (
            <div
              key={topic.id}
              id={`tema-${topic.id}`}
              className="bg-white dark:bg-[var(--bg-secondary)] border-[3px] border-[#009a6279] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all"
              style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 flex items-start gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-lime-100 dark:to-emerald-100 flex items-center justify-center text-blue-700 dark:text-lime-600 font-bold text-lg md:text-xl flex-shrink-0">
                    {getInitial(topic.author_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-[var(--text-primary)] text-base md:text-lg">
                          {topic.author_name || 'Anónimo'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" className="w-3 h-3" />
                            {formatDate(topic.created)}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            {topic.forum_name || 'General'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row items-center gap-4">
                        <div className="text-center">
                          <div className="text-base md:text-lg font-bold text-slate-800 dark:text-[var(--text-primary)]">
                            {topic.votes_up || 0}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-[var(--text-muted)]">Reacciones</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base md:text-lg font-bold text-slate-800 dark:text-[var(--text-primary)]">
                            {topic.reply_count || 0}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-[var(--text-muted)]">Respuestas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <h3
                  className="text-[#333333] dark:text-[var(--text-primary)] font-bold text-lg md:text-xl underline decoration-dashed decoration-lime-400 decoration-3 underline-offset-[9px]"
                  style={{ textUnderlinePosition: 'from-word' }}
                >
                  {topic.title}
                </h3>
                <br />
                <p className="text-[#00866d] dark:text-[#00a87e] font-semibold leading-relaxed" style={{ fontWeight: 600, lineHeight: 1.6 }}>
                  {topic.content.substring(0, 300) || ''}
                </p>
                <br />
              </div>

              <div className="flex items-center justify-between md:justify-between border-t border-slate-100 dark:border-[var(--border-subtle)] pt-3 md:pt-4 gap-2">
                <Link
                  href={`/bioforo/${topic.id}`}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-blue-50 dark:bg-lime-50 hover:bg-blue-100 dark:hover:bg-lime-100 text-blue-700 dark:text-lime-700 transition-all text-xs md:text-sm"
                >
                  <Icon name="MessageCircle" className="w-4 h-4" />
                  <span>Ver tema</span>
                </Link>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: topic.title, url: `${window.location.origin}/bioforo/${topic.id}` });
                    } else {
                      setShareTopic(topic);
                    }
                  }}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-slate-50 dark:bg-[var(--bg-secondary)] hover:bg-slate-100 text-slate-700 dark:text-[var(--text-primary)] transition-all text-xs md:text-sm"
                >
                  <Icon name="Share2" className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center">
        <span className="text-slate-500 dark:text-[var(--text-muted)] text-sm">
          {topics.length} temas mostrados
        </span>
      </div>

      {/* Share Modal */}
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
        .filtro-dropdown {
          display: none;
        }
        .filtro-dropdown.show {
          display: block;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .loader-small {
          width: 12px;
          height: 12px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
