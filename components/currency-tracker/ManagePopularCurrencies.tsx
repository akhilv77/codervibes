'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExchangeRates } from "@/types/currency-tracker";
import { Badge } from "@/components/ui/badge";

interface ManagePopularCurrenciesProps {
    rates: ExchangeRates['rates'] | null;
    popularCurrencies: string[];
    onPopularCurrenciesChange: (currencies: string[]) => void;
}

export function ManagePopularCurrencies({ rates, popularCurrencies, onPopularCurrenciesChange }: ManagePopularCurrenciesProps) {
    const [selectedCurrency, setSelectedCurrency] = useState<string>('');

    const handleCurrencySelect = (currency: string) => {
        if (!popularCurrencies.includes(currency)) {
            onPopularCurrenciesChange([...popularCurrencies, currency]);
        }
        setSelectedCurrency('');
    };

    const handleCurrencyRemove = (currency: string) => {
        onPopularCurrenciesChange(popularCurrencies.filter(c => c !== currency));
    };

    if (!rates) return null;

    const availableCurrencies = Object.keys(rates).filter(
        currency => !popularCurrencies.includes(currency)
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Popular Currencies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Select
                        value={selectedCurrency}
                        onValueChange={handleCurrencySelect}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Add a currency" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCurrencies.map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                    {currency}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                    {popularCurrencies.map((currency) => (
                        <Badge
                            key={currency}
                            variant="secondary"
                            className="px-3 py-1 text-sm flex items-center gap-1"
                        >
                            {currency}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleCurrencyRemove(currency)}
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {currency}</span>
                            </Button>
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 