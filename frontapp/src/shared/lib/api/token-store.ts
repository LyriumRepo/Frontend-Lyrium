const STORAGE_KEY = 'laravel_token';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function decodeToken(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return decoded;
  } catch {
    return raw;
  }
}

function getTokenFromCookie(): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${STORAGE_KEY}=([^;]*)`));
  return decodeToken(match ? match[1] : null);
}

function getTokenFromStorage(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setTokenInStorage(token: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
  }
}

function clearTokenInStorage(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
}

async function getTokenFromServer(): Promise<string | null> {
  if (!isBrowser()) return null;
  try {
    const response = await fetch('/api/auth/token', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    const token = decodeToken(data?.token ?? null);
    if (token) {
      setTokenInStorage(token);
    }
    return token;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getTokenFromStorage() || getTokenFromCookie();
}

export async function getTokenAsync(): Promise<string | null> {
  const local = getToken();
  if (local) return local;
  return getTokenFromServer();
}

export function setToken(token: string): void {
  const decoded = decodeToken(token);
  if (decoded) {
    setTokenInStorage(decoded);
  }
}

export function clearToken(): void {
  clearTokenInStorage();
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getTokenAsync();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
