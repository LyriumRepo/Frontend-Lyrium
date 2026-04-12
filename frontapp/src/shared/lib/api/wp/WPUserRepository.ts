import { User, UserRole } from '@/lib/types/auth';
import { IUserRepository, UserFilters, UpdateUserInput } from '../contracts/IUserRepository';

export class WPUserRepository implements IUserRepository {
    private getAuthHeaders() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private getApiUrl(): string {
        return process.env.NEXT_PUBLIC_WP_API_URL || '/wp-json';
    }

    async getCurrentUser(): Promise<User | null> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return null;

        try {
            const response = await fetch(`${this.getApiUrl()}/wp/v2/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) return null;
            const data = await response.json();
            return {
                id: data.id,
                username: data.username,
                email: data.email,
                nicename: data.nicename,
                display_name: data.name,
                role: data.roles?.[0] as UserRole || 'customer',
                avatar: data.avatar_urls?.['96'],
            };
        } catch {
            return null;
        }
    }

    async getUserById(id: number): Promise<User | null> {
        throw new Error('TODO Tarea 3: Conectar endpoint de usuarios');
    }

    async getUsers(filters?: UserFilters): Promise<User[]> {
        throw new Error('TODO Tarea 3: Conectar endpoint de usuarios');
    }

    async getUsersByRole(role: UserRole): Promise<User[]> {
        throw new Error('TODO Tarea 3: Conectar endpoint filtrado por rol');
    }

    async updateUser(id: number, input: UpdateUserInput): Promise<User> {
        throw new Error('TODO Tarea 3: Conectar endpoint de actualización');
    }

    async deleteUser(id: number): Promise<boolean> {
        throw new Error('TODO Tarea 3: Conectar endpoint de eliminación');
    }
}
