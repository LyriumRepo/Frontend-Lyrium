'use client';

import React, { useState } from 'react';
import { ShopConfig } from '@/features/seller/store/types';
import Icon from '@/components/ui/Icon';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import PlanUpgradeMessage from './PlanUpgradeMessage';

interface ContactSocialProps {
    config: ShopConfig;
    updateConfig: (updates: Partial<ShopConfig>) => void;
}

// Acepta URLs con o sin protocolo (ej. "instagram.com/tienda" o "https://instagram.com/tienda")
const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidUrl = (value: string) => !value.trim() || URL_PATTERN.test(value.trim());
const isValidEmail = (value: string) => !value.trim() || EMAIL_PATTERN.test(value.trim());

// Deja pasar solo dígitos y recorta a 9 caracteres (formato de celular peruano)
const sanitizePhoneInput = (value: string) => value.replace(/\D/g, '').slice(0, 9);

export default function ContactSocial({ config, updateConfig }: ContactSocialProps) {
    const { planSlug, limit } = usePlanCapabilities();
    const maxSocial = limit('max_social_links');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

    const socialKeys: (keyof ShopConfig['social'])[] = ['instagram', 'facebook', 'tiktok', 'whatsapp', 'youtube', 'twitter', 'linkedin', 'website'];
    const filledCount = socialKeys.filter(k => config.social[k]?.trim()).length;
    const atLimit = planSlug === 'emprende' && filledCount >= maxSocial;

    const updateSocial = (updates: Partial<ShopConfig['social']>) => {
        updateConfig({
            social: { ...config.social, ...updates }
        });
    };

    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-4 sm:mb-6 md:mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 md:p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-5 text-white relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner flex-shrink-0">
                        <Icon name="Contact" className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Información de Contacto</h3>
                        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Canales de comunicación y redes sociales oficiales
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {/* Contacto Directo */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 block border-b border-[var(--border-subtle)] pb-2">
                            Directo
                        </span>
                        <div>
                            <div className="relative group">
                                <Icon name="Mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-rose-500" />
                                <input
                                    type="email"
                                    id="contact-email"
                                    value={config.email}
                                    onChange={e => updateConfig({ email: e.target.value })}
                                    onBlur={() => markTouched('email')}
                                    placeholder="Email"
                                    className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all duration-300 ${
                                        touched.email && !isValidEmail(config.email)
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                    }`}
                                />
                            </div>
                            {touched.email && !isValidEmail(config.email) && (
                                <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa un correo electrónico válido</p>
                            )}
                        </div>
                        <div className="relative group">
                            <Icon name="Phone" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-blue-500" />
                            <input
                                type="tel"
                                inputMode="numeric"
                                id="contact-phone"
                                value={config.phone}
                                onChange={e => updateConfig({ phone: sanitizePhoneInput(e.target.value) })}
                                placeholder="Teléfono"
                                maxLength={9}
                                className="pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] transition-all duration-300"
                            />
                        </div>
                        <div className="relative group">
                            <Icon name="MapPin" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-amber-500" />
                            <input
                                type="text"
                                id="contact-address"
                                value={config.address}
                                onChange={e => updateConfig({ address: e.target.value })}
                                placeholder="Dirección"
                                className="pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Redes Sociales 1 */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 block border-b border-[var(--border-subtle)] pb-2">
                            Redes Sociales (1)
                        </span>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <div className="relative group">
                                    <Icon name="Instagram" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-pink-500" />
                                    <input
                                        type="text"
                                        placeholder="Instagram URL"
                                        value={config.social.instagram || ''}
                                        onChange={e => updateSocial({ instagram: e.target.value })}
                                        onBlur={() => markTouched('instagram')}
                                        disabled={atLimit && !config.social.instagram?.trim()}
                                        className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all ${
                                            atLimit && !config.social.instagram?.trim()
                                                ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)]'
                                                : touched.instagram && !isValidUrl(config.social.instagram || '')
                                                    ? 'border-red-400 focus:border-red-500'
                                                    : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                        }`}
                                    />
                                </div>
                                {touched.instagram && !isValidUrl(config.social.instagram || '') && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa una URL válida</p>
                                )}
                            </div>
                            <div>
                                <div className="relative group">
                                    <Icon name="Facebook" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-blue-600" />
                                    <input
                                        type="text"
                                        placeholder="Facebook URL"
                                        value={config.social.facebook || ''}
                                        onChange={e => updateSocial({ facebook: e.target.value })}
                                        onBlur={() => markTouched('facebook')}
                                        disabled={atLimit && !config.social.facebook?.trim()}
                                        className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all ${
                                            atLimit && !config.social.facebook?.trim()
                                                ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)]'
                                                : touched.facebook && !isValidUrl(config.social.facebook || '')
                                                    ? 'border-red-400 focus:border-red-500'
                                                    : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                        }`}
                                    />
                                </div>
                                {touched.facebook && !isValidUrl(config.social.facebook || '') && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa una URL válida</p>
                                )}
                            </div>
                            <div>
                                <div className="relative group">
                                    <Icon name="Music" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-black dark:group-focus-within:text-white" />
                                    <input
                                        type="text"
                                        placeholder="TikTok URL (Usa Link de Perfil)"
                                        value={config.social.tiktok || ''}
                                        onChange={e => updateSocial({ tiktok: e.target.value })}
                                        onBlur={() => markTouched('tiktok')}
                                        disabled={atLimit && !config.social.tiktok?.trim()}
                                        className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all ${
                                            atLimit && !config.social.tiktok?.trim()
                                                ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)]'
                                                : touched.tiktok && !isValidUrl(config.social.tiktok || '')
                                                    ? 'border-red-400 focus:border-red-500'
                                                    : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                        }`}
                                    />
                                </div>
                                {touched.tiktok && !isValidUrl(config.social.tiktok || '') && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa una URL válida</p>
                                )}
                            </div>
                            <div className="relative group">
                                <Icon name="MessageCircle" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-green-500" />
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="WhatsApp Number"
                                    value={config.social.whatsapp || ''}
                                    onChange={e => updateSocial({ whatsapp: sanitizePhoneInput(e.target.value) })}
                                    maxLength={9}
                                    disabled={atLimit && !config.social.whatsapp?.trim()}
                                    className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none transition-all ${
                                        atLimit && !config.social.whatsapp?.trim() ? 'opacity-40 cursor-not-allowed' : 'focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Redes Sociales 2 */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 block border-b border-[var(--border-subtle)] pb-2">
                            Redes Sociales (2)
                        </span>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <div className="relative group">
                                    <Icon name="Youtube" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-red-600" />
                                    <input
                                        type="text"
                                        placeholder="YouTube URL"
                                        value={config.social.youtube || ''}
                                        onChange={e => updateSocial({ youtube: e.target.value })}
                                        onBlur={() => markTouched('youtube')}
                                        disabled={atLimit && !config.social.youtube?.trim()}
                                        className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all ${
                                            atLimit && !config.social.youtube?.trim()
                                                ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)]'
                                                : touched.youtube && !isValidUrl(config.social.youtube || '')
                                                    ? 'border-red-400 focus:border-red-500'
                                                    : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                        }`}
                                    />
                                </div>
                                {touched.youtube && !isValidUrl(config.social.youtube || '') && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa una URL válida</p>
                                )}
                            </div>
                            <div>
                                <div className="relative group">
                                    <Icon name="Twitter" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-sky-500" />
                                    <input
                                        type="text"
                                        placeholder="Twitter URL"
                                        value={config.social.twitter || ''}
                                        onChange={e => updateSocial({ twitter: e.target.value })}
                                        onBlur={() => markTouched('twitter')}
                                        disabled={atLimit && !config.social.twitter?.trim()}
                                        className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all ${
                                            atLimit && !config.social.twitter?.trim()
                                                ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)]'
                                                : touched.twitter && !isValidUrl(config.social.twitter || '')
                                                    ? 'border-red-400 focus:border-red-500'
                                                    : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                        }`}
                                    />
                                </div>
                                {touched.twitter && !isValidUrl(config.social.twitter || '') && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa una URL válida</p>
                                )}
                            </div>
                            <div>
                                <div className="relative group">
                                    <Icon name="Linkedin" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-blue-700" />
                                    <input
                                        type="text"
                                        placeholder="LinkedIn URL"
                                        value={config.social.linkedin || ''}
                                        onChange={e => updateSocial({ linkedin: e.target.value })}
                                        onBlur={() => markTouched('linkedin')}
                                        disabled={atLimit && !config.social.linkedin?.trim()}
                                        className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all ${
                                            atLimit && !config.social.linkedin?.trim()
                                                ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)]'
                                                : touched.linkedin && !isValidUrl(config.social.linkedin || '')
                                                    ? 'border-red-400 focus:border-red-500'
                                                    : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                        }`}
                                    />
                                </div>
                                {touched.linkedin && !isValidUrl(config.social.linkedin || '') && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa una URL válida</p>
                                )}
                            </div>
                            <div>
                                <div className="relative group">
                                    <Icon name="Globe" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4 group-focus-within:text-emerald-500" />
                                    <input
                                        type="text"
                                        placeholder="Sitio Web URL"
                                        value={config.social.website || ''}
                                        onChange={e => updateSocial({ website: e.target.value })}
                                        onBlur={() => markTouched('website')}
                                        disabled={atLimit && !config.social.website?.trim()}
                                        className={`pl-12 w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 rounded-xl outline-none transition-all ${
                                            atLimit && !config.social.website?.trim()
                                                ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)]'
                                                : touched.website && !isValidUrl(config.social.website || '')
                                                    ? 'border-red-400 focus:border-red-500'
                                                    : 'border-[var(--border-subtle)] focus:border-sky-500 dark:focus:border-[var(--icons-green)]'
                                        }`}
                                    />
                                </div>
                                {touched.website && !isValidUrl(config.social.website || '') && (
                                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">Ingresa una URL válida</p>
                                )}
                            </div>
                            {atLimit && (
                                <PlanUpgradeMessage
                                    message="Has alcanzado el límite máximo de redes sociales permitido por tu plan Emprende. Actualiza al plan Crece para agregar más redes."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}