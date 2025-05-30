import { Card } from "@/components/ui/card";

interface PopularRatesProps {
    rates: { [key: string]: number } | null;
    preferredCurrency: string;
    popularCurrencies: string[];
}

export function PopularRates({ rates, preferredCurrency, popularCurrencies }: PopularRatesProps) {
    if (!rates) return null;

    // Filter out the preferred currency from the list
    const displayCurrencies = popularCurrencies.filter(currency => currency !== preferredCurrency);

    return (
        <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Popular Exchange Rates</h2>
            <p className="text-sm text-muted-foreground mb-4">Rates to {preferredCurrency}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayCurrencies.map((currency) => {
                    // Calculate rate from popular currency to preferred currency
                    const rate = rates[preferredCurrency] / rates[currency];
                    return (
                        <div key={`${currency}-${preferredCurrency}`} className="p-4 border rounded-lg">
                            <div className="text-sm text-gray-500">{currency}/{preferredCurrency}</div>
                            <div className="text-lg font-semibold">{rate.toFixed(4)}</div>
                        </div>
                    );
                })}
                {displayCurrencies.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                        No popular currencies to display. Add some currencies to see their rates.
                    </p>
                )}
            </div>
        </Card>
    );
} 