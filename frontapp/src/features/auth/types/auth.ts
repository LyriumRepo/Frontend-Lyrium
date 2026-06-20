export type UserType = 'vendedor' | 'cliente';
export type AuthMode = 'login' | 'register';

export interface LoginFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterFormData {
    storeName: string;
    email: string;
    phone: string;
    password: string;
    ruc: string;
    dni: string;
    categoria: string;
    descripcionActividad: string;
    tipoEvidencia: 'url' | 'texto' | 'catalogo' | 'ficha' | 'boleta' | 'factura';
    valorEvidencia: string;
    textoEvidencia: string;
    archivoPDF?: File | null;
    contacto: string;
    domicilioLegal: string;
}

export type RpaEstado = 'ACEPTADO' | 'REVISION' | 'RECHAZADO';
export type RpaRiesgo = 'BAJO' | 'MEDIO' | 'ALTO';

export interface RpaResult {
    estado: RpaEstado;
    score: number;
    riesgo: RpaRiesgo;
    etapa: number;
    diagnostico: string[];
    application_id: number;
    store_id: number | null;
}

export type RegistroStep = 'form' | 'loading' | 'result';

export interface IntroConfig {
    title: string;
    subtitle: string;
    icon: string;
    backgroundImage: string;
    iconSize: string;
}
