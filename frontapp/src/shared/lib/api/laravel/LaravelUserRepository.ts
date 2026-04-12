import { User, UserRole, UserLocation } from '@/lib/types/auth';
import { IUserRepository, UserFilters, UpdateUserInput } from '../contracts/IUserRepository';

export interface UpdateUserInputExtended extends UpdateUserInput {
    phone?: string;
    document_type?: string;
    document_number?: string;
    location?: UserLocation;
    admin_nombre?: string;
    admin_dni?: string;
    phone_2?: string;
}

export class LaravelUserRepository implements IUserRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    private async getToken(): Promise<string | null> {
        // Client-side: read from document.cookie
        if (typeof window !== 'undefined') {
            const match = document.cookie.match(/laravel_token=([^;]+)/);
            if (match && match[1]) {
                const rawToken = match[1];
                const token = rawToken.includes('%') ? decodeURIComponent(rawToken) : rawToken;
                console.log('[LaravelUserRepository] Token from client:', token.substring(0, 20) + '...');
                return token;
            }
            console.log('[LaravelUserRepository] No laravel_token cookie found in client');
            return null;
        }
        
        // Server-side: use next/headers
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const value = cookieStore.get('laravel_token')?.value ?? null;
            console.log('[LaravelUserRepository] Token from server:', value ? 'found' : 'not found');
            return value;
        } catch (e) {
            console.log('[LaravelUserRepository] Error getting token:', e);
            return null;
        }
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const token = await this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const baseUrl = this.getBaseUrl();
        const authHeaders = await this.getAuthHeaders();
        
        console.log('[LaravelUserRepository] Making request to:', endpoint, 'Token exists:', !!authHeaders.Authorization);

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers,
            },
        });

        console.log('[LaravelUserRepository] Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.log('[LaravelUserRepository] 401 Unauthorized - token may be invalid');
                return null as unknown as T;
            }
            throw new Error(`Laravel API Error: ${response.status}`);
        }

        return response.json();
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            return await this.request<User>('/users/me');
        } catch {
            return null;
        }
    }

    async getUserById(id: number): Promise<User | null> {
        try {
            return await this.request<User>(`/users/${id}`);
        } catch {
            return null;
        }
    }

    async getUsers(filters?: UserFilters): Promise<User[]> {
        const params = new URLSearchParams();
        if (filters?.role) params.set('role', filters.role);
        if (filters?.search) params.set('search', filters.search);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request<User[]>(`/users${query}`);
    }

    async getUsersByRole(role: UserRole): Promise<User[]> {
        return this.request<User[]>(`/users/role/${role}`);
    }

    async updateUser(id: number, input: UpdateUserInputExtended): Promise<User> {
        return this.request<User>(`/users/profile`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    }

    async deleteUser(id: number): Promise<boolean> {
        await this.request(`/users/${id}`, {
            method: 'DELETE',
        });
        return true;
    }
}
