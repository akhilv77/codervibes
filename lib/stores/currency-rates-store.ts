import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

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
  setRates: (rates: CurrencyRates) => void;
  initialize: () => Promise<void>;
}

export const useCurrencyRatesStore = create<CurrencyRatesStore>((set) => ({
  rates: {},
  setRates: async (newRates) => {
    set({ rates: newRates });
    // Save to IndexedDB
    await db.set('currencyRates', 'rates', newRates);
  },
  initialize: async () => {
    try {
      const storedRates = await db.get<CurrencyRates>('currencyRates', 'rates');
      if (storedRates) {
        set({ rates: storedRates });
      }
    } catch (error) {
      console.error('Error initializing currency rates:', error);
    }
  },
})); 