/**
 * TwinMatch Admin API istemcisi.
 * - JWT access/refresh yönetimi (bellek içi; localStorage'a token yazılmaz — XSS koruması)
 * - 401'de otomatik refresh + tek retry
 * - UAT/production ortamında mock fallback kapatılabilir.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1";
export const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === "true";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

export function isAuthenticated() {
  return accessToken !== null;
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const r = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!r.ok) return false;
    const data = await r.json();
    accessToken = data.access;
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers ?? {}),
      },
    });

  let response = await doFetch();
  if (response.status === 401 && (await tryRefresh())) {
    response = await doFetch();
  }
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({ detail: "Giriş başarısız." }));
    throw new Error(body.detail ?? "Giriş başarısız.");
  }
  const data = await r.json();
  setTokens(data.tokens.access, data.tokens.refresh);
  return data.user;
}

// --- Tip tanımları (backend admin API şemasıyla birebir) ---

export interface DashboardPayload {
  users_total: number;
  users_active: number;
  users_verified: number;
  profiles_completed: number;
  digital_twins_active: number;
  matches_total: number;
  matches_active: number;
  matches_revealed: number;
  conversations_total: number;
  messages_total: number;
  subscriptions_active: number;
  monthly_revenue: number;
  pending_reports: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_phone_verified: boolean;
  date_joined: string;
}

export const getDashboard = () => apiFetch<DashboardPayload>("/admin/dashboard/");
export const getUsers = (q?: string) =>
  apiFetch<{ count: number; results: AdminUserRow[] }>(`/admin/users/${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const getMatchStats = () => apiFetch<Record<string, unknown>>("/admin/matches/");
export const getSubscriptionStats = () => apiFetch<Record<string, unknown>>("/admin/subscriptions/");
export const getReports = () => apiFetch<Record<string, unknown>>("/admin/reports/");
export const setUserStatus = (id: string, isActive: boolean) =>
  apiFetch(`/admin/users/${id}/status/`, { method: "PUT", body: JSON.stringify({ is_active: isActive }) });

// --- Faz 3: canlı admin sayfaları için tipler ---

export interface MatchStatsPayload {
  total_matches: number;
  active_matches: number;
  completed_matches: number;
  revealed_matches: number;
  average_score: number;
  stage_breakdown: Record<string, number>;
  top_pairs: { match_id: string; user_a: string; user_b: string; overall_score: number | null; status: string }[];
}

export interface SubscriptionStatsPayload {
  active_subscriptions: number;
  annual_subscriptions: number;
  monthly_revenue: number;
  plan_breakdown: Record<string, number>;
  payment_status_breakdown: Record<string, number>;
}

export interface ReportStatsPayload {
  pending_user_reports: number;
  pending_verifications: number;
  rejected_verifications: number;
  incomplete_profiles: number;
  inactive_digital_twins: number;
  low_score_matches: number;
}

export const getMatchStatsTyped = () => apiFetch<MatchStatsPayload>("/admin/matches/");
export const getSubscriptionStatsTyped = () => apiFetch<SubscriptionStatsPayload>("/admin/subscriptions/");
export const getReportStatsTyped = () => apiFetch<ReportStatsPayload>("/admin/reports/");
