'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { PopularRates } from "@/components/currency-tracker/PopularRates";
import { PreferredCurrency } from "@/components/currency-tracker/PreferredCurrency";
import { ManagePopularCurrencies } from "@/components/currency-tracker/ManagePopularCurrencies";
import { CurrencyPageShell } from "@/components/layout/currency-page-shell";
import { PageHeader } from "@/components/layout/page-header";

interface ExchangeRates {
    rates: { [key: string]: number };
    base_code: string;
    time_last_update_utc: string;
}

const DEFAULT_POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'CNY'];
const STORAGE_KEYS = {
    PREFERRED_CURRENCY: 'preferredCurrency',
    POPULAR_CURRENCIES: 'popularCurrencies'
};

export default function CurrencyTracker() {
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [preferredCurrency, setPreferredCurrency] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEYS.PREFERRED_CURRENCY) || 'USD';
        }
        return 'USD';
    });
    const [popularCurrencies, setPopularCurrencies] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEYS.POPULAR_CURRENCIES);
            return stored ? JSON.parse(stored) : DEFAULT_POPULAR_CURRENCIES;
        }
        return DEFAULT_POPULAR_CURRENCIES;
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await response.json();
                setRates(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch exchange rates');
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    // Save preferred currency to localStorage when it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PREFERRED_CURRENCY, preferredCurrency);
    }, [preferredCurrency]);

    // Save popular currencies to localStorage when they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.POPULAR_CURRENCIES, JSON.stringify(popularCurrencies));
    }, [popularCurrencies]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(e.target.value));
    };

    const handleFromCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFromCurrency(e.target.value);
    };

    const handleToCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setToCurrency(e.target.value);
    };

    const handlePreferredCurrencyChange = (currency: string) => {
        setPreferredCurrency(currency);
        // If the preferred currency is selected in the converter, update the other field
        if (fromCurrency === currency) {
            setFromCurrency(toCurrency);
        } else if (toCurrency === currency) {
            setToCurrency(fromCurrency);
        }
    };

    const convertCurrency = () => {
        if (!rates) return 0;
        const fromRate = rates.rates[fromCurrency];
        const toRate = rates.rates[toCurrency];
        return (amount * toRate) / fromRate;
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <CurrencyPageShell>
            <div className="container mx-auto px-4 py-4 sm:py-8">
                <Alert className="mb-6">
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>
                        Exchange rates are updated once per day. Last updated: {rates?.time_last_update_utc}
                    </AlertDescription>
                </Alert>

                <PreferredCurrency
                    rates={rates?.rates || null}
                    preferredCurrency={preferredCurrency}
                    onPreferredCurrencyChange={handlePreferredCurrencyChange}
                />

                <ManagePopularCurrencies
                    rates={rates?.rates || null}
                    popularCurrencies={popularCurrencies}
                    onPopularCurrenciesChange={setPopularCurrencies}
                />

                <Card className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Currency Converter</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                className="w-full p-2 border rounded"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">From Currency</label>
                            <select
                                value={fromCurrency}
                                onChange={handleFromCurrencyChange}
                                className="w-full p-2 border rounded"
                            >
                                {rates && Object.keys(rates.rates).map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">To Currency</label>
                            <select
                                value={toCurrency}
                                onChange={handleToCurrencyChange}
                                className="w-full p-2 border rounded"
                            >
                                {rates && Object.keys(rates.rates).map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Converted Amount</label>
                            <div className="w-full p-2 border rounded bg-gray-50">
                                {convertCurrency().toFixed(2)} {toCurrency}
                            </div>
                        </div>
                    </div>
                </Card>

                <PopularRates
                    rates={rates?.rates || null}
                    preferredCurrency={preferredCurrency}
                    popularCurrencies={popularCurrencies}
                />
            </div>
        </CurrencyPageShell>
    );
} 