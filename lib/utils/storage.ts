/**
 * Storage utilities for localStorage and sessionStorage
 */

type StorageType = 'local' | 'session';

class StorageManager {
  private getStorage(type: StorageType): Storage | null {
    if (typeof window === 'undefined') return null;
    return type === 'local' ? localStorage : sessionStorage;
  }

  /**
   * Get item from storage
   */
  get<T>(key: string, type: StorageType = 'local'): T | null {
    const storage = this.getStorage(type);
    if (!storage) return null;

    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from ${type}Storage:`, error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  set<T>(key: string, value: T, type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;

    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in ${type}Storage:`, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string, type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;

    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from ${type}Storage:`, error);
      return false;
    }
  }

  /**
   * Clear all items from storage
   */
  clear(type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;

    try {
      storage.clear();
      return true;
    } catch (error) {
      console.error(`Error clearing ${type}Storage:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in storage
   */
  has(key: string, type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    if (!storage) return false;
    return storage.getItem(key) !== null;
  }

  /**
   * Get all keys from storage
   */
  keys(type: StorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    if (!storage) return [];

    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  /**
   * Get storage size in bytes (approximate)
   */
  getSize(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    if (!storage) return 0;

    let size = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key);
        size += key.length + (value?.length || 0);
      }
    }
    return size;
  }
}

export const storage = new StorageManager();

/**
 * Cookie utilities
 */
export const cookies = {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }

    return null;
  },

  set(
    name: string,
    value: string,
    options: {
      days?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {}
  ): void {
    if (typeof document === 'undefined') return;

    const {
      days = 7,
      path = '/',
      domain,
      secure = true,
      sameSite = 'lax',
    } = options;

    let cookie = `${name}=${value}`;

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    }

    cookie += `; path=${path}`;

    if (domain) {
      cookie += `; domain=${domain}`;
    }

    if (secure) {
      cookie += '; secure';
    }

    cookie += `; samesite=${sameSite}`;

    document.cookie = cookie;
  },

  remove(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  },
};
