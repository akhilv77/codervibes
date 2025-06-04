"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, RefreshCw, Maximize2, Minimize2, Trash2, Eye, FileText, Code2 } from "lucide-react";
import { useHTMLPreviewerStore } from "@/lib/html-previewer-store";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceTracking } from '@/hooks/useServiceTracking';

export default function HTMLPreviewer() {
    const [html, setHtml] = useState<string>("");
    const [css, setCss] = useState<string>("");
    const [js, setJs] = useState<string>("");
    const [preview, setPreview] = useState<string>("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewCardRef = useRef<HTMLDivElement>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useHTMLPreviewerStore();
    const { trackServiceUsage } = useServiceTracking();

    useEffect(() => {
        loadHistory();
        trackServiceUsage('HTML Preview', 'page_view');
    }, [loadHistory, trackServiceUsage]);

    const handlePreview = () => {
        try {
            const combinedPreview = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>${css}</style>
                    </head>
                    <body>
                        ${html}
                        <script>${js}</script>
                    </body>
                </html>
            `;
            setPreview(combinedPreview);
            addToHistory({
                html,
                css,
                js,
                timestamp: new Date().toISOString()
            });
            toast.success("Preview updated successfully!");
            trackServiceUsage('HTML Preview', 'preview_generated');
        } catch (error) {
            toast.error("Error generating preview");
        }
    };

    const handleCopy = (type: 'html' | 'css' | 'js') => {
        const content = type === 'html' ? html : type === 'css' ? css : js;
        navigator.clipboard.writeText(content);
        toast.success(`${type.toUpperCase()} copied to clipboard!`);
    };

    const handleClear = () => {
        setHtml("");
        setCss("");
        setJs("");
        setPreview("");
        toast.success("Cleared successfully!");
        trackServiceUsage('HTML Preview', 'history_cleared');
    };

    const handleHistoryClick = (item: { html: string; css: string; js: string }) => {
        setHtml(item.html || "");
        setCss(item.css || "");
        setJs(item.js || "");
        handlePreview();
    };

    const handleHistoryCopy = (content: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(content || "");
        toast.success("History item copied to clipboard!");
    };

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (previewCardRef.current?.requestFullscreen) {
                previewCardRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-3xl font-bold mb-6">HTML/CSS/JS Previewer</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Code Input</CardTitle>
                        <CardDescription>Write your HTML, CSS, and JavaScript code</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="html" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="html">HTML</TabsTrigger>
                                <TabsTrigger value="css">CSS</TabsTrigger>
                                <TabsTrigger value="js">JavaScript</TabsTrigger>
                            </TabsList>
                            <TabsContent value="html">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">HTML</h3>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy('html')}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={html}
                                        onChange={(e) => setHtml(e.target.value)}
                                        placeholder="Enter your HTML code here..."
                                        className="min-h-[200px] font-mono"
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="css">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">CSS</h3>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy('css')}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={css}
                                        onChange={(e) => setCss(e.target.value)}
                                        placeholder="Enter your CSS code here..."
                                        className="min-h-[200px] font-mono"
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="js">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">JavaScript</h3>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy('js')}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={js}
                                        onChange={(e) => setJs(e.target.value)}
                                        placeholder="Enter your JavaScript code here..."
                                        className="min-h-[200px] font-mono"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handlePreview}>Preview</Button>
                            <Button variant="outline" onClick={handleClear}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card ref={previewCardRef} className={isFullscreen ? "fixed inset-0 z-50 m-0 flex flex-col" : ""}>
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Preview
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Live preview of your code
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleFullscreen}
                                className="ml-auto"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className={`p-4 sm:p-6 ${isFullscreen ? "flex-1 overflow-auto" : ""}`}>
                        <div className="relative">
                            <div className={`prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border ${isFullscreen ? "min-h-0" : "min-h-[400px]"}`}>
                                <iframe
                                    ref={iframeRef}
                                    className={`w-full border rounded-md bg-white ${isFullscreen ? "h-[calc(100vh-8rem)]" : "min-h-[300px]"}`}
                                    sandbox="allow-scripts allow-same-origin"
                                    srcDoc={preview}
                                />
                            </div>
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
                                    Your recent code previews
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
                                                    {(item.html || "").substring(0, 50)}
                                                    {(item.html || "").length > 50 ? "..." : ""}
                                                </code>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.timestamp || Date.now()), { addSuffix: true })}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">•</span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                    {(item.html || "").length + (item.css || "").length + (item.js || "").length} characters
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
                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleHistoryCopy(item.html || "", e)}
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