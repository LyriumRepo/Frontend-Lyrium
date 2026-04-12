import { User, LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, CustomerRegisterCredentials, CustomerRegisterResponse } from '@/lib/types/auth';
import { IAuthRepository } from '../contracts/IAuthRepository';

export class LaravelAuthRepository implements IAuthRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    private async getToken(): Promise<string | null> {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            return cookieStore.get('laravel_token')?.value ?? null;
        } catch {
            return null;
        }
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const baseUrl = this.getBaseUrl();
        const authHeaders = await this.getAuthHeaders();

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Laravel API Error: ${response.status}`);
        }

        return response.json();
    }

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await fetch(`${this.getBaseUrl()}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.username,
                    password: credentials.password,
                }),
            });

            if (!response.ok) {
                return { success: false, error: 'Credenciales inválidas' };
            }

            const data = await response.json();
            return {
                success: true,
                token: data.token,
                user: data.user,
            };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async logout(): Promise<void> {
        const token = await this.getToken();
        if (!token) return;

        try {
            await fetch(`${this.getBaseUrl()}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async refreshToken(): Promise<{ token: string }> {
        const token = await this.getToken();
        if (!token) {
            throw new Error('No token available');
        }

        const response = await fetch(`${this.getBaseUrl()}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        return { token: data.token };
    }

    async validateToken(): Promise<User | null> {
        const token = await this.getToken();
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(`${this.getBaseUrl()}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.user || null;
        } catch {
            return null;
        }
    }

    async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
        try {
            const response = await fetch(`${this.getBaseUrl()}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: credentials.storeName,
                    email: credentials.email,
                    phone: credentials.phone,
                    password: credentials.password,
                    ruc: credentials.ruc,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { 
                    success: false, 
                    error: data.message || data.error || 'Error en el registro' 
                };
            }

            return {
                success: true,
                message: 'Registro exitoso',
            };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async registerCustomer(credentials: CustomerRegisterCredentials): Promise<CustomerRegisterResponse> {
        try {
            const response = await fetch(`${this.getBaseUrl()}/auth/register-customer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: credentials.name,
                    email: credentials.email,
                    phone: credentials.phone,
                    password: credentials.password,
                    document_type: credentials.document_type || 'DNI',
                    document_number: credentials.document_number,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { 
                    success: false, 
                    error: data.message || data.error || 'Error en el registro' 
                };
            }

            return {
                success: true,
                message: 'Registro exitoso',
                user: data.user,
            };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }
}
