"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, RefreshCw, Trash2, FileText, Type, History } from "lucide-react";
import { useLoremIpsumStore } from "@/lib/lorem-ipsum-store";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Lorem Ipsum text
const loremIpsumText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

// Generate Lorem Ipsum text
const generateLoremIpsum = (type: 'paragraphs' | 'words' | 'characters', count: number, startWithLorem: boolean = true): string => {
    const words = loremIpsumText.split(' ');
    let result = '';

    switch (type) {
        case 'paragraphs':
            for (let i = 0; i < count; i++) {
                if (i > 0) result += '\n\n';
                result += loremIpsumText;
            }
            break;
        case 'words':
            result = words.slice(0, count).join(' ');
            break;
        case 'characters':
            result = loremIpsumText.repeat(Math.ceil(count / loremIpsumText.length)).slice(0, count);
            break;
    }

    if (!startWithLorem && type === 'paragraphs') {
        result = result.replace(/^Lorem ipsum/, 'Start with');
    }

    return result;
};

export default function LoremIpsumGenerator() {
    const [output, setOutput] = useState<string>("");
    const [type, setType] = useState<'paragraphs' | 'words' | 'characters'>('paragraphs');
    const [count, setCount] = useState<number>(1);
    const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
    const { history, addToHistory, clearHistory, loadHistory } = useLoremIpsumStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleGenerate = () => {
        try {
            const generated = generateLoremIpsum(type, count, startWithLorem);
            setOutput(generated);
            addToHistory({
                text: generated,
                type,
                count,
                timestamp: new Date().toISOString()
            });
            toast.success("Text generated successfully!");
        } catch (error) {
            toast.error("Error generating text");
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const handleClear = () => {
        setOutput("");
        toast.success("Cleared successfully!");
    };

    const handleHistoryClick = (item: { text: string; type: 'paragraphs' | 'words' | 'characters'; count: number }) => {
        setOutput(item.text);
        setType(item.type);
        setCount(item.count);
    };

    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-3xl font-bold mb-6">Lorem Ipsum Generator</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Configure your Lorem Ipsum text</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Tabs defaultValue="paragraphs" className="w-full" onValueChange={(value) => {
                                setType(value as 'paragraphs' | 'words' | 'characters');
                                setOutput("");
                            }}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
                                    <TabsTrigger value="words">Words</TabsTrigger>
                                    <TabsTrigger value="characters">Characters</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-2">
                                <Label htmlFor="count">Count</Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min={1}
                                    max={type === 'paragraphs' ? 50 : type === 'words' ? 1000 : 5000}
                                    value={count}
                                    onChange={(e) => setCount(Math.min(parseInt(e.target.value) || 1, type === 'paragraphs' ? 50 : type === 'words' ? 1000 : 5000))}
                                />
                            </div>

                            {type === 'paragraphs' && (
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="start-with-lorem"
                                        checked={startWithLorem}
                                        onCheckedChange={setStartWithLorem}
                                    />
                                    <Label htmlFor="start-with-lorem">Start with "Lorem ipsum"</Label>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button onClick={handleGenerate}>
                                    <Type className="w-4 h-4 mr-2" />
                                    Generate
                                </Button>
                                <Button variant="outline" onClick={handleClear}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Output</CardTitle>
                        <CardDescription>Generated Lorem Ipsum text</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium">Result</h3>
                                <Button variant="ghost" size="sm" onClick={() => handleCopy(output)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                            </div>
                            <Textarea
                                value={output}
                                readOnly
                                className="min-h-[200px] font-mono"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {history.length > 0 && (
                <Card className="border-t">
                    <CardHeader className="p-4 sm:p-6 border-b bg-muted/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <History className="h-4 w-4 sm:h-5 sm:w-5" />
                                    History
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Your recent generations
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearHistory}
                                className="h-7 w-7 sm:h-8 sm:w-8"
                            >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3">
                            {history.map((item, index) => (
                                <div
                                    key={index}
                                    className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <Button
                                        variant="ghost"
                                        className="flex-1 justify-start text-left h-auto py-2 px-3 hover:bg-transparent"
                                        onClick={() => handleHistoryClick(item)}
                                    >
                                        <div className="flex flex-col items-start w-full">
                                            <div className="flex items-center gap-2 w-full">
                                                <code className="text-xs sm:text-sm truncate block flex-1 font-mono bg-muted/50 px-2 py-1 rounded">
                                                    {item.text.substring(0, 50)}
                                                    {item.text.length > 50 ? "..." : ""}
                                                </code>
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">•</span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                    {item.count} {item.type}
                                                </span>
                                            </div>
                                        </div>
                                    </Button>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleHistoryClick(item)}
                                            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10"
                                        >
                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopy(item.text)}
                                            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10"
                                        >
                                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 