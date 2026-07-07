declare const process: { env?: Record<string, string | undefined> };

const API_BASE = process?.env?.EXPO_PUBLIC_API_BASE ?? 'http://localhost:8000/api/v1';

import { loadTokens, persistTokens, wipeTokens } from './secureTokens';

type Tokens = { access: string; refresh: string };
let tokens: Tokens | null = null;

export function setAuthTokens(next: Tokens | null) {
  tokens = next;
  if (next) {
    void persistTokens(next);
  } else {
    void wipeTokens();
  }
}

/** Uygulama açılışında Keychain/Keystore'dan oturumu geri yükler. */
export async function restoreSession(): Promise<boolean> {
  const saved = await loadTokens();
  if (!saved) return false;
  tokens = saved;
  return true;
}

export function getAuthTokens() {
  return tokens;
}

export function clearAuthTokens() {
  tokens = null;
  void wipeTokens();
}

async function refreshAccessToken(): Promise<boolean> {
  if (!tokens?.refresh) return false;
  try {
    const response = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    tokens = { ...tokens, access: data.access };
    void persistTokens(tokens);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const request = () =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        ...(options.headers ?? {}),
      },
    });

  let response = await request();
  if (response.status === 401 && (await refreshAccessToken())) {
    response = await request();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: `API hata kodu: ${response.status}` }));
    throw new Error(body.detail ?? JSON.stringify(body));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loginRequest(email: string, password: string) {
  const data = await apiFetch<{ user: any; tokens: Tokens }>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthTokens(data.tokens);
  return data.user;
}

export async function registerRequest(email: string, phone: string, password: string) {
  const data = await apiFetch<{ user: any; tokens: Tokens }>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ email, phone, password }),
  });
  setAuthTokens(data.tokens);
  return data.user;
}

export async function logoutRequest() {
  const refresh = tokens?.refresh;
  if (refresh) {
    await apiFetch('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }).catch(() => undefined);
  }
  clearAuthTokens();
}

export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };
