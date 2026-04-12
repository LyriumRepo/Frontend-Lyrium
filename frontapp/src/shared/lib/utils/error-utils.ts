export function getErrorMessage(error: unknown): string | null {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return String(error);
}

export function normalizeError(error: unknown): string | null {
    return getErrorMessage(error);
}

export function isError(value: unknown): value is Error {
    return value instanceof Error;
}
