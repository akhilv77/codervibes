'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/ui/back-button";
import { useServiceTracking } from '@/hooks/useServiceTracking';
import { db } from '@/lib/db/indexed-db';
import { Clock, Copy, RefreshCw, Trash2 } from "lucide-react";

interface TimestampHistory {
    timestamp: number;
    date: string;
    format: string;
    timezone: string;
}

const DATE_FORMATS = [
    { value: 'iso', label: 'ISO 8601' },
    { value: 'utc', label: 'UTC' },
    { value: 'local', label: 'Local' },
    { value: 'custom', label: 'Custom' }
];

const TIMEZONES = [
    { value: 'UTC', label: 'UTC' },
    { value: 'local', label: 'Local Time' }
];

export default function TimestampConverter() {
    const { trackServiceUsage } = useServiceTracking();
    const { toast } = useToast();
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
    const [selectedFormat, setSelectedFormat] = useState('iso');
    const [selectedTimezone, setSelectedTimezone] = useState('UTC');
    const [customFormat, setCustomFormat] = useState('YYYY-MM-DD HH:mm:ss');
    const [history, setHistory] = useState<TimestampHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                await db.init();
                const storedHistory = await db.get<TimestampHistory[]>('timeConversion', 'history') || [];
                setHistory(storedHistory);
            } catch (error) {
                console.error('Error loading history:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, []);

    // Update current timestamp every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatDate = (timestamp: number, format: string, timezone: string): string => {
        const date = new Date(timestamp * 1000);

        if (timezone === 'local') {
            switch (format) {
                case 'iso':
                    return date.toISOString();
                case 'utc':
                    return date.toUTCString();
                case 'local':
                    return date.toLocaleString();
                case 'custom':
                    // Simple custom format implementation
                    return customFormat
                        .replace('YYYY', date.getFullYear().toString())
                        .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
                        .replace('DD', date.getDate().toString().padStart(2, '0'))
                        .replace('HH', date.getHours().toString().padStart(2, '0'))
                        .replace('mm', date.getMinutes().toString().padStart(2, '0'))
                        .replace('ss', date.getSeconds().toString().padStart(2, '0'));
                default:
                    return date.toISOString();
            }
        } else {
            // UTC timezone
            switch (format) {
                case 'iso':
                    return date.toISOString();
                case 'utc':
                    return date.toUTCString();
                case 'local':
                    return date.toLocaleString('en-US', { timeZone: 'UTC' });
                case 'custom':
                    return customFormat
                        .replace('YYYY', date.getUTCFullYear().toString())
                        .replace('MM', (date.getUTCMonth() + 1).toString().padStart(2, '0'))
                        .replace('DD', date.getUTCDate().toString().padStart(2, '0'))
                        .replace('HH', date.getUTCHours().toString().padStart(2, '0'))
                        .replace('mm', date.getUTCMinutes().toString().padStart(2, '0'))
                        .replace('ss', date.getUTCSeconds().toString().padStart(2, '0'));
                default:
                    return date.toISOString();
            }
        }
    };

    const handleTimestampChange = (value: string) => {
        const timestamp = parseInt(value);
        if (!isNaN(timestamp)) {
            setCurrentTimestamp(timestamp);
            addToHistory(timestamp);
        }
    };

    const handleDateChange = (value: string) => {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            const timestamp = Math.floor(date.getTime() / 1000);
            setCurrentTimestamp(timestamp);
            addToHistory(timestamp);
        }
    };

    const clearHistory = async () => {
        try {
            await db.set('timeConversion', 'history', []);
            setHistory([]);
            toast({
                title: "History cleared",
                description: "All conversion history has been cleared",
            });
        } catch (error) {
            console.error('Error clearing history:', error);
            toast({
                title: "Error clearing history",
                description: "Failed to clear conversion history",
                variant: "destructive"
            });
        }
    };

    const addToHistory = async (timestamp: number) => {
        const newHistory = {
            timestamp,
            date: formatDate(timestamp, selectedFormat, selectedTimezone),
            format: selectedFormat,
            timezone: selectedTimezone
        };

        // Ensure history is limited to 10 items
        const updatedHistory = [newHistory, ...history.slice(0, 9)];
        setHistory(updatedHistory);

        try {
            await db.set('timeConversion', 'history', updatedHistory);
            trackServiceUsage('timestamp-converter', 'convert');
        } catch (error) {
            console.error('Error saving history:', error);
            toast({
                title: "Error saving history",
                description: "Failed to save conversion history",
                variant: "destructive"
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: "The value has been copied to your clipboard",
        });
    };

    return (
        <div className="container max-w-screen-xl">
            <div className="flex items-center gap-2 mb-6">
                <BackButton path="/" />
                <PageHeader
                    title="Timestamp Converter"
                    description="Convert between Unix timestamps and human-readable dates"
                />
            </div>

            <div className="grid gap-6">
                {/* Current Time Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Current Time
                        </CardTitle>
                        <CardDescription>
                            The current Unix timestamp and its human-readable representation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Label>Unix Timestamp</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={currentTimestamp}
                                            readOnly
                                            className="font-mono"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(currentTimestamp.toString())}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Label>Human Readable</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formatDate(currentTimestamp, selectedFormat, selectedTimezone)}
                                            readOnly
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(formatDate(currentTimestamp, selectedFormat, selectedTimezone))}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Converter Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Convert Timestamp</CardTitle>
                        <CardDescription>
                            Convert between Unix timestamps and human-readable dates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <div className="grid gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Label>Date Format</Label>
                                        <Select
                                            value={selectedFormat}
                                            onValueChange={setSelectedFormat}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DATE_FORMATS.map(format => (
                                                    <SelectItem key={format.value} value={format.value}>
                                                        {format.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1">
                                        <Label>Timezone</Label>
                                        <Select
                                            value={selectedTimezone}
                                            onValueChange={setSelectedTimezone}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIMEZONES.map(tz => (
                                                    <SelectItem key={tz.value} value={tz.value}>
                                                        {tz.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {selectedFormat === 'custom' && (
                                    <div>
                                        <Label>Custom Format</Label>
                                        <Input
                                            value={customFormat}
                                            onChange={(e) => setCustomFormat(e.target.value)}
                                            placeholder="YYYY-MM-DD HH:mm:ss"
                                        />
                                    </div>
                                )}

                                <Tabs defaultValue="timestamp" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="timestamp">Timestamp to Date</TabsTrigger>
                                        <TabsTrigger value="date">Date to Timestamp</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="timestamp">
                                        <div className="space-y-2">
                                            <Label>Unix Timestamp</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter Unix timestamp"
                                                onChange={(e) => handleTimestampChange(e.target.value)}
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="date">
                                        <div className="space-y-2">
                                            <Label>Date and Time</Label>
                                            <Input
                                                type="datetime-local"
                                                onChange={(e) => handleDateChange(e.target.value)}
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* History Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Conversion History</CardTitle>
                            <CardDescription>
                                Your recent timestamp conversions
                            </CardDescription>
                        </div>
                        {history.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearHistory}
                                title="Clear history"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No conversion history yet
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div className="space-y-1">
                                            <div className="font-mono text-sm">{item.timestamp}</div>
                                            <div className="text-sm text-muted-foreground">{item.date}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(item.timestamp.toString())}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setCurrentTimestamp(item.timestamp);
                                                    setSelectedFormat(item.format);
                                                    setSelectedTimezone(item.timezone);
                                                }}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 