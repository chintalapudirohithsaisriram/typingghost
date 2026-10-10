/**
 * Single persistence boundary. Everything goes through here so a backend
 * adapter can replace localStorage later without touching features.
 */
export type StorageAdapter = {
  read<T>(key: string): T | null;
  write<T>(key: string, value: T): boolean;
  remove(key: string): boolean;
};

const localAdapter: StorageAdapter = {
  read<T>(key: string) {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw && raw.length <= 2_000_000 ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  write(key, value) {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

export const storage: StorageAdapter = localAdapter;
