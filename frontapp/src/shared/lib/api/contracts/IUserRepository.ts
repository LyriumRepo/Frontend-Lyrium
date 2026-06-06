import { User, UserRole, UserLocation } from '@/lib/types/auth';

export interface UserFilters {
    role?: UserRole;
    search?: string;
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    phone_2?: string;
    secondary_email?: string;
    landline?: string;
    birthday?: string;
    document_type?: string;
    document_number?: string;
    location?: UserLocation;
    admin_nombre?: string;
    admin_dni?: string;
}

export interface IUserRepository {
    getCurrentUser(): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    getUsers(filters?: UserFilters): Promise<User[]>;
    getUsersByRole(role: UserRole): Promise<User[]>;
    updateUser(id: number, input: UpdateUserInput): Promise<User>;
    uploadAvatar(file: File): Promise<{ avatar: string }>;
    deleteUser(id: number): Promise<boolean>;
}
