import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type StoreNames = 'settings' | 'currencyRates' | 'moneyTracker' | 'scorecard' | 'ipTracker' | 'regex' | 'regexTester' | 'jsonFormatter' | 'jwtDecoder' | 'urlEncoder' | 'htmlEncoder' | 'qrCode' | 'colorConverter' | 'textConverter' | 'yamlConverter' | 'csvConverter' | 'xmlFormatter' | 'markdownPreviewer' | 'htmlPreviewer' | 'diffChecker';

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
  ipTracker: {
    key: string;
    value: string[];
  };
  regex: {
    key: string;
    value: any;
  };
  regexTester: {
    key: string;
    value: any;
  };
  jsonFormatter: {
    key: string;
    value: any;
  };
  jwtDecoder: {
    key: string;
    value: any;
  };
  urlEncoder: {
    key: string;
    value: any;
  };
  htmlEncoder: {
    key: string;
    value: any;
  };
  qrCode: {
    key: string;
    value: any;
  };
  colorConverter: {
    key: string;
    value: any;
  };
  textConverter: {
    key: string;
    value: any;
  };
  yamlConverter: {
    key: string;
    value: any;
  };
  csvConverter: {
    key: string;
    value: any;
  };
  xmlFormatter: {
    key: string;
    value: any;
  };
  markdownPreviewer: {
    key: string;
    value: any;
  };
  htmlPreviewer: {
    key: string;
    value: any;
  };
  diffChecker: {
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
        this.db = await openDB<CoderVibesDB>('codervibes', 17, {
          upgrade(db, oldVersion, newVersion) {
            // Create stores if they don't exist
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
            if (!db.objectStoreNames.contains('ipTracker')) {
              db.createObjectStore('ipTracker');
            }
            if (!db.objectStoreNames.contains('regex')) {
              db.createObjectStore('regex');
            }
            if (!db.objectStoreNames.contains('regexTester')) {
              db.createObjectStore('regexTester');
            }
            if (!db.objectStoreNames.contains('jsonFormatter')) {
              db.createObjectStore('jsonFormatter');
            }
            if (!db.objectStoreNames.contains('jwtDecoder')) {
              db.createObjectStore('jwtDecoder');
            }
            if (!db.objectStoreNames.contains('urlEncoder')) {
              db.createObjectStore('urlEncoder');
            }
            if (!db.objectStoreNames.contains('htmlEncoder')) {
              db.createObjectStore('htmlEncoder');
            }
            if (!db.objectStoreNames.contains('qrCode')) {
              db.createObjectStore('qrCode');
            }
            if (!db.objectStoreNames.contains('colorConverter')) {
              db.createObjectStore('colorConverter');
            }
            if (!db.objectStoreNames.contains('textConverter')) {
              db.createObjectStore('textConverter');
            }
            if (!db.objectStoreNames.contains('yamlConverter')) {
              db.createObjectStore('yamlConverter');
            }
            if (!db.objectStoreNames.contains('csvConverter')) {
              db.createObjectStore('csvConverter');
            }
            if (!db.objectStoreNames.contains('xmlFormatter')) {
              db.createObjectStore('xmlFormatter');
            }
            if (!db.objectStoreNames.contains('markdownPreviewer')) {
              db.createObjectStore('markdownPreviewer');
            }
            if (!db.objectStoreNames.contains('htmlPreviewer')) {
              db.createObjectStore('htmlPreviewer');
            }
            if (!db.objectStoreNames.contains('diffChecker')) {
              db.createObjectStore('diffChecker');
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