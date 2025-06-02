'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, Copy, Check, RefreshCw, ArrowRight, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useURLEncoderStore } from "@/lib/url-encoder-store";

export default function URLEncoderPage() {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useURLEncoderStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const encodeURL = () => {
        try {
            const encoded = encodeURIComponent(input);
            addToHistory('URL Encoded', encoded);
            toast.success('URL encoded successfully');
        } catch (error) {
            toast.error('Failed to encode URL');
        }
    };

    const decodeURL = () => {
        try {
            const decoded = decodeURIComponent(input);
            addToHistory('URL Decoded', decoded);
            toast.success('URL decoded successfully');
        } catch (error) {
            toast.error('Failed to decode URL');
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
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">URL Encoder & Decoder</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Encode and decode URLs with ease
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
                                        <Link className="h-4 w-4 sm:h-5 sm:w-5" />
                                        URL Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter your URL to encode or decode
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <Link className="w-3 h-3 mr-1" />
                                    URL Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="input" className="text-xs sm:text-sm">URL</Label>
                                    <Textarea
                                        id="input"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter URL to encode or decode..."
                                        className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        onClick={encodeURL}
                                        className="w-full text-xs sm:text-sm"
                                    >
                                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                        Encode URL
                                    </Button>
                                    <Button
                                        onClick={decodeURL}
                                        variant="outline"
                                        className="w-full text-xs sm:text-sm"
                                    >
                                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                        Decode URL
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
                                        Your recent URL encoding/decoding results
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