import { openDB, DBSchema, IDBPDatabase } from 'idb';

type StoreNames = 'settings' | 'currencyRates' | 'moneyTracker' | 'scorecard' | 'groups' | 'members' | 'expenses' | 'settlements';

interface CoderVibesDB extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
  currencyRates: {
    key: string;
    value: any;
  };
  moneyTracker: {
    key: string;
    value: any;
  };
  scorecard: {
    key: string;
    value: any;
  };
  groups: {
    key: string;
    value: any;
  };
  members: {
    key: string;
    value: any;
  };
  expenses: {
    key: string;
    value: any;
  };
  settlements: {
    key: string;
    value: any;
  };
}

class IndexedDBService {
  private db: IDBPDatabase<CoderVibesDB> | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.db = await openDB<CoderVibesDB>('codervibes', 1, {
          upgrade(db) {
            // Create object stores
            if (!db.objectStoreNames.contains('settings')) {
              db.createObjectStore('settings');
            }
            if (!db.objectStoreNames.contains('currencyRates')) {
              db.createObjectStore('currencyRates');
            }
            if (!db.objectStoreNames.contains('moneyTracker')) {
              db.createObjectStore('moneyTracker');
            }
            if (!db.objectStoreNames.contains('scorecard')) {
              db.createObjectStore('scorecard');
            }
            if (!db.objectStoreNames.contains('groups')) {
              db.createObjectStore('groups');
            }
            if (!db.objectStoreNames.contains('members')) {
              db.createObjectStore('members');
            }
            if (!db.objectStoreNames.contains('expenses')) {
              db.createObjectStore('expenses');
            }
            if (!db.objectStoreNames.contains('settlements')) {
              db.createObjectStore('settlements');
            }
          },
        });
        this.isInitialized = true;
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  async get<T>(storeName: StoreNames, key: string): Promise<T | undefined> {
    if (typeof window === 'undefined') return undefined;
    if (!this.db) {
      await this.init();
    }
    if (!this.db) return undefined;
    return this.db.get(storeName, key);
  }

  async set<T>(storeName: StoreNames, key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) {
      await this.init();
    }
    if (!this.db) return;
    await this.db.put(storeName, value, key);
  }

  async delete(storeName: StoreNames, key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) {
      await this.init();
    }
    if (!this.db) return;
    await this.db.delete(storeName, key);
  }

  async clear(storeName: StoreNames): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) {
      await this.init();
    }
    if (!this.db) return;
    await this.db.clear(storeName);
  }

  async getAll<T>(storeName: StoreNames): Promise<T[]> {
    if (typeof window === 'undefined') return [];
    if (!this.db) {
      await this.init();
    }
    if (!this.db) return [];
    return this.db.getAll(storeName);
  }
}

// Create a singleton instance
const db = new IndexedDBService();

// Initialize the database when the module is imported
if (typeof window !== 'undefined') {
  db.init().catch(console.error);
}

export { db }; 