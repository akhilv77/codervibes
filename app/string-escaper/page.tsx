'use client';

import { useState, useEffect } from 'react';
import { useStringEscaperStore } from '@/lib/string-escaper-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Code, FileText, History, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useServiceTracking } from '@/hooks/useServiceTracking';

const escapeTypes = [
    { id: 'javascript', name: 'JavaScript', description: 'Escape for JavaScript strings' },
    { id: 'json', name: 'JSON', description: 'Escape for JSON strings' },
    { id: 'html', name: 'HTML', description: 'Escape for HTML content' },
    { id: 'sql', name: 'SQL', description: 'Escape for SQL strings' },
];

export default function StringEscaperPage() {
    const {
        inputText,
        escapedText,
        selectedType,
        history,
        setInputText,
        setEscapedText,
        setSelectedType,
        addToHistory,
        clearHistory,
        removeFromHistory,
        reset,
        loadHistory,
        initialize
    } = useStringEscaperStore();

    const [isEscaping, setIsEscaping] = useState(false);
    const [showHistory, setShowHistory] = useState(true);
    const { trackServiceUsage } = useServiceTracking();

    // Initialize store and load history when component mounts
    useEffect(() => {
        initialize();
        trackServiceUsage('String Escaper', 'page_view');
    }, [initialize, trackServiceUsage]);

    const escapeString = (text: string, type: string): string => {
        if (!text) return '';

        switch (type) {
            case 'javascript':
                return text
                    .replace(/\\/g, '\\\\')
                    .replace(/'/g, "\\'")
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t')
                    .replace(/\f/g, '\\f')
                    .replace(/\v/g, '\\v')
                    .replace(/\0/g, '\\0');

            case 'json':
                return JSON.stringify(text).slice(1, -1);

            case 'html':
                return text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');

            case 'sql':
                return text
                    .replace(/'/g, "''")
                    .replace(/\\/g, '\\\\')
                    .replace(/\0/g, '\\0')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t')
                    .replace(/\x1a/g, '\\Z');

            default:
                return text;
        }
    };

    const handleEscape = () => {
        setIsEscaping(true);
        try {
            const escaped = escapeString(inputText, selectedType);
            setEscapedText(escaped);
            addToHistory({
                inputText,
                escapedText: escaped,
                type: selectedType,
            });
            toast.success('Text escaped successfully');
            trackServiceUsage('String Escaper', 'string_escaped', `Format: ${selectedType}`);
        } catch (error) {
            toast.error('Error escaping text');
        } finally {
            setIsEscaping(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(escapedText);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const loadHistoryItem = (item: typeof history[0]) => {
        setInputText(item.inputText);
        setEscapedText(item.escapedText);
        setSelectedType(item.type);
    };

    const handleFormatChange = (format: string) => {
        setSelectedType(format);
        trackServiceUsage('String Escaper', 'format_changed', `Format: ${format}`);
    };

    const handleClearHistory = () => {
        clearHistory();
        trackServiceUsage('String Escaper', 'history_cleared');
    };

    return (
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 md:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-6 md:mb-8">
                <div>
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight">String Escaper</h1>
                    <p className="text-[11px] sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1">
                        Escape strings for JavaScript, JSON, HTML, and SQL
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto h-8 sm:h-9"
                >
                    <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">History</span>
                </Button>
            </div>

            <div className="grid gap-2 sm:gap-4 md:gap-6">
                <div className="grid gap-2 sm:gap-4 md:gap-6 md:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-2.5 sm:p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                                <div>
                                    <CardTitle className="text-sm sm:text-lg md:text-xl flex items-center gap-1.5 sm:gap-2">
                                        <Code className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                        Input Text
                                    </CardTitle>
                                    <CardDescription className="text-[11px] sm:text-sm mt-0.5 sm:mt-1">
                                        Enter text to escape
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                    <Code className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                    String Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2.5 sm:p-4 md:p-6">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="escapeType" className="text-[11px] sm:text-sm">Escape Type</Label>
                                    <Select
                                        value={selectedType}
                                        onValueChange={handleFormatChange}
                                    >
                                        <SelectTrigger className="h-8 sm:h-9 text-[11px] sm:text-sm">
                                            <SelectValue placeholder="Select escape type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {escapeTypes.map((type) => (
                                                <SelectItem
                                                    key={type.id}
                                                    value={type.id}
                                                    className="text-[11px] sm:text-sm"
                                                >
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="input" className="text-[11px] sm:text-sm">Text</Label>
                                    <Textarea
                                        id="input"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Enter text to escape..."
                                        className="min-h-[80px] sm:min-h-[120px] text-[11px] sm:text-sm resize-none"
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        className="flex-1 h-8 sm:h-9 text-[11px] sm:text-sm"
                                        onClick={handleEscape}
                                        disabled={isEscaping || !inputText}
                                    >
                                        <RefreshCw className={`mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isEscaping ? 'animate-spin' : ''}`} />
                                        Escape
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={reset}
                                        className="h-8 sm:h-9 text-[11px] sm:text-sm"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="p-2.5 sm:p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                                <div>
                                    <CardTitle className="text-sm sm:text-lg md:text-xl flex items-center gap-1.5 sm:gap-2">
                                        <FileText className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                        Escaped Text
                                    </CardTitle>
                                    <CardDescription className="text-[11px] sm:text-sm mt-0.5 sm:mt-1">
                                        Your escaped text
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2.5 sm:p-4 md:p-6">
                            <div className="space-y-2.5 sm:space-y-4">
                                <Textarea
                                    value={escapedText}
                                    readOnly
                                    className="min-h-[120px] sm:min-h-[200px] md:min-h-[250px] font-mono text-[11px] sm:text-sm resize-none"
                                    placeholder="Escaped text will appear here..."
                                />
                                <Button
                                    className="w-full h-8 sm:h-9 text-[11px] sm:text-sm"
                                    onClick={copyToClipboard}
                                    disabled={!escapedText}
                                >
                                    <Copy className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    Copy to Clipboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className={cn("transition-all duration-200 overflow-hidden", showHistory ? "block" : "hidden")}>
                    <CardHeader className="p-2.5 sm:p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <History className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                <CardTitle className="text-sm sm:text-lg md:text-xl">History</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClearHistory}
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                                title="Clear History"
                            >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2.5 sm:p-4 md:p-6">
                        <ScrollArea className="h-[180px] sm:h-[280px] md:h-[380px]">
                            <div className="space-y-1.5 sm:space-y-2">
                                {history.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-3 sm:py-6">
                                        No history yet
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start justify-between gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                                            onClick={() => loadHistoryItem(item)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                                        {escapeTypes.find(t => t.id === item.type)?.name || item.type}
                                                    </Badge>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] sm:text-sm truncate">{item.inputText}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromHistory(item.id);
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 