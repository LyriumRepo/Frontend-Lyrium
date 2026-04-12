import { User, UserRole, LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, CustomerRegisterCredentials, CustomerRegisterResponse } from '@/lib/types/auth';

export interface IAuthRepository {
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    logout(): Promise<void>;
    refreshToken(): Promise<{ token: string }>;
    validateToken(): Promise<User | null>;
    register(credentials: RegisterCredentials): Promise<RegisterResponse>;
    registerCustomer(credentials: CustomerRegisterCredentials): Promise<CustomerRegisterResponse>;
}

export interface IUserRepository {
    getCurrentUser(): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    updateUser(id: number, data: Partial<User>): Promise<User>;
    getUsersByRole(role: UserRole): Promise<User[]>;
}
