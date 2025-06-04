'use client';

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, RefreshCw, Maximize2, Minimize2, Trash2, Eye, FileText, Code2 } from "lucide-react";
import { useDiffCheckerStore } from "@/lib/diff-checker-store";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as Diff from 'diff';
import { useServiceTracking } from '@/hooks/useServiceTracking';

export default function DiffChecker() {
    const [leftInput, setLeftInput] = useState<string>("");
    const [rightInput, setRightInput] = useState<string>("");
    const [diffType, setDiffType] = useState<string>("text");
    const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const previewCardRef = useRef<HTMLDivElement>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useDiffCheckerStore();
    const { trackServiceUsage } = useServiceTracking();

    useEffect(() => {
        loadHistory();
        trackServiceUsage('Diff Analyzer', 'page_view');
    }, [loadHistory, trackServiceUsage]);

    const handleCompare = () => {
        try {
            let left = leftInput;
            let right = rightInput;

            // Format JSON if the type is JSON
            if (diffType === "json") {
                try {
                    left = JSON.stringify(JSON.parse(leftInput), null, 2);
                    right = JSON.stringify(JSON.parse(rightInput), null, 2);
                } catch (error) {
                    toast.error("Invalid JSON format");
                    return;
                }
            }

            const diff = Diff.diffWords(left, right);
            setDiffResult(diff);

            addToHistory({
                left: leftInput,
                right: rightInput,
                type: diffType,
            });

            toast.success("Diff comparison completed!");
            trackServiceUsage('Diff Analyzer', 'diff_checked');
        } catch (error) {
            toast.error("Error comparing texts");
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Text copied to clipboard!");
    };

    const handleClear = () => {
        setLeftInput("");
        setRightInput("");
        setDiffResult([]);
        toast.success("Cleared successfully!");
        trackServiceUsage('Diff Analyzer', 'history_cleared');
    };

    const handleHistoryClick = (item: { left: string; right: string; type: string }) => {
        setLeftInput(item.left);
        setRightInput(item.right);
        setDiffType(item.type);
        handleCompare();
    };

    const handleHistoryCopy = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
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
        <div className="container mx-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Diff Checker</h1>
                    <p className="text-muted-foreground mt-1 text-xs sm:text-base">
                        Compare and find differences between texts
                    </p>
                </div>
                <Select value={diffType} onValueChange={setDiffType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Original Text
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Enter or paste your original text here
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {diffType.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                        <Textarea
                            value={leftInput}
                            onChange={(e) => setLeftInput(e.target.value)}
                            placeholder={`Enter your ${diffType} here...`}
                            className="min-h-[200px] sm:min-h-[300px] font-mono text-sm sm:text-base"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Modified Text
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Enter or paste your modified text here
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {diffType.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                        <Textarea
                            value={rightInput}
                            onChange={(e) => setRightInput(e.target.value)}
                            placeholder={`Enter your ${diffType} here...`}
                            className="min-h-[200px] sm:min-h-[300px] font-mono text-sm sm:text-base"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleCompare} className="w-full sm:w-auto">
                    Compare
                </Button>
                <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            </div>

            <Card ref={previewCardRef} className={isFullscreen ? "fixed inset-0 z-50 m-0 flex flex-col" : ""}>
                <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                                <Code2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                Diff Result
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-1">
                                View the differences between texts
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
                <CardContent className={`p-3 sm:p-6 ${isFullscreen ? "flex-1 overflow-auto" : ""}`}>
                    <div className="relative">
                        <div className={`prose prose-sm dark:prose-invert max-w-none p-3 sm:p-4 rounded-md border ${isFullscreen ? "min-h-0" : "min-h-[200px] sm:min-h-[400px]"}`}>
                            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm">
                                {diffResult.map((part, index) => (
                                    <span
                                        key={index}
                                        className={
                                            part.added
                                                ? "bg-green-500/20 text-green-500"
                                                : part.removed
                                                    ? "bg-red-500/20 text-red-500"
                                                    : ""
                                        }
                                    >
                                        {part.value}
                                    </span>
                                ))}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {history.length > 0 && (
                <Card className="border-t">
                    <CardHeader className="p-3 sm:p-6 border-b bg-muted/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                                    History
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Your recent diff comparisons
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearHistory}
                                className="sm:ml-auto hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                        <ScrollArea className="h-[200px] sm:h-[300px]">
                            <div className="space-y-2 sm:space-y-3 pr-4">
                                {history.map((item, index) => (
                                    <div
                                        key={index}
                                        className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <Button
                                            variant="ghost"
                                            className="flex-1 justify-start text-left h-auto py-2 px-2 sm:px-3 hover:bg-transparent"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <div className="flex flex-col items-start w-full">
                                                <div className="flex items-center gap-2 w-full">
                                                    <code className="text-xs truncate block flex-1 font-mono bg-muted/50 px-2 py-1 rounded">
                                                        {item.left.substring(0, 20)}... vs {item.right.substring(0, 20)}...
                                                    </code>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">•</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {item.type.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleHistoryClick(item)}
                                                className="shrink-0 h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/10"
                                            >
                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => handleHistoryCopy(item.left, e)}
                                                className="shrink-0 h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/10"
                                            >
                                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 