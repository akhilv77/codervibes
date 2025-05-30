'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowRight, RefreshCw } from "lucide-react";
import { PopularRates } from "@/components/currency-tracker/PopularRates";
import { PreferredCurrency } from "@/components/currency-tracker/PreferredCurrency";
import { ManagePopularCurrencies } from "@/components/currency-tracker/ManagePopularCurrencies";
import { useServiceTracking } from '@/hooks/useServiceTracking';
import { DEFAULT_POPULAR_CURRENCIES, STORAGE_KEYS, type ExchangeRates } from '@/types/currency-tracker';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/db/indexed-db';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrencyRatesStore } from '@/lib/stores/currency-rates-store';

export default function CurrencyTracker() {
    const { trackServiceUsage } = useServiceTracking();
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [refreshing, setRefreshing] = useState(false);

    const {
        preferredCurrency,
        popularCurrencies,
        setPreferredCurrency,
        setPopularCurrencies,
        initialize: initializeCurrencyRates
    } = useCurrencyRatesStore();

    useEffect(() => {
        initializeCurrencyRates();
    }, [initializeCurrencyRates]);

    const fetchRates = async () => {
        try {
            setRefreshing(true);
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();
            setRates(data);
            setLoading(false);
            setError(null);
        } catch (err) {
            setError('Failed to fetch exchange rates');
            setLoading(false);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        trackServiceUsage('Currency Tracker', 'page_view');
        fetchRates();
    }, []);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(e.target.value));
        trackServiceUsage('Currency Tracker', 'amount_change', `Amount: ${e.target.value}`);
    };

    const handleFromCurrencyChange = (value: string) => {
        setFromCurrency(value);
        trackServiceUsage('Currency Tracker', 'currency_change', `From: ${value}`);
    };

    const handleToCurrencyChange = (value: string) => {
        setToCurrency(value);
        trackServiceUsage('Currency Tracker', 'currency_change', `To: ${value}`);
    };

    const handlePreferredCurrencyChange = (currency: string) => {
        setPreferredCurrency(currency);
        trackServiceUsage('Currency Tracker', 'preferred_currency_change', `Currency: ${currency}`);
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

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading exchange rates...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center space-y-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchRates} disabled={refreshing}>
                    {refreshing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Try Again
                </Button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Currency Tracker</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track and convert currencies in real-time</p>
                </div>
                <Button variant="outline" onClick={fetchRates} disabled={refreshing} className="w-full sm:w-auto">
                    {refreshing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Refresh Rates
                </Button>
            </div>

            <Alert className="mb-6 sm:mb-8 dark:bg-yellow-800/20 text-sm">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                    Exchange rates are updated once per day. Last updated: <b>{rates?.time_last_update_utc}</b>
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 sm:gap-8">
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
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
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl sm:text-2xl">Currency Converter</CardTitle>
                        <CardDescription className="text-sm">Convert between different currencies using real-time exchange rates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:gap-8">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-sm">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        min="0"
                                        className="h-10 sm:h-12 text-base sm:text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fromCurrency" className="text-sm">From Currency</Label>
                                    <Select value={fromCurrency} onValueChange={handleFromCurrencyChange}>
                                        <SelectTrigger id="fromCurrency" className="h-10 sm:h-12 text-base sm:text-lg">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rates && Object.keys(rates.rates).map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="toCurrency" className="text-sm">To Currency</Label>
                                    <Select value={toCurrency} onValueChange={handleToCurrencyChange}>
                                        <SelectTrigger id="toCurrency" className="h-10 sm:h-12 text-base sm:text-lg">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rates && Object.keys(rates.rates).map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Converted Amount</Label>
                                    <div className="h-10 sm:h-12 px-3 sm:px-4 py-2 border rounded-md bg-muted/50 flex items-center text-base sm:text-lg font-medium">
                                        {convertCurrency().toFixed(2)} {toCurrency}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator className="my-4" />

                <PopularRates
                    rates={rates?.rates || null}
                    preferredCurrency={preferredCurrency}
                    popularCurrencies={popularCurrencies}
                />
            </div>
        </div>
    );
} 