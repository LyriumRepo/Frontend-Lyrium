/**
 * Validation utilities to maintain 1:1 parity with legacy requirements
 */

export const validateRUC = (ruc: string): boolean => {
    return ruc.length === 11 && /^\d+$/.test(ruc);
};

export const validateDNI = (dni: string): boolean => {
    return dni.length === 8 && /^\d+$/.test(dni);
};

export const validateBCPAccount = (account: string): boolean => {
    return account.length === 14 && /^\d+$/.test(account);
};

export const validateCCI = (cci: string): boolean => {
    return cci.length === 20 && /^\d+$/.test(cci);
};

export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 9 && cleaned.length <= 15;
};

export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validateRequired = (value: string | undefined | null): boolean => {
    return value !== undefined && value !== null && value.trim().length > 0;
};

export const validateMinLength = (value: string, min: number): boolean => {
    return value.length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};

export const validateRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Debe tener al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Debe tener al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Debe tener al menos un número');
    }
    
    return { valid: errors.length === 0, errors };
};

export const allowOnlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
        e.preventDefault();
    }
};

export const allowOnlyLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
        e.preventDefault();
    }
};

export const allowAlphanumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
        e.preventDefault();
    }
};
