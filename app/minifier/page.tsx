"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, RefreshCw, Trash2, Code2, FileText, Scissors, Wand2 } from "lucide-react";
import { useMinifierStore } from "@/lib/minifier-store";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Minification functions
const minifyHTML = (html: string): string => {
    return html
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim();
};

const minifyCSS = (css: string): string => {
    return css
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*({|}|\(|\)|:|;|,)\s*/g, '$1') // Remove spaces around brackets, colons, semicolons, and commas
        .replace(/;}/g, '}') // Remove semicolons before closing braces
        .trim();
};

const minifyJS = (js: string): string => {
    return js
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*({|}|\(|\)|:|;|,)\s*/g, '$1') // Remove spaces around brackets, colons, semicolons, and commas
        .replace(/;}/g, '}') // Remove semicolons before closing braces
        .trim();
};

// Beautification functions
const beautifyHTML = (html: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    // Split by tags
    const tags = html.match(/<[^>]+>|[^<>]+/g) || [];

    tags.forEach((tag) => {
        // Handle closing tags
        if (tag.startsWith('</')) {
            indent--;
            formatted += tab.repeat(indent) + tag + '\n';
        }
        // Handle self-closing tags
        else if (tag.endsWith('/>')) {
            formatted += tab.repeat(indent) + tag + '\n';
        }
        // Handle opening tags
        else if (tag.startsWith('<')) {
            formatted += tab.repeat(indent) + tag + '\n';
            // Don't increase indent for self-closing tags
            if (!tag.match(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)[^>]*>/i)) {
                indent++;
            }
        }
        // Handle text content
        else if (tag.trim()) {
            formatted += tab.repeat(indent) + tag.trim() + '\n';
        }
    });

    return formatted.trim();
};

const beautifyCSS = (css: string): string => {
    // Remove any existing whitespace and comments
    css = css.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();

    let formatted = '';
    let indent = 0;
    const tab = '  ';

    // Split by closing brace to separate rules
    const rules = css.split('}');

    rules.forEach((rule) => {
        if (!rule.trim()) return;

        // Split the rule into selector and properties
        const [selector, ...properties] = rule.split('{');

        if (selector && properties.length > 0) {
            // Add the selector with proper indentation
            formatted += tab.repeat(indent) + selector.trim() + ' {\n';

            // Process each property
            const props = properties.join('{').split(';');
            props.forEach((prop) => {
                if (prop.trim()) {
                    // Split property and value
                    const [property, value] = prop.split(':').map(p => p.trim());
                    if (property && value) {
                        formatted += tab.repeat(indent + 1) + property + ': ' + value + ';\n';
                    }
                }
            });

            // Close the rule
            formatted += tab.repeat(indent) + '}\n';
        }
    });

    return formatted;
};

const beautifyJS = (js: string): string => {
    // Remove any existing whitespace and comments
    js = js.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();

    let formatted = '';
    let indent = 0;
    const tab = '  ';

    // Handle function declarations first
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
    let lastIndex = 0;
    let match;

    while ((match = functionRegex.exec(js)) !== null) {
        // Add any code before the function
        if (match.index > lastIndex) {
            const beforeCode = js.slice(lastIndex, match.index).trim();
            if (beforeCode) {
                formatted += beforeCode.split(';')
                    .filter(s => s.trim())
                    .map(s => tab.repeat(indent) + s.trim() + ';\n')
                    .join('');
            }
        }

        // Format the function
        const [_, name, params, body] = match;
        formatted += tab.repeat(indent) + 'function ' + name + '(';
        formatted += params.split(',').map(p => p.trim()).join(', ') + ') {\n';

        // Format function body
        const bodyStatements = body.split(';').filter(s => s.trim());
        bodyStatements.forEach(bodyStmt => {
            if (bodyStmt.trim()) {
                formatted += tab.repeat(indent + 1) + bodyStmt.trim() + ';\n';
            }
        });
        formatted += tab.repeat(indent) + '}\n\n';

        lastIndex = match.index + match[0].length;
    }

    // Add any remaining code after the last function
    if (lastIndex < js.length) {
        const remainingCode = js.slice(lastIndex).trim();
        if (remainingCode) {
            formatted += remainingCode.split(';')
                .filter(s => s.trim())
                .map(s => tab.repeat(indent) + s.trim() + ';\n')
                .join('');
        }
    }

    return formatted;
};

export default function Minifier() {
    const [input, setInput] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [type, setType] = useState<'html' | 'css' | 'js'>('html');
    const { history, addToHistory, clearHistory, loadHistory } = useMinifierStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleMinify = () => {
        try {
            let minified = '';
            switch (type) {
                case 'html':
                    minified = minifyHTML(input);
                    break;
                case 'css':
                    minified = minifyCSS(input);
                    break;
                case 'js':
                    minified = minifyJS(input);
                    break;
            }
            setOutput(minified);
            addToHistory({
                original: input,
                minified,
                type,
                timestamp: new Date().toISOString()
            });
            toast.success("Code minified successfully!");
        } catch (error) {
            toast.error("Error minifying code");
        }
    };

    const handleBeautify = () => {
        try {
            let beautified = '';
            switch (type) {
                case 'html':
                    beautified = beautifyHTML(input);
                    break;
                case 'css':
                    beautified = beautifyCSS(input);
                    break;
                case 'js':
                    beautified = beautifyJS(input);
                    break;
            }
            setOutput(beautified);
            addToHistory({
                original: input,
                minified: beautified,
                type,
                timestamp: new Date().toISOString()
            });
            toast.success("Code beautified successfully!");
        } catch (error) {
            toast.error("Error beautifying code");
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
        toast.success("Cleared successfully!");
    };

    const handleHistoryClick = (item: { original: string; minified: string; type: 'html' | 'css' | 'js' }) => {
        setInput(item.original);
        setOutput(item.minified);
        setType(item.type);
    };

    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-3xl font-bold mb-6">Code Minifier/Beautifier</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Input</CardTitle>
                        <CardDescription>Enter your code to minify or beautify</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="html" className="w-full" onValueChange={(value) => {
                            setType(value as 'html' | 'css' | 'js');
                            setInput("");
                            setOutput("");
                        }}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="html">HTML</TabsTrigger>
                                <TabsTrigger value="css">CSS</TabsTrigger>
                                <TabsTrigger value="js">JavaScript</TabsTrigger>
                            </TabsList>
                            <TabsContent value="html">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">HTML</h3>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy(input)}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter your HTML code here..."
                                        className="min-h-[200px] font-mono"
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="css">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">CSS</h3>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy(input)}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter your CSS code here..."
                                        className="min-h-[200px] font-mono"
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="js">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">JavaScript</h3>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy(input)}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter your JavaScript code here..."
                                        className="min-h-[200px] font-mono"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleMinify}>
                                <Scissors className="w-4 h-4 mr-2" />
                                Minify
                            </Button>
                            <Button onClick={handleBeautify}>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Beautify
                            </Button>
                            <Button variant="outline" onClick={handleClear}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Output</CardTitle>
                        <CardDescription>Minified or beautified code</CardDescription>
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
                                    <Code2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                    History
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Your recent minifications and beautifications
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
                                                    {(item.original || "").substring(0, 50)}
                                                    {(item.original || "").length > 50 ? "..." : ""}
                                                </code>
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                                                    {item.type.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.timestamp || Date.now()), { addSuffix: true })}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">•</span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                    {(item.original || "").length} characters
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
                                            onClick={() => handleCopy(item.original || "")}
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