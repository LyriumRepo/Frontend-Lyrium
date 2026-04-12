'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, User, Link as LinkIcon, Send, Bold, Italic, Underline, Image, Check } from 'lucide-react';

export default function CommentsSection() {
    const [notify, setNotify] = useState(false);

    return (
        <div className="w-full pb-20 px-4 max-w-7xl mx-auto">
            {/* Cabecera de Comentarios Premium */}
            <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <MessageCircle className="text-lg" />
                    Comunidad Lyrium
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] tracking-tight">
                    Comparte tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-600">Opinión</span>
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-full mt-6" />
            </div>

            {/* Sección de Comentarios */}
            <div className="w-full bg-white/60 dark:bg-[var(--bg-secondary)]/60 backdrop-blur-md border border-white/50 dark:border-[var(--border-subtle)] rounded-[2.5rem] p-6 md:p-12 shadow-xl mt-12 mb-20 relative overflow-hidden">
                {/* Decoración de Fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100/50 dark:from-sky-900/20 to-transparent rounded-bl-[100%] z-0 pointer-events-none" />

                {/* Header: Título y Acciones */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-slate-200/60 dark:border-[var(--border-subtle)] pb-6">
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                            <span className="text-sky-500">
                                <MessageCircle className="w-8 h-8" />
                            </span>
                            Comentarios
                        </h3>
                        <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm font-medium mt-2 ml-1">
                            Tu opinión es importante para nuestra comunidad.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Botón Suscribirse */}
                        <button
                            type="button"
                            className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 text-white text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-500/30 hover:scale-105 active:scale-95"
                        >
                            <Mail className="text-white/90 group-hover:scale-110 transition-transform duration-300 text-sm" />
                            <span>Suscríbete</span>
                        </button>
                        {/* Login Link */}
                        <Link
                            href="/login"
                            className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 text-white text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-500/30 hover:scale-105 active:scale-95"
                        >
                            <User className="transition-transform duration-300 group-hover:translate-x-1" />
                            <span>Iniciar Sesión</span>
                        </Link>
                    </div>
                </div>

                {/* Formulario Principal */}
                <form method="post" encType="multipart/form-data" className="relative z-10 space-y-8">
                    {/* Editor de Comentario */}
                    <div className="flex gap-4 md:gap-6 items-start">
                        {/* Avatar Artificial */}
                        <div className="flex-shrink-0 hidden md:block">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 dark:from-[#2A3F33] to-slate-200 dark:to-[var(--bg-secondary)] border-2 border-white dark:border-[var(--border-subtle)] shadow-md flex items-center justify-center text-slate-400 dark:text-[var(--text-secondary)]">
                                <User className="text-xl" />
                            </div>
                        </div>

                            {/* Área de Texto con Diseño Premium */}
                        <div className="flex-1 w-full relative group">
                            {/* Glow Effect focus */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-2xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur-sm" />

                            <div className="relative bg-white dark:bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-slate-200 dark:border-[var(--border-subtle)] hover:border-sky-300 transition-colors duration-300 overflow-hidden group-focus-within:shadow-md group-focus-within:border-sky-400">
                                <textarea
                                    name="wc_comment"
                                    id="wc_comment"
                                    aria-label="Escribir comentario"
                                    className="w-full h-40 p-5 border-none focus:ring-0 text-slate-700 dark:text-[var(--text-primary)] placeholder:text-slate-400/80 dark:placeholder:text-[#9BAF9F] text-base leading-relaxed bg-transparent resize-y min-h-[160px]"
                                    placeholder="Comparte tu experiencia, dudas o sugerencias..."
                                />

                                {/* Simulated Toolbar */}
                                <div className="bg-slate-50/50 dark:bg-[var(--bg-secondary)]/50 px-4 py-3 border-t border-slate-100 dark:border-[var(--border-subtle)] flex items-center gap-4 text-slate-400 dark:text-[var(--text-secondary)] text-sm">
                                    <div className="flex gap-2">
                                        <button type="button" aria-label="Aplicar negrita" className="p-1.5 hover:bg-white dark:hover:bg-[#2A3F33] hover:text-sky-600 rounded transition-colors">
                                            <Bold className="w-4 h-4" />
                                        </button>
                                        <button type="button" aria-label="Aplicar cursiva" className="p-1.5 hover:bg-white dark:hover:bg-[#2A3F33] hover:text-sky-600 rounded transition-colors">
                                            <Italic className="w-4 h-4" />
                                        </button>
                                        <button type="button" aria-label="Aplicar subrayado" className="p-1.5 hover:bg-white dark:hover:bg-[#2A3F33] hover:text-sky-600 rounded transition-colors">
                                            <Underline className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-[var(--border-subtle)]" />
                                    <div>
                                        <button
                                            type="button"
                                            aria-label="Adjuntar foto"
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[var(--bg-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] hover:border-sky-300 text-xs font-bold text-slate-500 dark:text-[var(--text-secondary)] hover:text-sky-600 rounded-lg transition-all shadow-sm"
                                        >
                                            <Image className="w-4 h-4" aria-hidden="true" />
                                            <span className="hidden sm:inline">Adjuntar Foto</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Campos Personales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Nombre */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors z-10">
                                <User className="text-sm" />
                            </div>
                            <label htmlFor="wc_name" className="sr-only">Nombre</label>
                            <input
                                type="text"
                                name="wc_name"
                                id="wc_name"
                                placeholder="Tu Nombre *"
                                aria-label="Tu nombre"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[var(--bg-primary)] hover:bg-white dark:hover:bg-[#111A15] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-slate-700 dark:text-[var(--text-primary)] text-sm font-medium focus:bg-white dark:focus:bg-[#111A15] focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-sm transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-[#9BAF9F]"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors z-10">
                                <Mail className="text-sm" />
                            </div>
                            <label htmlFor="wc_email" className="sr-only">Email</label>
                            <input
                                type="email"
                                name="wc_email"
                                id="wc_email"
                                placeholder="Tu Email *"
                                aria-label="Tu correo electrónico"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[var(--bg-primary)] hover:bg-white dark:hover:bg-[#111A15] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-slate-700 dark:text-[var(--text-primary)] text-sm font-medium focus:bg-white dark:focus:bg-[#111A15] focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-sm transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-[#9BAF9F]"
                            />
                        </div>

                        {/* Website */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors z-10">
                                <LinkIcon className="text-sm" />
                            </div>
                            <input
                                type="url"
                                name="wc_website"
                                placeholder="Sitio Web (Opcional)"
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[var(--bg-primary)] hover:bg-white dark:hover:bg-[#111A15] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-slate-700 dark:text-[var(--text-primary)] text-sm font-medium focus:bg-white dark:focus:bg-[#111A15] focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-sm transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-[#9BAF9F]"
                            />
                        </div>
                    </div>

                    {/* Footer del Formulario */}
                    <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 pt-4 border-t border-slate-100 dark:border-[var(--border-subtle)]">
                        {/* Checkbox Notificaciones */}
                        <label className="group flex items-center space-x-3 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111A15] transition-colors">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    name="wpdiscuz_notification_type"
                                    value="comment"
                                    checked={notify}
                                    onChange={(e) => setNotify(e.target.checked)}
                                    className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 dark:border-[var(--border-subtle)] checked:border-sky-500 checked:bg-sky-500 transition-all duration-200 bg-white dark:bg-[var(--bg-primary)]"
                                />
                                <Check className="text-white text-[10px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity w-3 h-3" />
                            </div>
                            <span className="text-sm font-semibold text-slate-500 dark:text-[var(--text-secondary)] group-hover:text-slate-700 dark:group-hover:text-[#E8EDE9] transition-colors">
                                Notificarme nuevas respuestas
                            </span>
                        </label>

                        {/* Botón Enviar */}
                        <button
                            type="submit"
                            name="submit"
                            className="relative overflow-hidden w-full md:w-auto px-10 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-black uppercase tracking-wider text-sm rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 active:scale-95 transition-all duration-300 group"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Publicar Comentario
                                <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform w-4 h-4" />
                            </span>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </button>
                    </div>

                    <input type="hidden" name="wpdiscuz_unique_id" value="0_0" />
                </form>
            </div>
        </div>
    );
}
