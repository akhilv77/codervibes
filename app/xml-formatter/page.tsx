'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useXMLFormatterStore } from '@/lib/xml-formatter-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function XMLFormatterPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Text copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClearHistory = () => {
        clearHistory();
        toast.success('History cleared');
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Input XML</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your XML here..."
                            className="min-h-[300px] font-mono"
                        />
                        <div className="flex gap-2 mt-4">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Formatted Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Textarea
                                value={output}
                                readOnly
                                className="min-h-[300px] font-mono"
                            />
                            {output && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2"
                                    onClick={() => copyToClipboard(output)}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                        {isValid !== null && (
                            <div className="mt-2 flex items-center gap-2">
                                {isValid ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-500">Valid XML</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-500">Invalid XML</span>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>History</CardTitle>
                    {history.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearHistory}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear History
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        {history.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No formatting history yet
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">
                                                    {item.type === 'format' ? 'Formatted' : 'Minified'}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Input:</p>
                                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                        {item.from}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Output:</p>
                                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                        {item.to}
                                                    </pre>
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
    );
} 