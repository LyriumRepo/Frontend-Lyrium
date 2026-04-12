'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShopConfig } from '@/features/seller/store/types';
import PolaroidCard from './PolaroidCard';
import Icon from '@/components/ui/Icon';

interface VisualIdentityProps {
    config: ShopConfig;
    updateConfig: (updates: Partial<ShopConfig>) => void;
    uploadLogo?: (file: File) => Promise<any>;
    uploadBanner?: (file: File, bannerNumber: 1 | 2) => Promise<any>;
    uploadGallery?: (file: File) => Promise<any>;
    deleteGalleryItem?: (index: number, mediaId: number) => Promise<any>;
    isUploading?: boolean;
    storeId?: number | null;
}

export default function VisualIdentity(props: VisualIdentityProps): React.ReactElement {
    const { config, updateConfig, uploadLogo, uploadBanner, uploadGallery, deleteGalleryItem, isUploading, storeId } = props;
    const [localLogo, setLocalLogo] = useState(config.visual.logo);
    const [localBanner1, setLocalBanner1] = useState(config.visual.banner1);
    const [localBanner2, setLocalBanner2] = useState(config.visual.banner2);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const gallery = Array.isArray(config.visual.gallery) ? config.visual.gallery : [];
    const [uploading, setUploading] = useState<string | null>(null);
    const isStoreReady = !!storeId;

    // Sincronizar estados locales SOLO cuando no hay una actualización reciente
    React.useEffect(() => {
        const syncFromConfig = () => {
            if (lastUpdated !== 'logo') {
                setLocalLogo(config.visual.logo);
            }
            if (lastUpdated !== 'banner1') {
                setLocalBanner1(config.visual.banner1);
            }
            if (lastUpdated !== 'banner2') {
                setLocalBanner2(config.visual.banner2);
            }
            setLastUpdated(null);
        };
        
        // Pequeño delay para permitir que el estado local se actualice primero
        const timer = setTimeout(syncFromConfig, 100);
        return () => clearTimeout(timer);
    }, [config.visual.logo, config.visual.banner1, config.visual.banner2]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadLogo) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('El archivo no debe superar los 2 MB');
            return;
        }

        setUploading('logo');
        setLastUpdated('logo');
        try {
            const result = await uploadLogo(file);
            const newUrl = result.url + '?t=' + Date.now();
            setLocalLogo(newUrl);
            updateConfig({ visual: { ...config.visual, logo: result.url } });
        } catch (error) {
            console.error('Error uploading logo:', error);
            const message = error instanceof Error ? error.message : 'Error al subir el logo';
            alert(message);
            setLastUpdated(null);
        } finally {
            setUploading(null);
        }
    };

    const handleBannerUpload = (bannerNumber: 1 | 2) => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadBanner) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe superar los 5 MB');
            return;
        }

        setUploading(`banner${bannerNumber}`);
        setLastUpdated(bannerNumber === 1 ? 'banner1' : 'banner2');
        try {
            const result = await uploadBanner(file, bannerNumber);
            const newUrl = result.url + '?t=' + Date.now();
            if (bannerNumber === 1) {
                setLocalBanner1(newUrl);
                updateConfig({ visual: { ...config.visual, banner1: result.url } });
            } else {
                setLocalBanner2(newUrl);
                updateConfig({ visual: { ...config.visual, banner2: result.url } });
            }
        } catch (error) {
            console.error('Error uploading banner:', error);
            alert('Error al subir el banner');
            setLastUpdated(null);
        } finally {
            setUploading(null);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadGallery) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe superar los 5 MB');
            return;
        }

        setUploading('gallery');
        try {
            const result = await uploadGallery(file);
            const newGallery = [...gallery, result.url];
            updateConfig({ visual: { ...config.visual, gallery: newGallery } });
        } catch (error) {
            console.error('Error uploading gallery:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteGalleryItem = (index: number) => {
        const imageUrl = gallery[index];
        
        // Extraer mediaId de la URL: http://localhost:8000/storage/3/archivo.webp -> 3
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
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] animate-fadeIn mb-8">
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-5 text-white relative z-10">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner">
                        <Icon name="Palette" className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none">Estudio de Identidad</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Gestiona tu logo, banners y galeria de fotos de tu tienda
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 xl:col-span-3 space-y-8">
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-1.5 h-4 bg-sky-500 rounded-full"></span>
                            <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Logo de Marca</span>
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            className="relative w-48 h-48 bg-[var(--bg-secondary)] rounded-full ring-4 ring-[var(--bg-secondary)] ring-offset-4 ring-offset-[var(--bg-card)] border-2 border-dashed border-[var(--border-subtle)] group cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-[1.02] hover:border-sky-400"
                            onClick={() => document.getElementById('input-logo')?.click()}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-logo')?.click(); }}
                        >
                            {localLogo ? (
                                <Image src={localLogo} fill sizes="112px" alt="Logo" className="object-contain group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <Icon name="Image" className="w-12 h-12 text-[var(--text-secondary)]" />
                            )}
                            <div className="absolute inset-0 bg-sky-600/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white">
                                <Icon name="Camera" className="w-8 h-8 mb-2 animate-bounce" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{uploading === 'logo' ? 'Subiendo...' : 'Actualizar'}</span>
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

                        <div className="mt-8 space-y-3 pl-2">
                            <div className="flex items-center gap-2">
                                <Icon name="Maximize" className="w-3 h-3 text-sky-500" />
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase">Ratio Profesional 1:1</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="Image" className="w-3 h-3 text-emerald-500" />
                                <p className="text-[9px] font-bold text-red-400 uppercase">PNG • JPG • WEBP (Máx 2MB)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 xl:col-span-9 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-sky-500 rounded-full"></span>
                                <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Escaparate de Banners</span>
                            </div>
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest italic flex items-center gap-1">
                                <Icon name="AlertCircle" className="w-3 h-3" /> Resolución Óptima 4:1
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                role="button"
                                tabIndex={0}
                                className="relative aspect-[4/1.5] rounded-3xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] cursor-pointer group"
                                onClick={() => document.getElementById('input-banner1')?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-banner1')?.click(); }}
                            >
                                {localBanner1 ? (
                                    <Image src={localBanner1} fill sizes="(max-width: 768px) 100vw, 50vw" alt="Banner Principal" className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon name="Image" className="w-12 h-12 text-[var(--text-secondary)]" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Icon name="Upload" className="w-4 h-4" /> {uploading === 'banner1' ? 'Subiendo...' : 'Cambiar imagen de fondo'}
                                    </span>
                                </div>
                            </div>
                            <div
                                role="button"
                                tabIndex={0}
                                className={`relative aspect-[4/1.5] rounded-3xl overflow-hidden border-2 border-dashed ${localBanner2 ? 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]' : 'border-sky-500/20 bg-sky-500/5'} flex items-center justify-center cursor-pointer hover:bg-sky-500/10 transition-all group`}
                                onClick={() => document.getElementById('input-banner2')?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-banner2')?.click(); }}
                            >
                                {localBanner2 ? (
                                    <>
                                        <Image src={localBanner2} fill sizes="(max-width: 768px) 100vw, 50vw" alt="Banner de Oferta" className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-tighter border border-white/20">Banner de Oferta</span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <Icon name="Upload" className="w-4 h-4" /> {uploading === 'banner2' ? 'Subiendo...' : 'Cambiar imagen'}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-500/20 shadow-sm">
                                            <Icon name="Plus" className="text-sky-500 w-5 h-5" />
                                        </div>
                                        <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Expandir Campaña</p>
                                        <p className="text-[8px] font-bold text-sky-300 uppercase mt-1">Añadir Banner de Oferta</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    id="input-banner2" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleBannerUpload(2)}
                                    disabled={uploading !== null || !isStoreReady}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                                <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Muro de Instalaciones</span>
                            </div>
                            <button 
                                className="flex items-center gap-2 px-5 py-2.5 bg-sky-500/10 text-sky-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all"
                                onClick={() => document.getElementById('input-gallery')?.click()}
                                disabled={uploading !== null || !isStoreReady}
                            >
                                <Icon name="PlusCircle" className="w-4 h-4" />
                                <span>{uploading === 'gallery' ? 'Subiendo...' : 'Gestionar Galería'}</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-x-12 gap-y-10 pt-4 pl-4">
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
                                className="w-28 h-28 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl flex flex-col items-center justify-center bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-card)] transition-all cursor-pointer rotate-1 group"
                                onClick={() => document.getElementById('input-gallery')?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('input-gallery')?.click(); }}
                            >
                                <Icon name="Image" className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-indigo-400" />
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
