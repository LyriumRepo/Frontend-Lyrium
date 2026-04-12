'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { TicketType } from '@/features/seller/help/types';

import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

const MAX_ADJUNTOS = 3;
const ACCEPTED_MIME = 'image/jpeg,image/png,image/webp';

interface TicketFormData {
    asunto: string;
    tipo_ticket: string;
    criticidad: string;
    mensaje?: string;
    adjuntos?: File[];
}

interface FormErrors {
    asunto?: string;
    mensaje?: string;
}

interface PendingFile {
    file: File;
    previewUrl: string;
}

interface NewTicketFormProps {
    onCreateTicket: (data: TicketFormData) => void | Promise<void>;
    onCancel: () => void;
}

function validateForm(data: TicketFormData, adjuntos: PendingFile[]): FormErrors {
    const errors: FormErrors = {};

    if (!data.asunto || data.asunto.length < 5) {
        errors.asunto = 'El asunto debe tener al menos 5 caracteres';
    }

    // mensaje is required only when there are no attached images
    const hasFiles = adjuntos.length > 0;
    if (!hasFiles && (!data.mensaje || data.mensaje.length < 10)) {
        errors.mensaje = 'Escribe un mensaje o adjunta al menos una imagen';
    }

    return errors;
}

export default function NewTicketForm({ onCreateTicket, onCancel }: NewTicketFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [asuntoValue, setAsuntoValue] = useState('');
    const [mensajeValue, setMensajeValue] = useState('');
    const [adjuntos, setAdjuntos] = useState<PendingFile[]>([]);
    const formRef = useRef<HTMLFormElement>(null);
    const messageRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        if (!selected.length) return;
        setAdjuntos((prev) => {
            const remaining = MAX_ADJUNTOS - prev.length;
            const toAdd = selected.slice(0, remaining).map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
            }));
            return [...prev, ...toAdd];
        });
        e.target.value = '';
        // Clear mensaje error if we now have files
        setErrors((prev) => ({ ...prev, mensaje: undefined }));
    }, []);

    const removeAdjunto = useCallback((index: number) => {
        setAdjuntos((prev) => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        setTouched(prev => new Set(prev).add(name));
        const currentData: TicketFormData = { asunto: asuntoValue, mensaje: mensajeValue, tipo_ticket: '', criticidad: '' };
        const errs = validateForm(currentData, adjuntos);
        setErrors(errs);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'asunto') setAsuntoValue(value);
        if (name === 'mensaje') setMensajeValue(value);
        if (touched.has(name)) {
            const currentData: TicketFormData = {
                asunto: name === 'asunto' ? value : asuntoValue,
                mensaje: name === 'mensaje' ? value : mensajeValue,
                tipo_ticket: '', criticidad: ''
            };
            const errs = validateForm(currentData, adjuntos);
            setErrors(errs);
        }
    };

    const isFormValid = () => {
        const errs = validateForm({ asunto: asuntoValue, mensaje: mensajeValue, tipo_ticket: '', criticidad: '' }, adjuntos);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData(formRef.current || undefined);
        const data: TicketFormData = {
            asunto: formData.get('asunto') as string || asuntoValue,
            tipo_ticket: formData.get('tipo_ticket') as string || '',
            criticidad: formData.get('criticidad') as string || '',
            mensaje: mensajeValue || undefined,
            adjuntos: adjuntos.length > 0 ? adjuntos.map((a) => a.file) : undefined,
        };

        const validationErrors = validateForm(data, adjuntos);
        setErrors(validationErrors);
        setTouched(new Set(['asunto', 'mensaje']));

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreateTicket(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormat = (type: 'bold' | 'italic') => {
        const input = messageRef.current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const text = input.value;
        const selected = text.substring(start, end);

        let formatted = '';
        if (type === 'bold') formatted = `** ${selected}** `;
        if (type === 'italic') formatted = `* ${selected}* `;

        const newText = text.substring(0, start) + formatted + text.substring(end);
        input.value = newText;
        input.focus();
        input.setSelectionRange(start, start + formatted.length);
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                <div className="space-y-2">
                    <label htmlFor="tipo_ticket" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-2">Propósito del Ticket <span className="text-[var(--text-danger)]">*</span></label>
                    <select
                        id="tipo_ticket"
                        name="tipo_ticket"
                        required
                    className="w-full px-5 py-4 bg-[var(--bg-secondary)] border-none rounded-[1.6rem] sm:rounded-3xl font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 cursor-pointer outline-none transition-all"
                    >
                        <option value="payments">Pagos y Facturación</option>
                        <option value="tech">Soporte Técnico</option>
                        <option value="documentation">Trámites y Documentos</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="criticidad" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 text-opacity-50">Nivel de Urgencia</label>
                    <select
                        id="criticidad"
                        name="criticidad"
                        required
                    className="w-full px-5 py-4 bg-[var(--bg-secondary)] border-none rounded-[1.6rem] sm:rounded-3xl font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 cursor-pointer outline-none transition-all"
                    >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="asunto" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-2">Asunto Principal <span className="text-[var(--text-danger)]">*</span></label>
                <input
                    id="asunto"
                    type="text"
                    name="asunto"
                    required
                    value={asuntoValue}
                    onBlur={handleBlur}
                    onChange={(e) => {
                        setAsuntoValue(e.target.value);
                        handleChange(e);
                    }}
                    className={`w-full px-5 sm:px-6 py-4 sm:py-5 bg-[var(--bg-secondary)] border-none rounded-[1.6rem] sm:rounded-[2rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 outline-none transition-all ${
                        errors.asunto && touched.has('asunto') ? 'ring-4 ring-red-500/20' : ''
                    }`}
                    placeholder="Describe brevemente el motivo..."
                />
                {errors.asunto && touched.has('asunto') && (
                    <p className="text-xs text-red-500 ml-4 mt-1">{errors.asunto}</p>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                    <label htmlFor="mensaje" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Cuerpo de la Incidencia <span className="text-[var(--text-danger)]">*</span></label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => handleFormat('bold')} aria-label="Aplicar negrita" className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:bg-sky-50 hover:text-sky-500 rounded-lg transition-all"><Icon name="Bold" className="font-bold w-4 h-4" /></button>
                        <button type="button" onClick={() => handleFormat('italic')} aria-label="Aplicar cursiva" className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:bg-sky-50 hover:text-sky-500 rounded-lg transition-all"><Icon name="Italic" className="font-bold w-4 h-4" /></button>
                    </div>
                </div>
                <textarea
                    id="mensaje"
                    name="mensaje"
                    ref={messageRef}
                    required
                    value={mensajeValue}
                    onBlur={handleBlur}
                    onChange={(e) => {
                        setMensajeValue(e.target.value);
                        handleChange(e);
                    }}
                    rows={5}
                    className={`w-full px-5 sm:px-7 py-5 sm:py-6 bg-[var(--bg-secondary)] border-none rounded-[1.8rem] sm:rounded-[2.5rem] font-medium text-[var(--text-primary)] text-sm focus:ring-4 focus:ring-sky-500/5 outline-none transition-all resize-none shadow-inner ${
                        errors.mensaje && touched.has('mensaje') ? 'ring-4 ring-red-500/20' : ''
                    }`}
                    placeholder="Detalla los hechos, pasos para reproducir o dudas operativas..."
                ></textarea>
                {errors.mensaje && touched.has('mensaje') && (
                    <p className="text-xs text-red-500 ml-4 mt-1">{errors.mensaje}</p>
                )}
                <p className={`text-xs ml-4 mt-1 ${adjuntos.length > 0 || mensajeValue.length >= 10 ? 'text-green-500' : 'text-gray-400'}`}>
                    {adjuntos.length > 0 ? 'Puedes enviar sin texto cuando hay imágenes adjuntas' : `Mínimo 10 caracteres (${mensajeValue.length}/10)`}
                </p>
            </div>

            {/* File Upload Area */}
            <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                        Evidencia Fotográfica
                        <span className="ml-1.5 font-medium normal-case text-[var(--text-muted)]">({adjuntos.length}/{MAX_ADJUNTOS})</span>
                    </label>
                    <span className="text-[9px] font-extrabold text-sky-500 uppercase tracking-tighter bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">Límite 5MB c/u</span>
                </div>

                {/* Previews */}
                {adjuntos.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {adjuntos.map((pf, idx) => (
                            <div key={idx} className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={pf.previewUrl}
                                    alt={pf.file.name}
                                    className="h-20 w-20 rounded-2xl object-cover border border-[var(--border-subtle)] shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAdjunto(idx)}
                                    aria-label={`Quitar ${pf.file.name}`}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                <p className="mt-1 max-w-[80px] truncate text-center text-[9px] text-[var(--text-muted)]">{pf.file.name}</p>
                            </div>
                        ))}
                    </div>
                )}

                {adjuntos.length < MAX_ADJUNTOS && (
                    <div
                        className="group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="p-8 sm:p-12 border-2 border-dashed border-[var(--border-subtle)] rounded-[2rem] sm:rounded-[3rem] bg-[var(--bg-secondary)]/10 group-hover:border-sky-500/30 group-hover:bg-sky-500/5 transition-all flex flex-col items-center justify-center gap-4 text-center">
                            <div className="w-14 h-14 bg-[var(--bg-card)] rounded-2xl shadow-xl shadow-black/5 flex items-center justify-center text-[var(--text-secondary)] group-hover:text-sky-500 transition-all group-hover:scale-110">
                                <Icon name="CloudUpload" className="text-3xl font-bold w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1 px-4">
                                    {adjuntos.length > 0 ? 'Agregar más imágenes' : 'Adjuntar evidencias'}
                                </p>
                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase italic">Arrastra hacia aquí o haz clic · jpeg, png, webp</p>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_MIME}
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    aria-hidden="true"
                />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end pt-6 sm:pt-8 gap-3 sm:gap-4 border-t border-[var(--border-subtle)]">
                <BaseButton
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full sm:w-auto"
                >
                    Descartar
                </BaseButton>
                <BaseButton
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary"
                    leftIcon="Send"
                    disabled={!isFormValid()}
                    className="w-full sm:w-auto sm:min-w-[200px]"
                >
                    Enviar Ticket
                </BaseButton>
            </div>
        </form>
    );
}
