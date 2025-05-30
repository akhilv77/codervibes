export interface ExchangeRates {
    rates: { [key: string]: number };
    base_code: string;
    time_last_update_utc: string;
}

export const DEFAULT_POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'CNY'];

export const STORAGE_KEYS = {
    PREFERRED_CURRENCY: 'preferredCurrency',
    POPULAR_CURRENCIES: 'popularCurrencies'
} as const; 