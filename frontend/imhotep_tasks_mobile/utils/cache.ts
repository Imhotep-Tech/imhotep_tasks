import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'offline_cache:';

/**
 * Save data to the offline cache.
 * Cache is namespaced per user to avoid data leaks between accounts.
 */
export async function cacheSet(key: string, data: any): Promise<void> {
  try {
    const cacheEntry = {
      data,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('[Cache] Failed to write cache:', key, error);
  }
}

/**
 * Read data from the offline cache.
 * Returns null if no cached data exists.
 */
export async function cacheGet<T = any>(key: string): Promise<{ data: T; timestamp: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[Cache] Failed to read cache:', key, error);
    return null;
  }
}

/**
 * Remove a specific cache entry.
 */
export async function cacheRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('[Cache] Failed to remove cache:', key, error);
  }
}

/**
 * Clear all offline cache entries.
 * Preserves auth tokens and other non-cache data.
 */
export async function cacheClearAll(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn('[Cache] Failed to clear cache:', error);
  }
}

/**
 * Build a user-scoped cache key.
 * e.g., buildCacheKey(5, 'today-tasks') → '5:today-tasks'
 */
export function buildCacheKey(userId: number | string, endpoint: string): string {
  return `${userId}:${endpoint}`;
}
