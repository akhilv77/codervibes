import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ManagePopularCurrenciesProps {
    rates: { [key: string]: number } | null;
    popularCurrencies: string[];
    onPopularCurrenciesChange: (currencies: string[]) => void;
}

export function ManagePopularCurrencies({
    rates,
    popularCurrencies,
    onPopularCurrenciesChange
}: ManagePopularCurrenciesProps) {
    const [open, setOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('');

    if (!rates) return null;

    const availableCurrencies = Object.keys(rates).filter(
        currency => !popularCurrencies.includes(currency)
    );

    const handleAddCurrency = () => {
        if (selectedCurrency && !popularCurrencies.includes(selectedCurrency)) {
            onPopularCurrenciesChange([...popularCurrencies, selectedCurrency]);
            setSelectedCurrency('');
        }
    };

    const handleRemoveCurrency = (currencyToRemove: string) => {
        onPopularCurrenciesChange(
            popularCurrencies.filter(currency => currency !== currencyToRemove)
        );
    };

    return (
        <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Popular Currencies</h3>
                    <p className="text-sm text-muted-foreground">Manage your list of popular currencies</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Currency
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Popular Currency</DialogTitle>
                            <DialogDescription>
                                Select a currency to add to your popular currencies list
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select a currency</option>
                                {availableCurrencies.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddCurrency} disabled={!selectedCurrency}>
                                Add Currency
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-wrap gap-2">
                {popularCurrencies.map((currency) => (
                    <div
                        key={currency}
                        className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full"
                    >
                        <span>{currency}</span>
                        <button
                            onClick={() => handleRemoveCurrency(currency)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                {popularCurrencies.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No popular currencies selected. Add some currencies to get started.
                    </p>
                )}
            </div>
        </Card>
    );
} 