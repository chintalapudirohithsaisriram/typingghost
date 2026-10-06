/**
 * Single persistence boundary. Everything goes through here so a backend
 * adapter can replace localStorage later without touching features.
 */
export type StorageAdapter = {
  read<T>(key: string): T | null;
  write<T>(key: string, value: T): void;
  remove(key: string): void;
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
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked */
    }
  },
  remove(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const storage: StorageAdapter = localAdapter;
