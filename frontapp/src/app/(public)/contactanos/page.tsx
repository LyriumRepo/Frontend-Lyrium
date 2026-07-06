'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import IntroCover from '@/components/ui/IntroCover';

export default function ContactPage() {
    const [showIntro, setShowIntro] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        privacy: false,
    });
    const [charCount, setCharCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (name === 'message') {
                setCharCount(value.length);
            }
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
        if (!formData.subject.trim()) newErrors.subject = 'El asunto es requerido';
        if (!formData.message.trim()) newErrors.message = 'El mensaje es requerido';
        if (!formData.privacy) newErrors.privacy = 'Debes aceptar la política de privacidad';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '', privacy: false });
            setCharCount(0);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (showIntro) {
        return (
            <IntroCover
                title="&quot;¿En qué podemos ayudarte hoy?&quot;"
                subtitle="Estamos aquí para impulsarte. Si tienes dudas sobre tu tienda o necesitas ayuda para crecer, el equipo de Lyrium está a un clic de distancia."
                icon="Headset"
                buttonText="ENTRAR"
                buttonIcon="ArrowDown"
                onEnter={() => setShowIntro(false)}
                autoHideAfter={0}
                backgroundImage="/img/intro/contactanos.jpg"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0D1510] py-8 md:py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 rounded-[30px] overflow-hidden bg-white dark:bg-[var(--bg-secondary)] shadow-xl dark:shadow-none border border-gray-200 dark:border-[var(--border-subtle)]">
                    {/* Visual Section */}
                    <div className={`contact-visual bg-[linear-gradient(135deg,rgba(14,165,233,0.85)_0%,rgba(132,204,22,0.85))] dark:bg-[linear-gradient(135deg,var(--brand-green)_0%,var(--icons-green)_50%,var(--brand-green-hover)_100%)] bg-cover bg-center rounded-[30px] md:rounded-r-none p-5 sm:p-8 md:p-12 text-white relative overflow-hidden h-full`}>
                    <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <img src="/img/intro/Flor6.png" alt="decoración" className="absolute -bottom-20 -right-85 w-[700px] max-w-none opacity-50 mix-blend-overlay pointer-events-none" />

                        <div className="relative z-10">
                            <div className="contact-icon w-12 h-12 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-6 border border-white/20 backdrop-blur-sm">
                                <Icon name="ChatCircleDots" className="text-2xl sm:text-4xl" />
                            </div>

                            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4">¡Contáctanos!</h2>
                            <p className="text-white/90 text-sm sm:text-base mb-4 sm:mb-8">Estamos aquí para ayudarte. Envíanos tu consulta y te responderemos lo antes posible.</p>

                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Icon name="MapPin" className="text-base sm:text-xl" />
                                    </div>
                                    <span className="text-sm sm:text-base">Perú</span>
                                </div>
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Icon name="Mail" className="text-base sm:text-xl" />
                                    </div>
                                    <span className="text-sm sm:text-base break-all">ventas@lyriumbiomarketplace.com</span>
                                </div>
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Icon name="PhoneCall" className="text-base sm:text-xl" />
                                    </div>
                                    <span className="text-sm sm:text-base">+51 937 093 420</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex absolute bottom-8 left-8 w-16 h-16 bg-white/20 rounded-full items-center justify-center opacity-100">
                            <Icon name="Headset" className="text-3xl" />
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl md:rounded-l-none p-8 md:p-10 shadow-lg dark:shadow-none h-full flex flex-col justify-center">
                        <div className="form-header flex items-start gap-4 mb-8">
                            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon name="ChatCircleText" className="text-xl text-sky-600 dark:text-[var(--brand-green)]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">Envíanos un mensaje!</h3>
                                <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm">Completa el formulario y nos pondremos en contacto contigo</p>
                            </div>
                        </div>

                        {success && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-4 rounded-xl mb-6 flex items-start gap-3">
                                <Icon name="CheckCircle" className="text-xl flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold">¡Mensaje enviado con éxito!</h4>
                                    <p className="text-sm">Nos pondremos en contacto contigo pronto.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="form-group">
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-1">
                                    Nombre y Apellidos <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Escribe tu nombre completo"
                                    aria-label="Nombre y apellidos"
                                    className={`form-input w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-300'} focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-200 outline-none transition-all`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-1">
                                    Correo Electrónico <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="tu@email.com"
                                    aria-label="Correo electrónico"
                                    className={`form-input w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-300'} focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-200 outline-none transition-all`}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-1">
                                    Asunto <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="¿En qué podemos ayudarte?"
                                    aria-label="Asunto del mensaje"
                                    className={`form-input w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-500' : 'border-slate-300'} focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-200 outline-none transition-all`}
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-1">
                                    Mensaje <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Escribe tu mensaje aquí..."
                                    maxLength={500}
                                    rows={5}
                                    aria-label="Mensaje"
                                    className={`form-textarea w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-500' : 'border-slate-300'} focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-200 outline-none transition-all resize-none`}
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
                                    <p className="text-slate-400 text-xs ml-auto char-counter">{charCount} / 500</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="privacy"
                                        name="privacy"
                                        checked={formData.privacy}
                                        onChange={handleInputChange}
                                        aria-label="Aceptar política de privacidad"
                                        className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 dark:accent-[var(--brand-green)]"
                                    />
                                    <label htmlFor="privacy" className="form-checkbox-label text-sm text-slate-600 dark:text-[var(--text-primary)]">
                                        Acepto la <Link href="/politicasdeprivacidad" target="_blank" className="text-sky-500 dark:text-[var(--icons-green)] hover:underline">política de privacidad</Link>
                                    </label>
                                </div>
                                {errors.privacy && <p className="text-red-500 text-xs mt-1">{errors.privacy}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="form-submit w-full bg-gradient-to-r from-sky-500 to-cyan-500 dark:from-[#1A3A32] dark:to-[var(--brand-green)] hover:from-sky-600 hover:to-cyan-600 dark:hover:from-[#1A3A32] dark:hover:to-[var(--brand-green)]
                                text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg dark:shadow-[0_10px_25px_rgba(74,124,89,0.3)] hover:shadow-xl dark:hover:shadow-[0_15px_35px_rgba(74,124,89,0.4)] hover:-translate-y-1"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ENVIANDO...
                                    </>
                                ) : (
                                    <>
                                        <span>ENVIAR MENSAJE</span>
                                        <Icon name="PaperPlaneTilt" className="text-lg" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
