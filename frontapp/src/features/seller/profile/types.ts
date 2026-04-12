export interface BankSecondary {
    bank?: string;
    account?: string;
    cci?: string;
}

export interface VendorProfileData {
    razon_social: string;
    ruc: string;
    nombre_comercial: string;
    rep_legal_nombre: string;
    rep_legal_dni: string;
    rep_legal_foto?: string;
    experience_years: number;
    location: { departamento: string; provincia: string; distrito?: string };
    tax_condition: string;
    admin_nombre: string;
    admin_dni: string;
    admin_email: string;
    phone_1: string;
    phone_2: string;
    direccion_fiscal: string;
    cuenta_bcp: string;
    cci: string;
    bank_secondary?: BankSecondary | string;
    rrss: { instagram: string; facebook: string; tiktok: string };
    profileRequest?: {
        id: number;
        status: 'pending' | 'approved' | 'rejected';
        admin_notes?: string;
        attempts: number;
        created_at: string;
    } | null;
}
