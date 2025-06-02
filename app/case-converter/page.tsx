'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, RefreshCw, Type, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCaseConverterStore } from '@/lib/case-converter-store';

type CaseType = 'camel' | 'pascal' | 'snake' | 'kebab' | 'title' | 'sentence' | 'lower' | 'upper';

const caseConverters: Record<CaseType, (text: string) => string> = {
    camel: (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
    },
    pascal: (text: string) => {
        return text
            .toLowerCase()
            .replace(/^[a-z]|[\s-_]+(.)/g, (_, char) => char.toUpperCase());
    },
    snake: (text: string) => {
        return text
            .toLowerCase()
            .replace(/[\s-_]+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    },
    kebab: (text: string) => {
        return text
            .toLowerCase()
            .replace(/[\s-_]+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    },
    title: (text: string) => {
        return text
            .toLowerCase()
            .split(/[\s-_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },
    sentence: (text: string) => {
        return text
            .toLowerCase()
            .replace(/^[a-z]|\.\s+[a-z]/g, (char) => char.toUpperCase());
    },
    lower: (text: string) => text.toLowerCase(),
    upper: (text: string) => text.toUpperCase(),
};

export default function CaseConverter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [selectedType, setSelectedType] = useState<CaseType>('camel');
    const { history, addToHistory, clearHistory, loadHistory } = useCaseConverterStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const convertCase = (type: CaseType) => {
        try {
            if (!input.trim()) {
                toast.error('Please enter some text to convert');
                return;
            }

            const result = caseConverters[type](input);
            setOutput(result);
            setSelectedType(type);

            addToHistory({
                input,
                output: result,
                type,
                timestamp: new Date().toISOString()
            });

            toast.success('Text converted successfully');
        } catch (error) {
            toast.error('Failed to convert text');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
        toast.success('Cleared successfully');
    };

    const handleHistoryClick = (item: { input: string; output: string; type: CaseType }) => {
        setInput(item.input);
        setOutput(item.output);
        setSelectedType(item.type);
    };

    return (
        <div className="container mx-auto p-4 max-w-screen-xl">
            <Card className="border-2">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Type className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">Case Converter</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Convert text between different case styles (camelCase, snake_case, etc.)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Input/Output Section */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Input Text</label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClear}
                                        className="h-8 w-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter text to convert..."
                                className="min-h-[150px] font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Output Text</label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(output)}
                                    disabled={!output}
                                    className="h-8 w-8"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <Textarea
                                value={output}
                                readOnly
                                placeholder="Converted text will appear here..."
                                className="min-h-[150px] font-mono bg-muted"
                            />
                        </div>
                    </div>

                    {/* Conversion Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <Button
                            onClick={() => convertCase('camel')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            camelCase
                        </Button>
                        <Button
                            onClick={() => convertCase('pascal')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            PascalCase
                        </Button>
                        <Button
                            onClick={() => convertCase('snake')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            snake_case
                        </Button>
                        <Button
                            onClick={() => convertCase('kebab')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            kebab-case
                        </Button>
                        <Button
                            onClick={() => convertCase('title')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            Title Case
                        </Button>
                        <Button
                            onClick={() => convertCase('sentence')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            Sentence case
                        </Button>
                        <Button
                            onClick={() => convertCase('lower')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            lowercase
                        </Button>
                        <Button
                            onClick={() => convertCase('upper')}
                            className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                        >
                            UPPERCASE
                        </Button>
                    </div>

                    {/* History Section */}
                    {history.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">History</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearHistory}
                                    className="h-8"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear History
                                </Button>
                            </div>
                            <ScrollArea className="h-[200px] rounded-md border p-4">
                                <div className="space-y-2">
                                    {history.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {item.type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-mono">{item.input}</p>
                                                <p className="text-sm font-mono text-muted-foreground">{item.output}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 