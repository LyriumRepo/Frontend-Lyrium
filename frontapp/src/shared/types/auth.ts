export type UserRole = 'administrator' | 'seller' | 'customer' | 'logistics_operator';

export interface UserLocation {
    departamento?: string;
    provincia?: string;
    distrito?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    nicename: string;
    display_name: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    document_type?: 'DNI' | 'CE' | 'PAS' | 'RUC';
    document_number?: string;
    location?: UserLocation;
    admin_nombre?: string;
    admin_dni?: string;
    phone_2?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
    error?: string;
}

export interface RegisterCredentials {
    storeName: string;
    email: string;
    phone: string;
    password: string;
    ruc: string;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export interface CustomerRegisterCredentials {
    name: string;
    email: string;
    phone: string;
    password: string;
    document_type?: 'DNI' | 'CE' | 'PAS';
    document_number?: string;
}

export interface CustomerRegisterResponse {
    success: boolean;
    message?: string;
    error?: string;
    user?: User;
}
