import { create } from 'zustand';
import { clearAuthTokens, loginRequest, logoutRequest, registerRequest, apiFetch, restoreSession } from '../services/api';

type AuthState = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  phoneVerified: boolean;
  ageConfirmed: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email?: string, password?: string) => Promise<void> | void;
  register: (email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void> | void;
  completeOnboarding: () => void;
  verifyPhone: () => void;
  confirmAge: () => Promise<void> | void;
  refreshMe: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  phoneVerified: false,
  ageConfirmed: false,
  user: null,
  loading: false,
  error: null,
  login: async (email?: string, password?: string) => {
    // Eski demo ekranları argümansız çağırırsa akışı kırma; gerçek market/UAT için email+password zorunlu.
    if (!email || !password) {
      set({ isAuthenticated: true, error: 'Demo login kullanıldı; gerçek UAT için backend login gerekli.' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const user = await loginRequest(email, password);
      set({
        user,
        isAuthenticated: true,
        phoneVerified: Boolean(user.is_phone_verified),
        ageConfirmed: Boolean(user.is_age_confirmed),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Giriş başarısız.' });
      throw error;
    }
  },
  register: async (email, phone, password) => {
    set({ loading: true, error: null });
    try {
      const user = await registerRequest(email, phone, password);
      set({
        user,
        isAuthenticated: true,
        phoneVerified: Boolean(user.is_phone_verified),
        ageConfirmed: Boolean(user.is_age_confirmed),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Kayıt başarısız.' });
      throw error;
    }
  },
  logout: async () => {
    await logoutRequest();
    clearAuthTokens();
    set({ isAuthenticated: false, phoneVerified: false, ageConfirmed: false, user: null });
  },
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  verifyPhone: () => set({ phoneVerified: true }),
  confirmAge: async () => {
    try {
      const response = await apiFetch<{ user: any }>('/auth/age-confirm/', {
        method: 'POST',
        body: JSON.stringify({ is_age_confirmed: true }),
      });
      set({ ageConfirmed: true, isAuthenticated: true, user: response.user });
    } catch {
      set({ ageConfirmed: true, isAuthenticated: true });
    }
  },
  bootstrap: async () => {
    // Açılışta Keychain/Keystore'dan oturum geri yüklenir; token geçersizse sessizce login'e düşer.
    const restored = await restoreSession();
    if (!restored) return;
    try {
      await get().refreshMe();
    } catch {
      clearAuthTokens();
      set({ isAuthenticated: false, user: null });
    }
  },
  refreshMe: async () => {
    const user = await apiFetch<any>('/auth/me/');
    set({ user, isAuthenticated: true, phoneVerified: Boolean(user.is_phone_verified), ageConfirmed: Boolean(user.is_age_confirmed) });
  },
}));
