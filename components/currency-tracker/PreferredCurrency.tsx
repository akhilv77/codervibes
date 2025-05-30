import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface PreferredCurrencyProps {
    rates: { [key: string]: number } | null;
    onPreferredCurrencyChange: (currency: string) => void;
    preferredCurrency: string;
}

export function PreferredCurrency({ rates, onPreferredCurrencyChange, preferredCurrency }: PreferredCurrencyProps) {
    const [open, setOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(preferredCurrency);

    useEffect(() => {
        setSelectedCurrency(preferredCurrency);
    }, [preferredCurrency]);

    const handleSave = () => {
        onPreferredCurrencyChange(selectedCurrency);
        setOpen(false);
    };

    if (!rates) return null;

    return (
        <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Preferred Currency</h3>
                    <p className="text-sm text-muted-foreground">Currently set to: {preferredCurrency}</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Change
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set Preferred Currency</DialogTitle>
                            <DialogDescription>
                                Choose your preferred currency for viewing exchange rates
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                {Object.keys(rates).map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    );
} 