import { db } from './indexed-db';
import { STORAGE_KEYS } from '@/types/currency-tracker';

export async function migrateCurrencyData() {
    try {
        // Get data from settings store
        const [preferredCurrency, popularCurrencies] = await Promise.all([
            db.get<string>('settings', STORAGE_KEYS.PREFERRED_CURRENCY),
            db.get<string[]>('settings', STORAGE_KEYS.POPULAR_CURRENCIES)
        ]);

        // If data exists in settings store, move it to currencyRates store
        if (preferredCurrency) {
            await db.set('currencyRates', STORAGE_KEYS.PREFERRED_CURRENCY, preferredCurrency);
            await db.delete('settings', STORAGE_KEYS.PREFERRED_CURRENCY);
        }

        if (popularCurrencies) {
            await db.set('currencyRates', STORAGE_KEYS.POPULAR_CURRENCIES, popularCurrencies);
            await db.delete('settings', STORAGE_KEYS.POPULAR_CURRENCIES);
        }
    } catch (error) {
        console.error('Error migrating currency data:', error);
    }
} 