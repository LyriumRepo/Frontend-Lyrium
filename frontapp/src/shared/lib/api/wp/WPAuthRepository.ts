import { User, UserRole, LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, CustomerRegisterCredentials, CustomerRegisterResponse } from '@/lib/types/auth';
import { IAuthRepository } from '../contracts/IAuthRepository';

export class WPAuthRepository implements IAuthRepository {
    private getCustomLoginEndpoint(): string {
        const base = process.env.NEXT_PUBLIC_WP_API_URL ?? '/wp-json';
        return `${base}/custom/v1/login`;
    }

    private getValidateEndpoint(): string {
        const base = process.env.NEXT_PUBLIC_WP_API_URL ?? '/wp-json';
        return `${base}/custom/v1/validate`;
    }

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await fetch(this.getCustomLoginEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password,
                }),
            });

            if (!response.ok) {
                return { success: false, error: 'Credenciales inválidas' };
            }

            const data = await response.json();
            
            if (!data.token || !data.user) {
                return { success: false, error: 'Error en la respuesta del servidor' };
            }

            return {
                success: true,
                token: data.token,
                user: {
                    id: data.user.id,
                    username: data.user.username || data.user.user_login || '',
                    email: data.user.email || data.user.user_email || '',
                    nicename: data.user.nicename || data.user.user_nicename || '',
                    display_name: data.user.display_name || data.user.user_display_name || '',
                    role: (data.user.role as UserRole) || 'customer',
                    avatar: '',
                },
            };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async logout(): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    async refreshToken(): Promise<{ token: string }> {
        throw new Error('TODO Tarea 3: Implementar refresh token con WordPress');
    }

    async validateToken(token?: string): Promise<User | null> {
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(this.getValidateEndpoint(), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return {
                id: data.user.id,
                username: data.user.username || '',
                email: data.user.email || '',
                nicename: data.user.nicename || '',
                display_name: data.user.display_name || '',
                role: (data.user.role as UserRole) || 'customer',
                avatar: '',
            };
        } catch {
            return null;
        }
    }

    async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
        throw new Error('TODO Tarea 3: Conectar endpoint de registro');
    }

    async registerCustomer(credentials: CustomerRegisterCredentials): Promise<CustomerRegisterResponse> {
        throw new Error('TODO Tarea 3: Conectar endpoint de registro de cliente');
    }
}
