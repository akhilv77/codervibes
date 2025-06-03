import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type StoreNames = 'settings' | 'currencyRates' | 'moneyTracker' | 'scorecard' | 'ipTracker' | 'regex' | 'regexTester' | 'jsonFormatter' | 'jwtDecoder' | 'urlEncoder' | 'htmlEncoder' | 'qrCode' | 'colorConverter' | 'textConverter' | 'yamlConverter' | 'csvConverter' | 'xmlFormatter' | 'markdownPreviewer' | 'htmlPreviewer' | 'diffChecker' | 'passwordGenerator' | 'hashGenerator' | 'minifier' | 'stringEscaper';

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
  passwordGenerator: {
    key: string;
    value: any;
  };
  hashGenerator: {
    key: string;
    value: any;
  };
  minifier: {
    key: string;
    value: any;
  };
  stringEscaper: {
    key: string;
    value: any;
  };
}

function createStores(db: IDBPDatabase<CoderVibesDB>) {
  const storeNames: StoreNames[] = [
    'settings', 'currencyRates', 'moneyTracker', 'scorecard', 'ipTracker',
    'regex', 'regexTester', 'jsonFormatter', 'jwtDecoder', 'urlEncoder',
    'htmlEncoder', 'qrCode', 'colorConverter', 'textConverter', 'yamlConverter',
    'csvConverter', 'xmlFormatter', 'markdownPreviewer', 'htmlPreviewer',
    'diffChecker', 'passwordGenerator', 'hashGenerator', 'minifier', 'stringEscaper'
  ];

  storeNames.forEach(storeName => {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName);
    }
  });
}

class IndexedDBService {
  private db: IDBPDatabase<CoderVibesDB> | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private readonly DB_VERSION = 23; // Update to match the existing version

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
        // First try to open the existing database
        try {
          this.db = await openDB<CoderVibesDB>('codervibes', this.DB_VERSION);
        } catch (error) {
          // If there's a version error, delete the database and recreate it
          if (error instanceof Error && error.name === 'VersionError') {
            await this.deleteDatabase();
            this.db = await openDB<CoderVibesDB>('codervibes', this.DB_VERSION, {
              upgrade: (db: IDBPDatabase<CoderVibesDB>, oldVersion: number, newVersion: number) => {
                createStores(db);
              },
            });
          } else {
            throw error;
          }
        }

        this.isInitialized = true;
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  private async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('codervibes');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
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