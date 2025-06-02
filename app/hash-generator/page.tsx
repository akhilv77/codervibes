'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Copy, Check, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useHashGeneratorStore } from "@/lib/hash-generator-store";
import { createHash } from 'crypto';

export default function HashGeneratorPage() {
    const [input, setInput] = useState('');
    const [hashToVerify, setHashToVerify] = useState('');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('sha256');
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useHashGeneratorStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const generateHash = (algorithm: string) => {
        try {
            if (!input.trim()) {
                toast.error('Please enter some text to hash');
                return;
            }

            const hash = createHash(algorithm)
                .update(input)
                .digest('hex');

            addToHistory(`${algorithm.toUpperCase()} Hash`, hash);
            toast.success(`${algorithm.toUpperCase()} hash generated successfully`);
        } catch (error) {
            toast.error(`Failed to generate ${algorithm.toUpperCase()} hash`);
        }
    };

    const verifyHash = () => {
        try {
            if (!input.trim() || !hashToVerify.trim()) {
                toast.error('Please enter both text and hash to verify');
                return;
            }

            const generatedHash = createHash(selectedAlgorithm)
                .update(input)
                .digest('hex');

            if (generatedHash.toLowerCase() === hashToVerify.toLowerCase()) {
                toast.success('Hash verification successful!');
            } else {
                toast.error('Hash verification failed. Hashes do not match.');
            }
        } catch (error) {
            toast.error('Failed to verify hash');
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
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hash Generator</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Generate cryptographic hashes using various algorithms
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6">
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <Card className="shadow-sm">
                        <CardHeader className="p-4 sm:p-6 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Hash className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Text Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter your text to generate hashes
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <Hash className="w-3 h-3 mr-1" />
                                    Hash Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="input" className="text-xs sm:text-sm font-medium">Text</Label>
                                    <Textarea
                                        id="input"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter text to generate hashes..."
                                        className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm resize-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                    <Button
                                        onClick={() => generateHash('md5')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        MD5
                                    </Button>
                                    <Button
                                        onClick={() => generateHash('sha1')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        SHA1
                                    </Button>
                                    <Button
                                        onClick={() => generateHash('sha224')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        SHA224
                                    </Button>
                                    <Button
                                        onClick={() => generateHash('sha256')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        SHA256
                                    </Button>
                                    <Button
                                        onClick={() => generateHash('sha384')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        SHA384
                                    </Button>
                                    <Button
                                        onClick={() => generateHash('sha512')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        SHA512
                                    </Button>
                                    <Button
                                        onClick={() => generateHash('sha3-256')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        SHA3-256
                                    </Button>
                                    <Button
                                        onClick={() => generateHash('ripemd160')}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-9 hover:bg-primary/90"
                                    >
                                        RIPEMD160
                                    </Button>
                                </div>

                                <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">About Hash Functions</h4>
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                                Hash functions are one-way functions - they cannot be decoded or reversed back to the original input.
                                                This is a fundamental security property of cryptographic hash functions.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="verify" className="text-xs sm:text-sm font-medium">Verify Hash</Label>
                                        <Badge variant="outline" className="text-xs">
                                            <Hash className="w-3 h-3 mr-1" />
                                            Hash Verification
                                        </Badge>
                                    </div>
                                    <div className="rounded-lg border bg-card p-4 space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs text-muted-foreground">Original Text</Label>
                                                <div className="relative">
                                                    <Textarea
                                                        id="input"
                                                        value={input}
                                                        onChange={(e) => setInput(e.target.value)}
                                                        placeholder="Enter the original text..."
                                                        className="min-h-[60px] text-xs sm:text-sm resize-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    {input && (
                                                        <div className="absolute right-2 top-2">
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                {input.length} chars
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs text-muted-foreground">Hash to Verify</Label>
                                                <div className="relative">
                                                    <Textarea
                                                        id="verify"
                                                        value={hashToVerify}
                                                        onChange={(e) => setHashToVerify(e.target.value)}
                                                        placeholder="Paste the hash to verify..."
                                                        className="min-h-[60px] text-xs sm:text-sm font-mono resize-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    {hashToVerify && (
                                                        <div className="absolute right-2 top-2">
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                {hashToVerify.length} chars
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                            <select
                                                value={selectedAlgorithm}
                                                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                                                className="flex h-9 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="md5">MD5</option>
                                                <option value="sha1">SHA1</option>
                                                <option value="sha224">SHA224</option>
                                                <option value="sha256">SHA256</option>
                                                <option value="sha384">SHA384</option>
                                                <option value="sha512">SHA512</option>
                                                <option value="sha3-256">SHA3-256</option>
                                                <option value="ripemd160">RIPEMD160</option>
                                            </select>
                                            <Button
                                                onClick={verifyHash}
                                                className="w-full sm:w-auto text-xs sm:text-sm h-9 hover:bg-primary/90"
                                                disabled={!input.trim() || !hashToVerify.trim()}
                                            >
                                                <Hash className="w-4 h-4 mr-2" />
                                                Verify Hash
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="p-4 sm:p-6 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Results
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Your recent hash generation results
                                    </CardDescription>
                                </div>
                                {history.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearHistory}
                                        className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted"
                                    >
                                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <ScrollArea className="h-[300px] sm:h-[400px]">
                                <div className="space-y-3 pr-4">
                                    {history.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[200px] text-center">
                                            <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                No results yet
                                            </p>
                                        </div>
                                    ) : (
                                        history.map((result, index) => (
                                            <div
                                                key={index}
                                                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
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
                                                        className="h-7 w-7 p-0 hover:bg-muted"
                                                    >
                                                        {copied === `${result.type}-${index}` ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
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