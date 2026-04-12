'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    User,
    Building2,
    Mail,
    Smartphone,
    MapPin,
    BadgeHelp,
    ShoppingBag,
    Receipt,
    Calendar,
    AlertCircle,
    ShieldCheck,
    Send,
    ChevronDown,
    Upload,
    Store
} from 'lucide-react';
import Link from 'next/link';
import { complaintsConfig } from '@/shared/lib/constants/complaintsData';

export default function ComplaintsBookPage() {
    const [formData, setFormData] = useState({
        tipo_persona: complaintsConfig.options.tipo_persona[0],
        nombre_razon: '',
        correo: '',
        tipo_documento: complaintsConfig.options.tipo_documento[0],
        numero_documento: '',
        telefono: '',
        direccion: '',
        distrito: '',
        provincia: '',
        departamento: '',
        tipo_reclamo: 'Reclamo',
        bien_contratado: complaintsConfig.options.bien_contratado[0],
        comprobante_pago: complaintsConfig.options.comprobante_pago[0],
        numero_comprobante: '',
        fecha_incidente: '',
        detalle_producto: '',
        detalle_reclamo: '',
        tienda_responsable: complaintsConfig.options.tiendas[0],
        chk_titular: false,
        chk_politica: false
    });

    const [helpInfo, setHelpInfo] = useState(complaintsConfig.helpTexts.reclamo);

    useEffect(() => {
        const type = formData.tipo_reclamo.toLowerCase() as 'queja' | 'reclamo';
        setHelpInfo(complaintsConfig.helpTexts[type] || complaintsConfig.helpTexts.reclamo);
    }, [formData.tipo_reclamo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Formulario enviado:', formData);
        alert('Simulación: Formulario de reclamación enviado con éxito.');
    };

    return (
        <main className="min-h-screen bg-[#f7fbff] py-12 md:py-20 px-4 relative overflow-hidden">
            {/* Background radial effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] bg-sky-100/50 rounded-full blur-[100px] -z-10" />

            <div className="max-w-5xl mx-auto space-y-12">

                {/* ===================== HEADER ===================== */}
                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="inline-flex items-center gap-4 bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-4 rounded-full shadow-2xl text-white transform hover:scale-105 transition-all duration-500 animate-in">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{complaintsConfig.header.title}</h1>
                    </div>

                    <div className="bg-white/70 backdrop-blur-md border border-sky-100 p-6 md:p-8 rounded-[2rem] shadow-xl max-w-3xl animate-in animate-delay-1 text-gray-600 leading-relaxed text-sm md:text-base">
                        {complaintsConfig.header.intro}<br />
                        <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
                            <span><strong className="text-sky-500">{complaintsConfig.helpTexts.queja.title}:</strong> Disconformidad por la atención recibida.</span>
                            <span><strong className="text-sky-500">{complaintsConfig.helpTexts.reclamo.title}:</strong> Disconformidad con el producto o servicio.</span>
                        </div>
                    </div>
                </div>

                {/* ===================== FORM CARD ===================== */}
                <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in animate-delay-2 group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 bg-[length:200%_100%] animate-shimmer-line"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">

                        {/* SECTION 1: IDENTIFICACIÓN */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">1. Identificación del Consumidor</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="tipo_persona" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" /> Tipo de persona
                                    </label>
                                    <select id="tipo_persona" name="tipo_persona" value={formData.tipo_persona} onChange={handleChange} aria-label="Tipo de persona" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700">
                                        {complaintsConfig.options.tipo_persona.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label htmlFor="nombre_razon" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5" /> Nombre/Razón Social*
                                    </label>
                                    <input id="nombre_razon" name="nombre_razon" required type="text" value={formData.nombre_razon} onChange={handleChange} placeholder="Ej: Juan Pérez o Empresa S.A.C" aria-label="Nombre o razón social" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="tipo_documento" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Tipo documento</label>
                                    <select id="tipo_documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} aria-label="Tipo de documento" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700">
                                        {complaintsConfig.options.tipo_documento.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="numero_documento" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">N° Documento*</label>
                                    <input id="numero_documento" name="numero_documento" required type="text" value={formData.numero_documento} onChange={handleChange} placeholder="00000000" aria-label="Número de documento" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="correo" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" /> Correo electrónico
                                    </label>
                                    <input id="correo" name="correo" type="email" value={formData.correo} onChange={handleChange} placeholder="ejemplo@correo.com" aria-label="Correo electrónico" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="telefono" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Smartphone className="w-3.5 h-3.5" /> Teléfono
                                    </label>
                                    <input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="999 999 999" aria-label="Teléfono" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label htmlFor="direccion" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> Dirección completa
                                    </label>
                                    <input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} placeholder="Av. Siempre Viva 123, Int 4" aria-label="Dirección completa" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="distrito" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Distrito</label>
                                    <input id="distrito" name="distrito" type="text" value={formData.distrito} onChange={handleChange} placeholder="Distrito" aria-label="Distrito" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="provincia" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Provincia</label>
                                    <input id="provincia" name="provincia" type="text" value={formData.provincia} onChange={handleChange} placeholder="Provincia" aria-label="Provincia" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="departamento" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Departamento</label>
                                    <input id="departamento" name="departamento" type="text" value={formData.departamento} onChange={handleChange} placeholder="Departamento" aria-label="Departamento" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: DETALLES DEL RECLAMO */}
                        <div className="space-y-8 pt-6 border-t border-dashed border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">2. Detalles del incidente</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="tipo_reclamo" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <BadgeHelp className="w-3.5 h-3.5 text-sky-500" /> Tipo de reporte
                                    </label>
                                    <select id="tipo_reclamo" name="tipo_reclamo" value={formData.tipo_reclamo} onChange={handleChange} className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700">
                                        <option>Reclamo</option>
                                        <option>Queja</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="bien_contratado" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <ShoppingBag className="w-3.5 h-3.5" /> Bien contratado
                                    </label>
                                    <select id="bien_contratado" name="bien_contratado" value={formData.bien_contratado} onChange={handleChange} className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700">
                                        {complaintsConfig.options.bien_contratado.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="comprobante_pago" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Receipt className="w-3.5 h-3.5" /> Comprobante
                                    </label>
                                    <select id="comprobante_pago" name="comprobante_pago" value={formData.comprobante_pago} onChange={handleChange} className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700">
                                        {complaintsConfig.options.comprobante_pago.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="numero_comprobante" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">N° Comprobante</label>
                                    <input id="numero_comprobante" name="numero_comprobante" type="text" value={formData.numero_comprobante} onChange={handleChange} placeholder="Ej: B001-0001" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="fecha_incidente" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Fecha del incidente
                                    </label>
                                    <input id="fecha_incidente" name="fecha_incidente" type="date" value={formData.fecha_incidente} onChange={handleChange} className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="tienda_responsable" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Store className="w-3.5 h-3.5" /> Tienda responsable
                                    </label>
                                    <select id="tienda_responsable" name="tienda_responsable" value={formData.tienda_responsable} onChange={handleChange} className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700 border-dashed">
                                        {complaintsConfig.options.tiendas.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-3 space-y-2">
                                    <label htmlFor="detalle_producto" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Detalle del producto o servicio</label>
                                    <input id="detalle_producto" name="detalle_producto" type="text" value={formData.detalle_producto} onChange={handleChange} placeholder="Nombre del producto, modelo o tipo de servicio..." className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700" />
                                </div>

                                <div className="md:col-span-3 space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="detalle_reclamo" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Detalle del reclamo o queja*</label>
                                        <div className="p-4 bg-sky-50 border-l-4 border-sky-400 rounded-r-xl flex items-start gap-3 transition-all duration-500">
                                            <AlertCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs md:text-sm text-sky-600 font-medium">{helpInfo.info}</p>
                                        </div>
                                    </div>
                                    <textarea id="detalle_reclamo" name="detalle_reclamo" required value={formData.detalle_reclamo} onChange={handleChange} placeholder={helpInfo.placeholder} className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] px-8 py-6 focus:border-sky-500 focus:bg-white outline-none transition-all font-semibold text-gray-700 min-h-[160px] resize-none" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: ARCHIVO Y ACCIONES */}
                        <div className="space-y-8 pt-6 border-t border-dashed border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Adjuntar archivo (Opcional)</p>
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer group/file">
                                        <Upload className="w-10 h-10 text-gray-300 group-hover/file:text-sky-500 group-hover/file:animate-float" />
                                        <span className="mt-4 text-sm font-bold text-gray-400 group-hover/file:text-sky-600">Subir comprobante o evidencia</span>
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>

                                <div className="flex flex-col justify-end gap-4 pb-2">
                                    <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group/chk">
                                        <input type="checkbox" name="chk_titular" checked={formData.chk_titular} onChange={handleChange} required className="mt-1.5 w-5 h-5 accent-sky-500" />
                                        <span className="text-sm text-gray-500 font-medium">Declaro ser el titular del presente formulario y que la información es correcta.</span>
                                    </label>

                                    <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group/chk">
                                        <input type="checkbox" name="chk_politica" checked={formData.chk_politica} onChange={handleChange} required className="mt-1.5 w-5 h-5 accent-sky-500" />
                                        <span className="text-sm text-gray-500 font-medium">
                                            He leído y acepto la <Link href="/politicasdeprivacidad" className="text-sky-500 font-bold hover:underline">Política de Privacidad</Link>.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-center">
                                <button type="submit" className="group relative px-12 py-5 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500 bg-[length:200%_100%] hover:bg-[100%_0%] text-white rounded-full font-black uppercase tracking-widest shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 flex items-center gap-4">
                                    <div className="p-1 px-3 bg-white/20 rounded-lg">
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                    Enviar reporte
                                </button>
                            </div>
                        </div>

                    </form>
                </div>

            </div>
        </main>
    );
}
