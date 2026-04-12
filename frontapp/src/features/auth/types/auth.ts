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
}

export interface IntroConfig {
    title: string;
    subtitle: string;
    icon: string;
    backgroundImage: string;
    iconSize: string;
}
