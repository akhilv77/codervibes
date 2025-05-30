import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';
import { DEFAULT_POPULAR_CURRENCIES, STORAGE_KEYS } from '@/types/currency-tracker';
import { migrateCurrencyData } from '@/lib/db/migrate';

interface CurrencyRate {
  code: string;
  rate: number;
  lastUpdated: string;
}

interface CurrencyRates {
  [key: string]: CurrencyRate;
}

interface CurrencyRatesStore {
  rates: CurrencyRates;
  preferredCurrency: string;
  popularCurrencies: string[];
  setRates: (rates: CurrencyRates) => void;
  setPreferredCurrency: (currency: string) => Promise<void>;
  setPopularCurrencies: (currencies: string[]) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useCurrencyRatesStore = create<CurrencyRatesStore>((set) => ({
  rates: {},
  preferredCurrency: 'USD',
  popularCurrencies: DEFAULT_POPULAR_CURRENCIES,
  setRates: async (newRates) => {
    set({ rates: newRates });
    await db.set('currencyRates', 'rates', newRates);
  },
  setPreferredCurrency: async (currency) => {
    set({ preferredCurrency: currency });
    await db.set('currencyRates', STORAGE_KEYS.PREFERRED_CURRENCY, currency);
  },
  setPopularCurrencies: async (currencies) => {
    set({ popularCurrencies: currencies });
    await db.set('currencyRates', STORAGE_KEYS.POPULAR_CURRENCIES, currencies);
  },
  initialize: async () => {
    try {
      // Run migration first
      await migrateCurrencyData();

      const [storedRates, storedPreferred, storedPopular] = await Promise.all([
        db.get<CurrencyRates>('currencyRates', 'rates'),
        db.get<string>('currencyRates', STORAGE_KEYS.PREFERRED_CURRENCY),
        db.get<string[]>('currencyRates', STORAGE_KEYS.POPULAR_CURRENCIES)
      ]);

      set({
        rates: storedRates || {},
        preferredCurrency: storedPreferred || 'USD',
        popularCurrencies: storedPopular || DEFAULT_POPULAR_CURRENCIES
      });
    } catch (error) {
      console.error('Error initializing currency rates:', error);
    }
  },
})); 