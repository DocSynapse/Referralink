/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hybrid Cache Service (L1: Memory + L2: IndexedDB)
 * Optimized for diagnosis query caching with 24h TTL
 */

import { ICD10Result } from '../types';

export interface CacheEntry {
  result: ICD10Result;
  timestamp: number;
  queryHash: string;
  originalQuery: string;
  model: string;
}

interface CacheConfig {
  ttlMs: number;
  maxEntries: number;
  dbName: string;
  storeName: string;
}

const DEFAULT_CONFIG: CacheConfig = {
  ttlMs: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 100,
  dbName: 'SentraDiagnosisCache',
  storeName: 'diagnoses'
};

/**
 * Normalize query for consistent hashing
 * Removes extra whitespace, converts to lowercase
 */
const normalizeQuery = (query: string): string => {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?]/g, '');
};

/**
 * Simple hash function for query keys
 * djb2 algorithm - fast and low collision
 */
const hashQuery = (query: string): string => {
  const normalized = normalizeQuery(query);
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash) + normalized.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
};

class DiagnosisCacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private db: IDBDatabase | null = null;
  private config: CacheConfig;
  private initPromise: Promise<void> | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initPromise = this.initDB();
  }

  private async initDB(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      console.warn('[Cache] IndexedDB not available, using memory-only cache');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, 1);

      request.onerror = () => {
        console.warn('[Cache] IndexedDB init failed, using memory-only');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.cleanupExpired();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'queryHash' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async ensureReady(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Get cached result for query
   * Checks L1 (memory) first, then L2 (IndexedDB)
   */
  async get(query: string): Promise<CacheEntry | null> {
    await this.ensureReady();
    const hash = hashQuery(query);
    const now = Date.now();

    // L1: Check memory cache first
    const memEntry = this.memoryCache.get(hash);
    if (memEntry) {
      if (now - memEntry.timestamp < this.config.ttlMs) {
        console.log('[Cache] L1 HIT:', hash.slice(0, 8));
        return memEntry;
      }
      // Expired, remove from memory
      this.memoryCache.delete(hash);
    }

    // L2: Check IndexedDB
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(this.config.storeName, 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(hash);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;
        if (entry && now - entry.timestamp < this.config.ttlMs) {
          // Promote to L1
          this.memoryCache.set(hash, entry);
          console.log('[Cache] L2 HIT:', hash.slice(0, 8));
          resolve(entry);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  }

  /**
   * Store result in cache (both L1 and L2)
   */
  async set(query: string, result: ICD10Result, model: string): Promise<void> {
    await this.ensureReady();
    const hash = hashQuery(query);

    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      queryHash: hash,
      originalQuery: query,
      model
    };

    // L1: Store in memory
    this.memoryCache.set(hash, entry);
    this.enforceMemoryLimit();

    // L2: Store in IndexedDB
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(this.config.storeName, 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      store.put(entry);

      transaction.oncomplete = () => {
        console.log('[Cache] SET:', hash.slice(0, 8), '| Model:', model);
        this.enforceDBLimit();
        resolve();
      };

      transaction.onerror = () => resolve();
    });
  }

  /**
   * Invalidate specific query or all cache
   */
  async invalidate(query?: string): Promise<void> {
    await this.ensureReady();

    if (query) {
      const hash = hashQuery(query);
      this.memoryCache.delete(hash);

      if (this.db) {
        const transaction = this.db.transaction(this.config.storeName, 'readwrite');
        const store = transaction.objectStore(this.config.storeName);
        store.delete(hash);
      }
      console.log('[Cache] INVALIDATE:', hash.slice(0, 8));
    } else {
      // Clear all
      this.memoryCache.clear();
      if (this.db) {
        const transaction = this.db.transaction(this.config.storeName, 'readwrite');
        const store = transaction.objectStore(this.config.storeName);
        store.clear();
      }
      console.log('[Cache] CLEAR ALL');
    }
  }

  /**
   * Invalidate all entries for a specific model
   * Used when model changes
   */
  async invalidateByModel(model: string): Promise<void> {
    await this.ensureReady();

    // Clear memory cache entries for this model
    for (const [hash, entry] of this.memoryCache.entries()) {
      if (entry.model === model) {
        this.memoryCache.delete(hash);
      }
    }

    // Clear IndexedDB entries for this model
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(this.config.storeName, 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const entry = cursor.value as CacheEntry;
          if (entry.model === model) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          console.log('[Cache] INVALIDATE_MODEL:', model);
          resolve();
        }
      };

      request.onerror = () => resolve();
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ memoryCount: number; dbCount: number; oldestEntry: number | null }> {
    await this.ensureReady();

    let dbCount = 0;
    let oldestEntry: number | null = null;

    if (this.db) {
      await new Promise<void>((resolve) => {
        const transaction = this.db!.transaction(this.config.storeName, 'readonly');
        const store = transaction.objectStore(this.config.storeName);
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          dbCount = countRequest.result;
        };

        const index = store.index('timestamp');
        const cursorRequest = index.openCursor();

        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && oldestEntry === null) {
            oldestEntry = cursor.value.timestamp;
          }
        };

        transaction.oncomplete = () => resolve();
      });
    }

    return {
      memoryCount: this.memoryCache.size,
      dbCount,
      oldestEntry
    };
  }

  private enforceMemoryLimit(): void {
    if (this.memoryCache.size <= this.config.maxEntries) return;

    // Remove oldest entries
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, entries.length - this.config.maxEntries);
    for (const [hash] of toRemove) {
      this.memoryCache.delete(hash);
    }
  }

  private async enforceDBLimit(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(this.config.storeName, 'readwrite');
    const store = transaction.objectStore(this.config.storeName);
    const countRequest = store.count();

    countRequest.onsuccess = () => {
      if (countRequest.result <= this.config.maxEntries) return;

      const index = store.index('timestamp');
      const cursorRequest = index.openCursor();
      let deleted = 0;
      const toDelete = countRequest.result - this.config.maxEntries;

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && deleted < toDelete) {
          cursor.delete();
          deleted++;
          cursor.continue();
        }
      };
    };
  }

  private async cleanupExpired(): Promise<void> {
    if (!this.db) return;

    const now = Date.now();
    const expireBefore = now - this.config.ttlMs;

    const transaction = this.db.transaction(this.config.storeName, 'readwrite');
    const store = transaction.objectStore(this.config.storeName);
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(expireBefore);
    const cursorRequest = index.openCursor(range);

    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }
}

// Singleton instance
export const diagnosisCache = new DiagnosisCacheService();
