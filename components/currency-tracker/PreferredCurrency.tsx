'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExchangeRates } from "@/types/currency-tracker";

interface PreferredCurrencyProps {
    rates: ExchangeRates['rates'] | null;
    preferredCurrency: string;
    onPreferredCurrencyChange: (currency: string) => void;
}

export function PreferredCurrency({ rates, preferredCurrency, onPreferredCurrencyChange }: PreferredCurrencyProps) {
    if (!rates) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferred Currency</CardTitle>
            </CardHeader>
            <CardContent>
                <Select
                    value={preferredCurrency}
                    onValueChange={onPreferredCurrencyChange}
                >
                    <SelectTrigger className="w-full h-12 text-lg">
                        <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(rates).map((currency) => (
                            <SelectItem key={currency} value={currency}>
                                {currency}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
} 