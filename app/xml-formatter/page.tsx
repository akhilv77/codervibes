'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useXMLFormatterStore } from '@/lib/xml-formatter-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Trash2, Check, AlertCircle, FileCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function XMLFormatterPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useXMLFormatterStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const formatXML = (xml: string): string => {
        let formatted = '';
        let indent = '';
        const tab = '  '; // 2 spaces for indentation

        xml.split(/>\s*</).forEach((node) => {
            if (node.match(/^\/\w/)) {
                // Closing tag
                indent = indent.substring(tab.length);
            }

            formatted += indent + '<' + node + '>\r\n';

            if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
                // Opening tag
                indent += tab;
            }
        });

        return formatted.substring(1, formatted.length - 3);
    };

    const validateXML = (xml: string): boolean => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, 'text/xml');
            return !doc.getElementsByTagName('parsererror').length;
        } catch (error) {
            return false;
        }
    };

    const handleFormat = () => {
        setIsLoading(true);
        try {
            const trimmedInput = input.trim();
            if (!trimmedInput) {
                toast.error('Please enter some XML to format');
                return;
            }

            const isValidXML = validateXML(trimmedInput);
            setIsValid(isValidXML);

            if (isValidXML) {
                const formatted = formatXML(trimmedInput);
                setOutput(formatted);
                addToHistory({
                    type: 'format',
                    from: trimmedInput,
                    to: formatted,
                });
                toast.success('XML formatted successfully');
            } else {
                setOutput('');
                toast.error('Invalid XML format');
            }
        } catch (error) {
            toast.error('Failed to format XML');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMinify = () => {
        setIsLoading(true);
        try {
            const trimmedInput = input.trim();
            if (!trimmedInput) {
                toast.error('Please enter some XML to minify');
                return;
            }

            const isValidXML = validateXML(trimmedInput);
            setIsValid(isValidXML);

            if (isValidXML) {
                const minified = trimmedInput.replace(/>\s+</g, '><').trim();
                setOutput(minified);
                addToHistory({
                    type: 'minify',
                    from: trimmedInput,
                    to: minified,
                });
                toast.success('XML minified successfully');
            } else {
                setOutput('');
                toast.error('Invalid XML format');
            }
        } catch (error) {
            toast.error('Failed to minify XML');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        toast.success('Text copied to clipboard');
        setTimeout(() => setCopied(null), 2000);
    };

    const handleClearHistory = () => {
        clearHistory();
        toast.success('History cleared');
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">XML Formatter & Viewer</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Format, validate, and minify XML with ease
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
                                        <FileCode className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter XML to format or minify
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <FileCode className="w-3 h-3 mr-1" />
                                    XML Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Paste your XML here..."
                                        className="min-h-[200px] text-xs sm:text-sm font-mono"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleFormat}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Formatting...
                                            </>
                                        ) : (
                                            'Format XML'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleMinify}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Minifying...
                                            </>
                                        ) : (
                                            'Minify XML'
                                        )}
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
                                        <FileCode className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Output
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Formatted or minified XML
                                    </CardDescription>
                                </div>
                                {isValid !== null && (
                                    <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
                                        {isValid ? (
                                            <>
                                                <Check className="w-3 h-3 mr-1" />
                                                Valid XML
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Invalid XML
                                            </>
                                        )}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="relative">
                                <Textarea
                                    value={output}
                                    readOnly
                                    className="min-h-[200px] text-xs sm:text-sm font-mono"
                                />
                                {output && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(output, 'output')}
                                        className="absolute right-2 top-2 h-7 w-7 p-0"
                                    >
                                        {copied === 'output' ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <FileCode className="h-4 w-4 sm:h-5 sm:w-5" />
                                    History
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Your recent formatting operations
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
                            {history.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No formatting history yet
                                </div>
                            ) : (
                                <div className="space-y-4 pr-4">
                                    {history.map((item, index) => (
                                        <Card key={index} className="overflow-hidden">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.type === 'format' ? 'Formatted' : 'Minified'}
                                                    </Badge>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-medium mb-2">Input:</p>
                                                        <div className="relative">
                                                            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                                                                {item.from}
                                                            </pre>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyToClipboard(item.from, `from-${index}`)}
                                                                className="absolute right-2 top-2 h-7 w-7 p-0"
                                                            >
                                                                {copied === `from-${index}` ? (
                                                                    <Check className="h-3 w-3 text-green-500" />
                                                                ) : (
                                                                    <Copy className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-medium mb-2">Output:</p>
                                                        <div className="relative">
                                                            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                                                                {item.to}
                                                            </pre>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyToClipboard(item.to, `to-${index}`)}
                                                                className="absolute right-2 top-2 h-7 w-7 p-0"
                                                            >
                                                                {copied === `to-${index}` ? (
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
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 