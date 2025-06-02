import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type StoreNames = 'settings' | 'currencyRates' | 'moneyTracker' | 'scorecard' | 'ipTracker' | 'regex' | 'regexTester' | 'jsonFormatter' | 'jwtDecoder' | 'urlEncoder' | 'htmlEncoder' | 'qrCode' | 'colorConverter' | 'textConverter' | 'yamlConverter' | 'csvConverter' | 'xmlFormatter' | 'markdownPreviewer' | 'htmlPreviewer' | 'diffChecker' | 'passwordGenerator' | 'hashGenerator' | 'minifier' | 'lorem-ipsum' | 'caseConverter';

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
    value: any;
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
  'lorem-ipsum': {
    key: string;
    value: any;
  };
  caseConverter: {
    key: string;
    value: any;
  };
}

export class IndexedDBService {
  private db: IDBPDatabase<CoderVibesDB> | null = null;
  private isInitialized = false;
  private readonly DB_NAME = 'codervibes';
  private readonly DB_VERSION = 1;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    if (this.isInitialized) return;

    try {
      // First, try to delete the old database if it exists
      try {
        await indexedDB.deleteDatabase('codervibes-db');
      } catch (error) {
        console.log('No old database to delete');
      }

      this.db = await openDB<CoderVibesDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
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
          if (!db.objectStoreNames.contains('passwordGenerator')) {
            db.createObjectStore('passwordGenerator');
          }
          if (!db.objectStoreNames.contains('hashGenerator')) {
            db.createObjectStore('hashGenerator');
          }
          if (!db.objectStoreNames.contains('minifier')) {
            db.createObjectStore('minifier');
          }
          if (!db.objectStoreNames.contains('lorem-ipsum')) {
            db.createObjectStore('lorem-ipsum');
          }
          if (!db.objectStoreNames.contains('caseConverter')) {
            db.createObjectStore('caseConverter');
          }
        },
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  async get(storeName: StoreNames, key: string): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.get(storeName, key);
  }

  async set(storeName: StoreNames, key: string, value: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.put(storeName, value, key);
  }

  async delete(storeName: StoreNames, key: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.delete(storeName, key);
  }

  async getAll(storeName: StoreNames): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.getAll(storeName);
  }

  async addToHistory(storeName: StoreNames, item: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const history = await this.getHistory(storeName);
    const newHistory = [item, ...history].slice(0, 10); // Keep only last 10 items
    await this.db.put(storeName, newHistory, 'history');
  }

  async getHistory(storeName: StoreNames): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const history = await this.db.get(storeName, 'history');
    return history || [];
  }

  async clearHistory(storeName: StoreNames): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.put(storeName, [], 'history');
  }
}

export const db = new IndexedDBService(); 