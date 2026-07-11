export interface Branch {
    id: string;
    name: string;
    address: string;
    department: string;
    province: string;
    district: string;
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
    logoMarketplace: string;
    banner1: string;
    banner2?: string;
    banner3?: string;
    gallery: string[];
    adBanners: string[];
}

export interface Medal {
    id: string;
    name: string;
    description: string;
    icon: string;
    date: string;
}

export interface TopMedalEntity {
    id: string;
    name: string | null;
    slug: string;
    logo?: string | null;
    image?: string | null;
}

export interface TopMedal {
    id: string;
    entity_type: 'store' | 'product' | 'service';
    entity: TopMedalEntity | null;
    rank_position: number | null;
    status: 'pending' | 'approved' | 'suspended';
    visible: boolean;
    medal_image_url: string | null;
    times_entered: number;
    times_exited: number;
    detected_at: string;
    approved_at: string | null;
    suspended_at: string | null;
    grace_ends_at: string | null;
    created_at: string;
}

export interface PlanCapabilities {
    max_products: number;
    max_services: number;
    max_specialists: number;
    max_branches: number;
    max_social_links: number;
    max_gallery_images: number;
    max_ad_banners: number;
    max_main_banners: number;
    sticker_types: string[];
    layouts: number[];
    can_training: boolean;
    can_bioblog: boolean;
    can_export_csv: boolean;
    can_export_excel: boolean;
    can_export_pdf: boolean;
    can_finance_charts: boolean;
    can_google_calendar: boolean;
    can_coupons: boolean;
    can_api: boolean;
    can_white_label: boolean;
    can_market_analysis: boolean;
    support_hours: number;
    search_priority: string;
    forum_topics_per_week: number;
    bioblog_articles_per_week: number;
    bioblog_videos_per_week: number;
    bioblog_podcasts_per_week: number;
    bioblog_shorts_per_week: number;
    [key: string]: number | boolean | number[] | string[] | string;
}

export interface SubscriptionInfo {
    plan: {
        id?: number;
        name: string;
        slug: string;
        capabilities?: PlanCapabilities;
    };
    status: string;
    starts_at?: string;
    ends_at?: string;
    is_active?: boolean;
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
    plan_capabilities?: PlanCapabilities;
    rating?: number;
    totalSales?: number;
    totalOrders?: number;
    verifiedAt?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'banned';
}
