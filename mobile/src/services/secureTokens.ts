/**
 * Token'lar iOS Keychain / Android Keystore'da saklanır (expo-secure-store).
 * AsyncStorage/localStorage KULLANILMAZ — cihaz yedeklerine ve diğer
 * uygulamalara sızmaz. Modül yoksa (test/web) sessizce bellek-içi moda düşer.
 */

type Tokens = { access: string; refresh: string };

const KEY = "twinmatch.auth.v1";

let SecureStore: {
  getItemAsync(k: string): Promise<string | null>;
  setItemAsync(k: string, v: string, o?: object): Promise<void>;
  deleteItemAsync(k: string): Promise<void>;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require("expo-secure-store");
} catch {
  SecureStore = null;
}

export async function persistTokens(tokens: Tokens): Promise<void> {
  if (!SecureStore) return;
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(tokens), {
      keychainAccessible: (SecureStore as any).AFTER_FIRST_UNLOCK,
    });
  } catch {
    /* saklama başarısızsa oturum yalnızca bellek içi sürer */
  }
}

export async function loadTokens(): Promise<Tokens | null> {
  if (!SecureStore) return null;
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.access === "string" && typeof parsed?.refresh === "string") {
      return parsed as Tokens;
    }
    return null;
  } catch {
    return null;
  }
}

export async function wipeTokens(): Promise<void> {
  if (!SecureStore) return;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    /* yoksay */
  }
}
