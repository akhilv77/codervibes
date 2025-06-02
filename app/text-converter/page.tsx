'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, RefreshCw, Check, Copy, Binary, Hash, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTextConverterStore } from "@/lib/text-converter-store";

export default function TextConverterPage() {
    const [input, setInput] = useState('');
    const [binaryOutput, setBinaryOutput] = useState('');
    const [hexOutput, setHexOutput] = useState('');
    const [asciiOutput, setAsciiOutput] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useTextConverterStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const textToBinary = (text: string): string => {
        return text.split('').map(char =>
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join(' ');
    };

    const textToHex = (text: string): string => {
        return text.split('').map(char =>
            char.charCodeAt(0).toString(16).padStart(2, '0')
        ).join(' ');
    };

    const textToAscii = (text: string): string => {
        return text.split('').map(char =>
            char.charCodeAt(0).toString()
        ).join(' ');
    };

    const handleConvert = () => {
        if (!input.trim()) {
            toast.error('Please enter some text to convert');
            return;
        }

        const binary = textToBinary(input);
        const hex = textToHex(input);
        const ascii = textToAscii(input);

        setBinaryOutput(binary);
        setHexOutput(hex);
        setAsciiOutput(ascii);

        addToHistory('Text Conversion', input, `Binary: ${binary}\nHex: ${hex}\nASCII: ${ascii}`);
        toast.success('Text converted successfully');
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        toast.success('Copied to clipboard');
    };

    const handleClearHistory = async () => {
        await clearHistory();
        toast.success('History cleared');
    };

    const handleClearAll = () => {
        setInput('');
        setBinaryOutput('');
        setHexOutput('');
        setAsciiOutput('');
        toast.success('All fields cleared');
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Text Converter</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Convert text to Binary, Hexadecimal, and ASCII formats
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6">
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Text Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter text to convert to different formats
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Text Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="input" className="text-xs sm:text-sm">Input Text</Label>
                                    <Textarea
                                        id="input"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter text to convert..."
                                        className="min-h-[100px] text-xs sm:text-sm font-mono"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleConvert}
                                        className="flex-1"
                                    >
                                        Convert
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleClearAll}
                                    >
                                        Clear All
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">Binary Output</Label>
                                    <div className="relative">
                                        <Textarea
                                            value={binaryOutput}
                                            readOnly
                                            className="min-h-[60px] text-xs sm:text-sm font-mono"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(binaryOutput, 'binary')}
                                            className="absolute right-2 top-2 h-7 w-7 p-0"
                                        >
                                            {copied === 'binary' ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">Hexadecimal Output</Label>
                                    <div className="relative">
                                        <Textarea
                                            value={hexOutput}
                                            readOnly
                                            className="min-h-[60px] text-xs sm:text-sm font-mono"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(hexOutput, 'hex')}
                                            className="absolute right-2 top-2 h-7 w-7 p-0"
                                        >
                                            {copied === 'hex' ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">ASCII Output</Label>
                                    <div className="relative">
                                        <Textarea
                                            value={asciiOutput}
                                            readOnly
                                            className="min-h-[60px] text-xs sm:text-sm font-mono"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(asciiOutput, 'ascii')}
                                            className="absolute right-2 top-2 h-7 w-7 p-0"
                                        >
                                            {copied === 'ascii' ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        History
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Your recent text conversions
                                    </CardDescription>
                                </div>
                                {history.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearHistory}
                                        className="h-7 w-7 sm:h-8 sm:w-8"
                                    >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <ScrollArea className="h-[300px] sm:h-[400px]">
                                <div className="space-y-2 pr-4">
                                    {history.length === 0 ? (
                                        <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                                            No history yet
                                        </p>
                                    ) : (
                                        history.map((item, index) => (
                                            <div
                                                key={index}
                                                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.type}
                                                                </Badge>
                                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    {new Date(item.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs sm:text-sm font-mono break-all">
                                                                    From: {item.from}
                                                                </p>
                                                                <p className="text-xs sm:text-sm font-mono break-all whitespace-pre-wrap">
                                                                    To: {item.to}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(item.to, `${item.type}-${index}`)}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            {copied === `${item.type}-${index}` ? (
                                                                <Check className="h-3 w-3 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 