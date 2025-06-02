'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, RefreshCw, Check, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useYAMLConverterStore } from "@/lib/yaml-converter-store";
import yaml from 'js-yaml';

export default function YAMLConverterPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [conversionType, setConversionType] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json');
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useYAMLConverterStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleConvert = () => {
        if (!input.trim()) {
            toast.error('Please enter some content to convert');
            return;
        }

        try {
            let result: string;
            if (conversionType === 'yaml-to-json') {
                const yamlObj = yaml.load(input);
                result = JSON.stringify(yamlObj, null, 2);
            } else {
                const jsonObj = JSON.parse(input);
                result = yaml.dump(jsonObj);
            }

            setOutput(result);
            addToHistory(
                conversionType === 'yaml-to-json' ? 'YAML to JSON' : 'JSON to YAML',
                input,
                result
            );
            toast.success('Conversion successful');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Invalid input format');
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

    const handleClearAll = () => {
        setInput('');
        setOutput('');
        toast.success('All fields cleared');
    };

    const toggleConversionType = () => {
        setConversionType(prev => prev === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json');
        setInput('');
        setOutput('');
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">YAML ⇄ JSON Converter</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Convert between YAML and JSON formats with ease
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
                                        Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter {conversionType === 'yaml-to-json' ? 'YAML' : 'JSON'} to convert
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    {conversionType === 'yaml-to-json' ? 'YAML' : 'JSON'} Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="input" className="text-xs sm:text-sm">
                                        {conversionType === 'yaml-to-json' ? 'YAML' : 'JSON'} Input
                                    </Label>
                                    <Textarea
                                        id="input"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Enter ${conversionType === 'yaml-to-json' ? 'YAML' : 'JSON'} to convert...`}
                                        className="min-h-[200px] text-xs sm:text-sm font-mono"
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
                                    <Button
                                        variant="outline"
                                        onClick={toggleConversionType}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        Switch
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">
                                        {conversionType === 'yaml-to-json' ? 'JSON' : 'YAML'} Output
                                    </Label>
                                    <div className="relative">
                                        <Textarea
                                            value={output}
                                            readOnly
                                            className="min-h-[200px] text-xs sm:text-sm font-mono"
                                        />
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
                                        Your recent conversions
                                    </CardDescription>
                                </div>
                                {history.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearHistory}
                                        className="h-7 w-7 sm:h-8 sm:w-8"
                                    >
                                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
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