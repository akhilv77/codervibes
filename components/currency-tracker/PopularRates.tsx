'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ExchangeRates } from "@/types/currency-tracker";

interface PopularRatesProps {
    rates: ExchangeRates['rates'] | null;
    preferredCurrency: string;
    popularCurrencies: string[];
}

export function PopularRates({ rates, preferredCurrency, popularCurrencies }: PopularRatesProps) {
    if (!rates) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Popular Rates</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularCurrencies.map((currency) => {
                        if (currency === preferredCurrency) return null;
                        const rate = rates[preferredCurrency] / rates[currency];
                        return (
                            <div key={currency} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="text-sm font-medium text-muted-foreground">{currency}</div>
                                <div className="text-2xl font-semibold mt-1">
                                    {rate.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    1 {currency} = {rate.toFixed(2)} {preferredCurrency}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
} 