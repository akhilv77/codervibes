import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type StoreNames = 'settings' | 'currencyRates' | 'moneyTracker' | 'scorecard' | 'ipTracker' | 'regex' | 'regexTester' | 'jsonFormatter' | 'jwtDecoder' | 'urlEncoder' | 'htmlEncoder' | 'qrCode' | 'colorConverter' | 'textConverter' | 'yamlConverter' | 'csvConverter' | 'xmlFormatter' | 'markdownPreviewer' | 'htmlPreviewer' | 'diffChecker' | 'passwordGenerator' | 'hashGenerator' | 'minifier' | 'stringEscaper' | 'timeConversion';

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
  timeConversion: {
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
    'diffChecker', 'passwordGenerator', 'hashGenerator', 'minifier', 'stringEscaper',
    'timeConversion'
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
  private readonly DB_VERSION = 24; // Increased version number for timeConversion store

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
        // Open the database with version handling
        this.db = await openDB<CoderVibesDB>('codervibes', this.DB_VERSION, {
          upgrade: (db: IDBPDatabase<CoderVibesDB>, oldVersion: number, newVersion: number) => {
            console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
            // Only create stores if they don't exist
            createStores(db);
          },
          blocked: () => {
            console.warn('Database is blocked by another connection');
          },
          blocking: () => {
            console.warn('Database is being blocked by another connection');
          },
        });

        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
        this.isInitialized = false;
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
    try {
      return await this.db.get(storeName, key);
    } catch (error) {
      console.error(`Error getting data from ${storeName}:`, error);
      return undefined;
    }
  }

  async set<T>(storeName: StoreNames, key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.db) {
      await this.init();
    }
    if (!this.db) return;
    try {
      await this.db.put(storeName, value, key);
    } catch (error) {
      console.error(`Error setting data in ${storeName}:`, error);
      throw error;
    }
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