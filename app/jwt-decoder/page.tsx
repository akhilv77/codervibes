'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, AlertCircle, Info, Clock, Key, Shield, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useServiceTracking } from '@/hooks/useServiceTracking';
import { useServiceUsage } from '@/lib/hooks/use-service-usage';
import { useJWTDecoderStore } from '@/lib/jwt-decoder-store';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    header: any;
    payload: any;
    signature: string;
    isValid: boolean;
    isExpired: boolean;
    algorithm: string;
    warnings: string[];
    signatureVerified: boolean | null;
}

export default function JWTDecoder() {
    const { trackServiceUsage } = useServiceTracking();
    const { trackUsage } = useServiceUsage();
    const { history, addToHistory, loadHistory, clearHistory } = useJWTDecoderStore();
    const [token, setToken] = useState('');
    const [secret, setSecret] = useState('');
    const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        trackServiceUsage('JWT Decoder', 'page_view');
        loadHistory().then(() => {
            console.log('History loaded in component:', history);
        });
    }, []);

    const decodeToken = async () => {
        try {
            if (!token.trim()) {
                toast.error('Please enter a JWT token');
                return;
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];

            const warnings: string[] = [];
            
            // Check for insecure algorithms
            if (header.alg === 'none') {
                warnings.push('Using "none" algorithm is insecure');
            }
            if (header.alg === 'HS256') {
                warnings.push('Consider using a stronger algorithm than HS256');
            }

            // Check token expiry
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp && payload.exp < now;
            const isValid = !isExpired;

            // Verify signature if secret is provided
            let signatureVerified: boolean | null = null;
            if (secret) {
                try {
                    jwt.verify(token, secret);
                    signatureVerified = true;
                } catch (error) {
                    signatureVerified = false;
                }
            }

            setDecodedToken({
                header,
                payload,
                signature,
                isValid,
                isExpired,
                algorithm: header.alg,
                warnings,
                signatureVerified
            });

            // Add to history
            await addToHistory(token);
            console.log('Token added to history');

            trackUsage('jwt-decoder', 'decode');
            toast.success('Token decoded successfully');
        } catch (error) {
            toast.error('Failed to decode token: Invalid format');
            setDecodedToken(null);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(field);
            toast.success(`Copied ${field} to clipboard`);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">JWT Decoder</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Decode and inspect JSON Web Tokens</p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6">
                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <Key className="h-4 w-4 sm:h-5 sm:w-5" />
                                    JWT Token
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Enter your JWT token to decode
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs w-fit">
                                Real-time Decoding
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-2 sm:space-y-3">
                                <Label className="text-xs sm:text-sm flex items-center gap-2 font-medium">
                                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                    Token
                                </Label>
                                <div className="relative group">
                                    <Textarea
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Enter your JWT token"
                                        className="min-h-[100px] sm:min-h-[120px] font-mono text-xs sm:text-sm bg-muted/50 border-muted-foreground/20 focus:border-primary/50 transition-colors resize-none whitespace-pre-wrap break-all"
                                    />
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => copyToClipboard(token, 'Token')}
                                        >
                                            {copied === 'Token' ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                                <Label className="text-xs sm:text-sm flex items-center gap-2 font-medium">
                                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                    Secret Key (Optional)
                                </Label>
                                <div className="relative group">
                                    <Input
                                        value={secret}
                                        onChange={(e) => setSecret(e.target.value)}
                                        placeholder="Enter secret key for signature verification"
                                        className="font-mono h-10 sm:h-12 text-sm sm:text-base bg-muted/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                        type="password"
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={decodeToken} 
                                className="w-full md:w-fit h-9 sm:h-10 text-sm sm:text-base font-medium"
                            >
                                Decode Token
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {decodedToken && (
                    <>
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                                            Token Information
                                        </CardTitle>
                                        <CardDescription className="text-xs sm:text-sm mt-1">
                                            Decoded token details and validation status
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={decodedToken.isValid ? "default" : "destructive"}>
                                            {decodedToken.isValid ? 'Valid' : 'Expired'}
                                        </Badge>
                                        {decodedToken.signatureVerified !== null && (
                                            <Badge 
                                                variant={decodedToken.signatureVerified ? "default" : "destructive"}
                                                className="flex items-center gap-1"
                                            >
                                                {decodedToken.signatureVerified ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <XCircle className="h-3 w-3" />
                                                )}
                                                Signature {decodedToken.signatureVerified ? 'Verified' : 'Invalid'}
                                            </Badge>
                                        )}
                                        {decodedToken.warnings.length > 0 && (
                                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                {decodedToken.warnings.length} Warning{decodedToken.warnings.length !== 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    <div className="p-3 sm:p-4 rounded-lg border bg-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs sm:text-sm font-medium">Header</div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                onClick={() => copyToClipboard(JSON.stringify(decodedToken.header, null, 2), 'Header')}
                                            >
                                                {copied === 'Header' ? (
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <pre className="text-xs sm:text-sm font-mono bg-muted/50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                                            {JSON.stringify(decodedToken.header, null, 2)}
                                        </pre>
                                    </div>

                                    <div className="p-3 sm:p-4 rounded-lg border bg-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs sm:text-sm font-medium">Payload</div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                onClick={() => copyToClipboard(JSON.stringify(decodedToken.payload, null, 2), 'Payload')}
                                            >
                                                {copied === 'Payload' ? (
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <pre className="text-xs sm:text-sm font-mono bg-muted/50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                                            {JSON.stringify(decodedToken.payload, null, 2)}
                                        </pre>
                                        {decodedToken.payload.exp && (
                                            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
                                                Expires: {formatDate(decodedToken.payload.exp)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 sm:p-4 rounded-lg border bg-card">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs sm:text-sm font-medium">Signature</div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                onClick={() => copyToClipboard(decodedToken.signature, 'Signature')}
                                            >
                                                {copied === 'Signature' ? (
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="text-xs sm:text-sm font-mono bg-muted/50 p-2 rounded break-all">
                                            {decodedToken.signature}
                                        </div>
                                        {decodedToken.signatureVerified !== null && (
                                            <div className="mt-2 flex items-center gap-2">
                                                {decodedToken.signatureVerified ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className="text-xs sm:text-sm text-muted-foreground">
                                                    Signature {decodedToken.signatureVerified ? 'verified' : 'verification failed'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {decodedToken.warnings.length > 0 && (
                                        <div className="p-3 sm:p-4 rounded-lg border bg-yellow-500/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                <div className="text-xs sm:text-sm font-medium text-yellow-500">Warnings</div>
                                            </div>
                                            <ul className="list-disc list-inside space-y-1">
                                                {decodedToken.warnings.map((warning, index) => (
                                                    <li key={index} className="text-xs sm:text-sm text-yellow-500">
                                                        {warning}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Recent Tokens
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Your recently decoded JWT tokens
                                </CardDescription>
                            </div>
                            {history.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearHistory}
                                    className="text-xs sm:text-sm h-8 sm:h-9"
                                >
                                    Clear History
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {history.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                No recent tokens
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {history.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                                        onClick={() => {
                                            setToken(item.token);
                                            decodeToken();
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <div className="text-xs sm:text-sm font-mono break-all line-clamp-2">
                                                    {item.token}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(item.token, 'Token');
                                                }}
                                            >
                                                {copied === 'Token' ? (
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                )}
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