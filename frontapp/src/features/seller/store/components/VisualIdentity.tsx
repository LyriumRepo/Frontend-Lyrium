'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShopConfig } from '@/features/seller/store/types';
import PolaroidCard from './PolaroidCard';
import Icon from '@/components/ui/Icon';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import PlanUpgradeMessage from './PlanUpgradeMessage';

interface VisualIdentityProps {
    config: ShopConfig;
    updateConfig: (updates: Partial<ShopConfig>) => void;
    uploadLogo?: (file: File) => Promise<any>;
    uploadLogoMarketplace?: (file: File) => Promise<any>;
    uploadBanner?: (file: File, bannerNumber: 1 | 2 | 3) => Promise<any>;
    uploadGallery?: (file: File) => Promise<any>;
    deleteGalleryItem?: (index: number, mediaId: number) => Promise<any>;
    uploadAdBanner?: (file: File) => Promise<any>;
    deleteAdBanner?: (mediaId: number) => Promise<any>;
    deleteBanner?: (bannerNumber: 1 | 2 | 3) => Promise<any>;
    isUploading?: boolean;
    storeId?: number | null;
}

export default function VisualIdentity(props: VisualIdentityProps): React.ReactElement {
    const { config, updateConfig, uploadLogo, uploadLogoMarketplace, uploadBanner, uploadGallery, deleteGalleryItem, uploadAdBanner, deleteAdBanner, deleteBanner, isUploading, storeId } = props;
    const [localLogo, setLocalLogo] = useState(config.visual.logo);
    const [localLogoMarketplace, setLocalLogoMarketplace] = useState(config.visual.logoMarketplace);
    const [localBanner1, setLocalBanner1] = useState(config.visual.banner1);
    const [localBanner2, setLocalBanner2] = useState(config.visual.banner2);
    const [localBanner3, setLocalBanner3] = useState(config.visual.banner3);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const gallery = Array.isArray(config.visual.gallery) ? config.visual.gallery : [];
    const adBanners = Array.isArray(config.visual.adBanners) ? config.visual.adBanners : [];
    const [uploading, setUploading] = useState<string | null>(null);
    const [showBannerUpgrade, setShowBannerUpgrade] = useState(false);
    const [showMainBannerUpgrade, setShowMainBannerUpgrade] = useState(false);
    const isStoreReady = !!storeId;
    const { planSlug, limit: planLimit, isUnlimited } = usePlanCapabilities();
    const maxAdBanners = planLimit('max_ad_banners');
    const adBannerAtLimit = adBanners.length >= maxAdBanners;
    const maxMainBanners = planLimit('max_main_banners');
    const mainBannersUnlimited = isUnlimited(maxMainBanners);
    const isMainBannerSlotLocked = (slot: 2 | 3) => !mainBannersUnlimited && slot > maxMainBanners;

    React.useEffect(() => {
        const syncFromConfig = () => {
            if (lastUpdated !== 'logo') {
                setLocalLogo(config.visual.logo);
            }
            if (lastUpdated !== 'logo-marketplace') {
                setLocalLogoMarketplace(config.visual.logoMarketplace);
            }
            if (lastUpdated !== 'banner1') {
                setLocalBanner1(config.visual.banner1);
            }
            if (lastUpdated !== 'banner2') {
                setLocalBanner2(config.visual.banner2);
            }
            if (lastUpdated !== 'banner3') {
                setLocalBanner3(config.visual.banner3);
            }
            setLastUpdated(null);
        };
        const timer = setTimeout(syncFromConfig, 100);
        return () => clearTimeout(timer);
    }, [config.visual.logo, config.visual.logoMarketplace, config.visual.banner1, config.visual.banner2, config.visual.banner3]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadLogo) return;
        if (file.size > 2 * 1024 * 1024) { alert('El archivo no debe superar los 2 MB'); return; }
        setUploading('logo');
        setLastUpdated('logo');
        try {
            const result = await uploadLogo(file);
            const newUrl = result.url + '?t=' + Date.now();
            setLocalLogo(newUrl);
            updateConfig({ visual: { ...config.visual, logo: result.url } });
        } catch (error) {
            console.error('Error uploading logo:', error);
            alert(error instanceof Error ? error.message : 'Error al subir el logo');
            setLastUpdated(null);
        } finally {
            setUploading(null);
        }
    };

    const handleMarketplaceLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadLogoMarketplace) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('El archivo no debe superar los 2 MB');
            return;
        }

        setUploading('logo-marketplace');
        setLastUpdated('logo-marketplace');
        try {
            const result = await uploadLogoMarketplace(file);
            const newUrl = result.url + '?t=' + Date.now();
            setLocalLogoMarketplace(newUrl);
            updateConfig({ visual: { ...config.visual, logoMarketplace: result.url } });
        } catch (error) {
            console.error('Error uploading marketplace logo:', error);
            const message = error instanceof Error ? error.message : 'Error al subir el logo para tarjetas';
            alert(message);
            setLastUpdated(null);
        } finally {
            setUploading(null);
        }
    };

    const handleBannerUpload = (bannerNumber: 1 | 2 | 3) => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadBanner) return;
        if (bannerNumber !== 1 && isMainBannerSlotLocked(bannerNumber)) {
            setShowMainBannerUpgrade(true);
            return;
        }
        if (file.size > 5 * 1024 * 1024) { alert('El archivo no debe superar los 5 MB'); return; }
        setUploading(`banner${bannerNumber}`);
        setLastUpdated(bannerNumber === 1 ? 'banner1' : bannerNumber === 2 ? 'banner2' : 'banner3');
        try {
            const result = await uploadBanner(file, bannerNumber);
            const newUrl = result.url + '?t=' + Date.now();
            setShowMainBannerUpgrade(false);
            if (bannerNumber === 1) {
                setLocalBanner1(newUrl);
                updateConfig({ visual: { ...config.visual, banner1: result.url } });
            } else if (bannerNumber === 2) {
                setLocalBanner2(newUrl);
                updateConfig({ visual: { ...config.visual, banner2: result.url } });
            } else {
                setLocalBanner3(newUrl);
                updateConfig({ visual: { ...config.visual, banner3: result.url } });
            }
        } catch (error) {
            console.error('Error uploading banner:', error);
            const msg = error instanceof Error ? error.message : '';
            if (msg.toLowerCase().includes('banner') || msg.toLowerCase().includes('plan')) {
                setShowMainBannerUpgrade(true);
            } else {
                alert('Error al subir el banner');
            }
            setLastUpdated(null);
        } finally {
            setUploading(null);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadGallery) return;
        if (file.size > 5 * 1024 * 1024) { alert('El archivo no debe superar los 5 MB'); return; }
        setUploading('gallery');
        try {
            const result = await uploadGallery(file);
            updateConfig({ visual: { ...config.visual, gallery: [...gallery, result.url] } });
        } catch (error) {
            console.error('Error uploading gallery:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(null);
        }
    };

    const handleAdBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadAdBanner) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe superar los 5 MB');
            return;
        }

        setUploading('ad-banners');
        try {
            const result = await uploadAdBanner(file);
            const newBanners = [...adBanners, result.url];
            updateConfig({ visual: { ...config.visual, adBanners: newBanners } });
            setShowBannerUpgrade(false);
        } catch (error) {
            const msg = error instanceof Error ? error.message : '';
            if (msg.toLowerCase().includes('banner') || msg.toLowerCase().includes('máximo')) {
                setShowBannerUpgrade(true);
            } else {
                alert('Error al subir el banner promocional');
            }
        } finally {
            setUploading(null);
        }
    };

    const handleAdBannerClick = () => {
        if (adBannerAtLimit) {
            setShowBannerUpgrade(true);
            return;
        }
        setShowBannerUpgrade(false);
        document.getElementById('input-ad-banner')?.click();
    };

    const handleDeleteAdBanner = async (index: number) => {
        const url = adBanners[index];
        const mediaIdMatch = url?.match(/\/storage\/(\d+)\//);
        const mediaId = mediaIdMatch ? parseInt(mediaIdMatch[1]) : undefined;

        if (!mediaId) {
            const newBanners = [...adBanners];
            newBanners.splice(index, 1);
            updateConfig({ visual: { ...config.visual, adBanners: newBanners } });
            return;
        }

        if (!confirm('¿Eliminar este banner promocional?')) return;

        setUploading('ad-banners-delete');
        try {
            if (deleteAdBanner) {
                await deleteAdBanner(mediaId);
            }
            const newBanners = [...adBanners];
            newBanners.splice(index, 1);
            updateConfig({ visual: { ...config.visual, adBanners: newBanners } });
        } catch (error) {
            console.error('Error deleting ad banner:', error);
            alert('Error al eliminar el banner promocional');
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteBanner = async (bannerNumber: 1 | 2 | 3) => {
        if (!confirm(`¿Eliminar este banner?`)) return;

        setUploading(`banner${bannerNumber}-delete`);
        try {
            if (deleteBanner) {
                await deleteBanner(bannerNumber);
            }
            if (bannerNumber === 1) {
                setLocalBanner1('');
                updateConfig({ visual: { ...config.visual, banner1: '' } });
            } else if (bannerNumber === 2) {
                setLocalBanner2('');
                updateConfig({ visual: { ...config.visual, banner2: '' } });
            } else {
                setLocalBanner3('');
                updateConfig({ visual: { ...config.visual, banner3: '' } });
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Error al eliminar el banner');
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteGalleryItem = (index: number) => {
        const imageUrl = gallery[index];
        const mediaIdMatch = imageUrl?.match(/\/storage\/(\d+)\//);
        const mediaId = mediaIdMatch ? parseInt(mediaIdMatch[1]) : undefined;

        if (!deleteGalleryItem || !mediaId) {
            const newGallery = [...gallery];
            newGallery.splice(index, 1);
            updateConfig({ visual: { ...config.visual, gallery: newGallery } });
            return;
        }

        if (!confirm('¿Eliminar esta imagen de la galería?')) return;

        setUploading('gallery-delete');
        deleteGalleryItem(index, mediaId).then(() => {
            const newGallery = [...gallery];
            newGallery.splice(index, 1);
            updateConfig({ visual: { ...config.visual, gallery: newGallery } });
        }).catch(error => {
            console.error('Error deleting gallery item:', error);
            alert('Error al eliminar la imagen');
        }).finally(() => {
            setUploading(null);
        });
    };

    const getRotation = (index: number) => {
        const rotations = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'];
        return rotations[index % rotations.length];
    };

    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] animate-fadeIn mb-4 sm:mb-6 md:mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 md:p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-5 text-white relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner flex-shrink-0">
                        <Icon name="Palette" className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Estudio de Identidad</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Gestiona tu logo, banners y galeria de fotos de tu tienda
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
                {/* Logo Column */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6 sm:space-y-8">
                    <div className="flex flex-col items-center sm:items-start">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <span className="w-1.5 h-4 bg-sky-500 dark:bg-[var(--icons-green)] rounded-full"></span>
                            <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Logo de Marca</span>
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 bg-[var(--bg-secondary)] rounded-full ring-4 ring-[var(--bg-secondary)] ring-offset-4 ring-offset-[var(--bg-card)] border-2 border-dashed border-[var(--border-subtle)] group cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-[1.02] hover:border-sky-400 dark:hover:border-[var(--icons-green)]"
                            onClick={() => document.getElementById('input-logo')?.click()}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-logo')?.click(); }}
                        >
                            {localLogo ? (
                                <Image src={localLogo} fill sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px" alt="Logo" className="object-contain group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <Icon name="Image" className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--text-secondary)]" />
                            )}
                            <div className="absolute inset-0 bg-sky-600/60 dark:bg-[var(--icons-green)] backdrop-blur-[0px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white">
                                <Icon name="Camera" className="w-7 h-7 sm:w-8 sm:h-8 mb-2 animate-bounce" />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {uploading === 'logo' ? 'Subiendo...' : 'Actualizar'}
                                </span>
                            </div>
                            <input
                                type="file"
                                id="input-logo"
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleLogoUpload}
                                disabled={uploading !== null || !isStoreReady}
                            />
                        </div>

                        <div className="mt-4 sm:mt-8 space-y-3 pl-0 sm:pl-2">
                            <div className="flex items-center gap-2">
                                <Icon name="Maximize" className="w-3 h-3 text-sky-500" />
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase">Ratio Profesional 1:1</p>
                            </div>
                        <div className="flex items-center gap-2">
                            <Icon name="Image" className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" />
                            <p className="text-[9px] font-bold text-red-400 uppercase">PNG • JPG • WEBP (Máx 2MB)</p>
                        </div>
                    </div>
                </div>

                {/* Logo para Tarjetas */}
                <div className="border-t border-[var(--border-subtle)] pt-6 sm:pt-8 mt-2">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        <span className="w-1.5 h-4 bg-amber-500 dark:bg-[var(--icons-green)] rounded-full"></span>
                        <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Logo para Tarjetas</span>
                    </div>
                    <div
                        role="button"
                        tabIndex={0}
                        className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 bg-[var(--bg-secondary)] rounded-full ring-4 ring-[var(--bg-secondary)] ring-offset-4 ring-offset-[var(--bg-card)] border-2 border-dashed border-[var(--border-subtle)] group cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-[1.02] hover:border-amber-400 dark:hover:border-[var(--icons-green)]"
                        onClick={() => document.getElementById('input-logo-marketplace')?.click()}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-logo-marketplace')?.click(); }}
                    >
                        {localLogoMarketplace ? (
                            <Image src={localLogoMarketplace} fill sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px" alt="Logo Marketplace" className="object-contain group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <Icon name="Image" className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--text-secondary)]" />
                        )}
                        <div className="absolute inset-0 bg-amber-600/60 dark:bg-[var(--icons-green)] backdrop-blur-[0px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white">
                            <Icon name="Camera" className="w-7 h-7 sm:w-8 sm:h-8 mb-2 animate-bounce" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{uploading === 'logo-marketplace' ? 'Subiendo...' : 'Actualizar'}</span>
                        </div>
                        <input
                            type="file"
                            id="input-logo-marketplace"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleMarketplaceLogoUpload}
                            disabled={uploading !== null || !isStoreReady}
                        />
                    </div>

                    <div className="mt-4 sm:mt-8 space-y-3 pl-0 sm:pl-2">
                        <div className="flex items-center gap-2">
                            <Icon name="Maximize" className="w-3 h-3 text-amber-500" />
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase">Ratio Profesional 1:1</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="Image" className="w-3 h-3 text-amber-500 dark:text-[var(--icons-green)]" />
                            <p className="text-[9px] font-bold text-red-400 uppercase">PNG • JPG • WEBP (Máx 2MB)</p>
                        </div>
                    </div>
                </div>
                </div>

                {/* Banners + Gallery Column */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-8 sm:space-y-10">
                    {/* Banners */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[var(--border-subtle)] pb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-sky-500 dark:bg-[var(--icons-green)] rounded-full"></span>
                                <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Escaparate de Banners</span>
                            </div>
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest italic flex items-center gap-1">
                                <Icon name="AlertCircle" className="w-3 h-3" /> Resolución Óptima 4:1
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Banner 1 */}
                            <div
                                role="button"
                                tabIndex={0}
                                className="relative aspect-[4/1.5] rounded-2xl sm:rounded-3xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] cursor-pointer group"
                                onClick={() => document.getElementById('input-banner1')?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-banner1')?.click(); }}
                            >
                                {localBanner1 ? (
                                    <>
                                        <Image src={localBanner1} fill sizes="(max-width: 640px) 100vw, 50vw" alt="Banner Principal" className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                                        <button
                                            className="absolute top-3 right-3 z-10 p-1.5 bg-red-500/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteBanner(1); }}
                                            disabled={uploading !== null}
                                            title="Eliminar banner"
                                        >
                                            <Icon name="Trash2" className="w-3.5 h-3.5" />
                                        </button>
                                    </>

                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon name="Image" className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--text-secondary)]" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                    <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-tighter border border-white/20">Banner Principal</span>
                                </div>
                                <input
                                    type="file"
                                    id="input-banner1"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleBannerUpload(1)}
                                    disabled={uploading !== null || !isStoreReady}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-4 sm:p-6">
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Icon name="Upload" className="w-4 h-4" />
                                        {uploading === 'banner1' ? 'Subiendo...' : 'Cambiar imagen'}
                                    </span>
                                </div>
                            </div>

                            {/* Banner 2 y 3 (adicionales, sujetos al límite del plan) */}
                            {([2, 3] as const).map((slot) => {
                                const localValue = slot === 2 ? localBanner2 : localBanner3;
                                const locked = isMainBannerSlotLocked(slot);
                                const label = slot === 2 ? 'Banner de Oferta' : 'Banner Adicional';
                                return (
                                    <div
                                        key={`banner${slot}`}
                                        role="button"
                                        tabIndex={0}
                                        className={`relative aspect-[4/1.5] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-dashed ${
                                            locked
                                                ? 'border-[var(--lima-500)]/30 bg-[var(--lima-500)]/5 cursor-not-allowed'
                                                : localValue
                                                    ? 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] cursor-pointer'
                                                    : 'border-sky-500/20 dark:border-emerald-500/20 bg-sky-500/5 dark:bg-emerald-500/5 cursor-pointer'
                                        } flex items-center justify-center hover:bg-sky-500/10 transition-all group`}
                                        onClick={() => locked ? setShowMainBannerUpgrade(true) : document.getElementById(`input-banner${slot}`)?.click()}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (locked ? setShowMainBannerUpgrade(true) : document.getElementById(`input-banner${slot}`)?.click()); }}
                                    >
                                        {locked ? (
                                            <div className="text-center px-4">
                                                <Icon name="Lock" className="w-6 h-6 text-[var(--lima-500)] mx-auto mb-2" />
                                                <p className="text-[9px] font-black text-[var(--lima-500)] uppercase tracking-widest">Disponible en planes superiores</p>
                                            </div>
                                        ) : localValue ? (
                                            <>
                                                <Image src={localValue} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" alt={label} className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                                                <button
                                                    className="absolute top-3 right-3 z-10 p-1.5 bg-red-500/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteBanner(slot); }}
                                                    disabled={uploading !== null}
                                                    title="Eliminar banner"
                                                >
                                                    <Icon name="Trash2" className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                                    <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-tighter border border-white/20">{label}</span>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-4 sm:p-6">
                                                    <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Icon name="Upload" className="w-4 h-4" />
                                                        {uploading === `banner${slot}` ? 'Subiendo...' : 'Cambiar imagen'}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center px-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-500/20 dark:border-emerald-500/20 shadow-sm">
                                                    <Icon name="Plus" className="text-sky-500 dark:text-[var(--icons-green)] w-5 h-5" />
                                                </div>
                                                <p className="text-[10px] font-black text-sky-600 dark:text-[var(--icons-green)] uppercase tracking-widest">Expandir Campaña</p>
                                                <p className="text-[8px] font-bold text-sky-300 dark:text-[var(--icons-green)] uppercase mt-1">Añadir {label}</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id={`input-banner${slot}`}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleBannerUpload(slot)}
                                            disabled={uploading !== null || !isStoreReady || locked}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {showMainBannerUpgrade && (
                            <PlanUpgradeMessage
                                message={`Tu plan actual permite ${maxMainBanners} banner(s) principal(es). Actualiza tu plan para agregar más.`}
                            />
                        )}
                    </div>

                    {/* Banners Promocionales (Ad Banners) */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[var(--border-subtle)] pb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-purple-500 dark:bg-[var(--icons-green)] rounded-full"></span>
                                <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Banners Promocionales de la Tienda</span>
                            </div>
                            <button
                                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                    adBannerAtLimit
                                        ? 'bg-[var(--lima-500)]/10 text-[var(--lima-500)] cursor-not-allowed'
                                        : 'bg-purple-500/10 dark:bg-emerald-500/10 text-purple-500 dark:text-[var(--icons-green)] hover:bg-purple-500 dark:hover:bg-[var(--brand-green)] hover:text-white'
                                }`}
                                onClick={handleAdBannerClick}
                                disabled={uploading !== null || !isStoreReady}
                            >
                                <Icon name="PlusCircle" className="w-4 h-4" />
                                <span>{uploading === 'ad-banners' ? 'Subiendo...' : 'Agregar Banner'}</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed px-1">
                            Estas imágenes se mostrarán como publicidad dentro de tu tienda pública.
                            Se recomienda usar imágenes con texto promocional, ofertas o campañas.
                            Máximo {maxAdBanners} banners. El orden de carga determina la prioridad de visualización.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            {adBanners.filter(Boolean).map((bannerUrl, i) => (
                                <div key={`${bannerUrl}-${i}`} className="relative group aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm">
                                    <Image src={bannerUrl} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" alt={`Banner ${i + 1}`} className="object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                            onClick={() => handleDeleteAdBanner(i)}
                                            disabled={uploading !== null}
                                            title="Eliminar banner"
                                        >
                                            <Icon name="Trash2" className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-lg text-[8px] font-black text-white">
                                        {i + 1}
                                    </span>
                                </div>
                            ))}
                            {adBanners.length < maxAdBanners && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className={`aspect-[16/9] border-2 border-dashed rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all group ${
                                        adBannerAtLimit
                                            ? 'border-[var(--lima-500)]/30 bg-[var(--lima-500)]/5 cursor-not-allowed'
                                            : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-card)] cursor-pointer'
                                    }`}
                                    onClick={handleAdBannerClick}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAdBannerClick(); }}
                                >
                                    {adBannerAtLimit ? (
                                        <Icon name="Lock" className="w-6 h-6 text-[var(--lima-500)] group-hover:text-white" />
                                    ) : (
                                        <Icon name="Image" className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-purple-400 dark:group-hover:text-[var(--icons-green)]" />
                                    )}
                                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase mt-1">{adBanners.length === 0 ? 'Agregar Banner' : `+ ${maxAdBanners - adBanners.length} disponibles`}</span>
                                    <input
                                        type="file"
                                        id="input-ad-banner"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAdBannerUpload}
                                        disabled={uploading !== null || !isStoreReady}
                                    />
                                </div>
                            )}
                        </div>

                        {showBannerUpgrade && (
                            <PlanUpgradeMessage
                                message="Tu plan Emprende permite hasta 3 banners promocionales. Actualiza al plan Crece para mostrar más promociones en tu tienda."
                            />
                        )}
                    </div>

                    {/* Gallery */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-y-3">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-sky-500 dark:bg-[var(--icons-green)] rounded-full"></span>
                                <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Muro de Instalaciones</span>
                            </div>
                            <button
                                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-sky-500/10 dark:bg-emerald-500/10 text-sky-500 dark:text-[var(--icons-green)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 dark:hover:bg-[var(--brand-green)] hover:text-white transition-all"
                                onClick={() => document.getElementById('input-gallery')?.click()}
                                disabled={uploading !== null || !isStoreReady}
                            >
                                <Icon name="PlusCircle" className="w-4 h-4" />
                                <span>{uploading === 'gallery' ? 'Subiendo...' : 'Gestionar Galería'}</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-8 md:gap-x-12 md:gap-y-10 pt-4 pl-2 sm:pl-4">
                            {gallery.map((img, i) => (
                                <PolaroidCard
                                    key={img || `gallery-${i}`}
                                    image={img}
                                    rotation={getRotation(i)}
                                    onDelete={() => handleDeleteGalleryItem(i)}
                                />
                            ))}
                            <div
                                role="button"
                                tabIndex={0}
                                className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl flex flex-col items-center justify-center bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-card)] transition-all cursor-pointer rotate-1 group"
                                onClick={() => document.getElementById('input-gallery')?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-gallery')?.click(); }}
                            >
                                <Icon name="Image" className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-sky-400 dark:group-hover:text-[var(--icons-green)]" />
                                <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase mt-1">Próxima Foto</span>
                                <input
                                    type="file"
                                    id="input-gallery"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleGalleryUpload}
                                    disabled={uploading !== null || !isStoreReady}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
