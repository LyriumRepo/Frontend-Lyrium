export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    hours: string;
    isPrincipal: boolean;
    mapsUrl?: string;
}

export interface SocialLinks {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
}

export interface ShopPolicies {
    shippingPdf?: string;
    returnPdf?: string;
    privacyPdf?: string;
}

export interface VisualIdentity {
    logo: string;
    banner1: string;
    banner2?: string;
    gallery: string[];
}

export interface Medal {
    id: string;
    name: string;
    description: string;
    icon: string;
    date: string;
}

export interface SubscriptionInfo {
    plan: {
        name: string;
        slug: string;
    };
    status: string;
    starts_at?: string;
    ends_at?: string;
}

export interface ShopConfig {
    name: string;
    trade_name?: string;
    category: string;
    category_id?: number;
    activity: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    social: SocialLinks;
    policies: ShopPolicies;
    visual: VisualIdentity;
    layout: '1' | '2' | '3';
    medals: Medal[];
    ruc?: string;
    razon_social?: string;
    nombre_comercial?: string;
    rep_legal_nombre?: string;
    rep_legal_dni?: string;
    rep_legal_foto?: string;
    experience_years?: number;
    tax_condition?: string;
    direccion_fiscal?: string;
    cuenta_bcp?: string;
    cci?: string;
    bank_secondary?: string;
    // Estatus fields
    subscription?: SubscriptionInfo;
    rating?: number;
    totalSales?: number;
    totalOrders?: number;
    verifiedAt?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'banned';
}
