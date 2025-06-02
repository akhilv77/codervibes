'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Copy, Check, RefreshCw, ArrowRight, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHTMLEncoderStore } from "@/lib/html-encoder-store";

export default function HTMLEncoderPage() {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useHTMLEncoderStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const encodeHTML = () => {
        try {
            // First, handle basic HTML entities
            let encoded = input
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

            // Then encode all other characters to their HTML entity equivalents
            encoded = encoded.replace(/[^\x00-\x7F]/g, (char) => {
                const code = char.charCodeAt(0);
                return `&#${code};`;
            });

            addToHistory('HTML Encoded', encoded);
            toast.success('HTML encoded successfully');
        } catch (error) {
            toast.error('Failed to encode HTML');
        }
    };

    const decodeHTML = () => {
        try {
            // First, decode numeric HTML entities
            let decoded = input.replace(/&#(\d+);/g, (_, code) => {
                return String.fromCharCode(parseInt(code, 10));
            });

            // Then decode named HTML entities
            decoded = decoded
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .replace(/&copy;/g, '©')
                .replace(/&reg;/g, '®')
                .replace(/&trade;/g, '™')
                .replace(/&euro;/g, '€')
                .replace(/&pound;/g, '£')
                .replace(/&yen;/g, '¥')
                .replace(/&cent;/g, '¢')
                .replace(/&deg;/g, '°')
                .replace(/&plusmn;/g, '±')
                .replace(/&times;/g, '×')
                .replace(/&divide;/g, '÷')
                .replace(/&micro;/g, 'µ')
                .replace(/&para;/g, '¶')
                .replace(/&sect;/g, '§')
                .replace(/&alpha;/g, 'α')
                .replace(/&beta;/g, 'β')
                .replace(/&gamma;/g, 'γ')
                .replace(/&delta;/g, 'δ')
                .replace(/&epsilon;/g, 'ε')
                .replace(/&zeta;/g, 'ζ')
                .replace(/&eta;/g, 'η')
                .replace(/&theta;/g, 'θ')
                .replace(/&iota;/g, 'ι')
                .replace(/&kappa;/g, 'κ')
                .replace(/&lambda;/g, 'λ')
                .replace(/&mu;/g, 'μ')
                .replace(/&nu;/g, 'ν')
                .replace(/&xi;/g, 'ξ')
                .replace(/&omicron;/g, 'ο')
                .replace(/&pi;/g, 'π')
                .replace(/&rho;/g, 'ρ')
                .replace(/&sigma;/g, 'σ')
                .replace(/&tau;/g, 'τ')
                .replace(/&upsilon;/g, 'υ')
                .replace(/&phi;/g, 'φ')
                .replace(/&chi;/g, 'χ')
                .replace(/&psi;/g, 'ψ')
                .replace(/&omega;/g, 'ω');

            addToHistory('HTML Decoded', decoded);
            toast.success('HTML decoded successfully');
        } catch (error) {
            toast.error('Failed to decode HTML');
        }
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

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">HTML Entity Encoder & Decoder</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Encode and decode HTML entities, symbols, emojis, and non-English characters
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
                                        <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                                        HTML Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter your text to encode or decode HTML entities
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <Code className="w-3 h-3 mr-1" />
                                    HTML Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="input" className="text-xs sm:text-sm">Text</Label>
                                    <Textarea
                                        id="input"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter text to encode or decode HTML entities..."
                                        className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        onClick={encodeHTML}
                                        className="w-full text-xs sm:text-sm"
                                    >
                                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                        Encode HTML
                                    </Button>
                                    <Button
                                        onClick={decodeHTML}
                                        variant="outline"
                                        className="w-full text-xs sm:text-sm"
                                    >
                                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                        Decode HTML
                                    </Button>
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
                                        Results
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Your recent HTML encoding/decoding results
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
                                            No results yet
                                        </p>
                                    ) : (
                                        history.map((result, index) => (
                                            <div
                                                key={index}
                                                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {result.type}
                                                                </Badge>
                                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    {new Date(result.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs sm:text-sm font-mono break-all">
                                                                {result.result}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(result.result, `${result.type}-${index}`)}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            {copied === `${result.type}-${index}` ? (
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