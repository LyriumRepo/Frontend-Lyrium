export type UserType = 'vendedor' | 'cliente';
export type AuthMode = 'login' | 'register';

export interface LoginFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

// Tipos de evidencia de actividad comercial que evalúa el RPA
export type TipoEvidencia = '' | 'texto' | 'url' | 'catalogo' | 'ficha' | 'boleta' | 'factura';

export interface RegisterFormData {
    storeName: string;
    email: string;
    phone: string;
    password: string;
    ruc: string;

    // ── Campos nuevos requeridos por el RPA (solo vendedor) ──────────────────
    dni: string;
    categoria: string;             // slug, ej. "medicina_natural"
    descripcionActividad: string;  // descripción breve del negocio — solo para el motor RPA, no se guarda
    tipoEvidencia: TipoEvidencia;
    textoEvidencia: string;   // usado si tipoEvidencia === 'texto'
    valorEvidencia: string;   // usado si tipoEvidencia === 'url'
    archivoPDF: File | null;  // usado si tipoEvidencia es catalogo/ficha/boleta/factura

    // ── Campos para el acuerdo comercial (contrato) — solo vendedor ──────────
    contacto: string;         // nombre del representante/contacto del SELLER
                              // usado en: encabezado del acuerdo ("representado por")
                              //           cláusula OCTAVA ("Administrador del Contrato — Nombre")
    domicilioLegal: string;   // dirección legal del SELLER
                              // usado en: encabezado del acuerdo ("con domicilio en")
}

export interface IntroConfig {
    title: string;
    subtitle: string;
    icon: string;
    backgroundImage: string;
    iconSize: string;
}

// ─── Resultado del RPA (registro-seller) ─────────────────────────────────────

export type EstadoEvaluacion = 'ACEPTADO' | 'REVISION' | 'RECHAZADO';
export type RiesgoEvaluacion = 'bajo' | 'medio' | 'alto';

export interface RpaResultado {
    estado: EstadoEvaluacion;
    score: number;
    riesgo: RiesgoEvaluacion;
    etapa: number;
    diagnostico: string[];
    application_id?: number;
    store_id?: number | null;
    error?: string;
}

// ─── Previsualización del acuerdo comercial ───────────────────────────────────

export interface ContratoPreviewResponse {
    html: string;   // HTML del acuerdo llenado, para mostrar en modal (solo lectura)
}