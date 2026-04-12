export interface Store {
  id: number;
  store_name: string;
  first_name: string;
  last_name: string;
  social: {
    fb: string;
    youtube: string;
    twitter: string;
    linkedin: string;
    pinterest: string;
    instagram: string;
    flickr: string;
    threads: string;
  };
  phone: string;
  show_email: boolean;
  address: {
    street_1: string;
    street_2: string;
    city: string;
    zip: string;
    country: string;
    state: string;
  };
  location: string;
  banner: string;
  banner_id: number;
  gravatar: string;
  gravatar_id: number;
  shop_url: string;
  toc_enabled: boolean;
  store_toc: string;
  featured: boolean;
  rating: {
    rating: string | number;
    count: number;
  };
  registered: string;
  trusted: boolean;
  is_verified: boolean;
  company_name?: string;
  vat_number?: string;
  bank_name?: string;
  bank_iban?: string;
  email?: string;
}
