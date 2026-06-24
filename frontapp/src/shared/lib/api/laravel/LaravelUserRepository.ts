import { User, UserRole } from '@/lib/types/auth';
import { IUserRepository, UserFilters, UpdateUserInput } from '../contracts/IUserRepository';

export class LaravelUserRepository implements IUserRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    private async getToken(): Promise<string | null> {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('laravel_token');

            console.log(
                '[LaravelUserRepository] Token from client:',
                token ? token.substring(0, 20) + '...' : 'not found'
            );

            return token;
        }
        
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const value = cookieStore.get('laravel_token')?.value ?? null;
            console.log('[LaravelUserRepository] Token from server:', value ? 'found' : 'not found');
            const token = value ? decodeURIComponent(value) : null;
            return token;
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

        console.log('FULL URL', `${baseUrl}${endpoint}`);
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.log('[LaravelUserRepository] 401 Unauthorized');
                return null as unknown as T;
            }
            const body = await response.json().catch(() => ({})) as Record<string, unknown>;
            const message = (body?.message as string) || `Error ${response.status}`;
            const err = new Error(message) as Error & { status: number; validationErrors?: Record<string, string[]> };
            err.status = response.status;
            if (response.status === 422 && body?.errors) {
                err.validationErrors = body.errors as Record<string, string[]>;
            }
            throw err;
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

    async updateUser(id: number, input: UpdateUserInput): Promise<User> {
        return this.request<User>(`/users/profile`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    }

    async uploadAvatar(file: File): Promise<{ avatar: string }> {
        const token = await this.getToken();
        const baseUrl = this.getBaseUrl();
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${baseUrl}/users/avatar`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Avatar upload failed: ${response.status}`);
        }

        return response.json();
    }

    async deleteUser(id: number): Promise<boolean> {
        await this.request(`/users/${id}`, {
            method: 'DELETE',
        });
        return true;
    }
}
