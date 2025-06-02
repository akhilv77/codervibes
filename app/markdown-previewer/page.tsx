'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMarkdownPreviewerStore } from '@/lib/markdown-previewer-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, RefreshCw, FileText, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownPreviewerPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useMarkdownPreviewerStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handlePreview = () => {
        setIsLoading(true);
        try {
            const trimmedInput = input.trim();
            if (!trimmedInput) {
                toast.error('Please enter some markdown to preview');
                return;
            }

            setOutput(trimmedInput);
            addToHistory({
                from: trimmedInput,
                to: trimmedInput,
            });
            toast.success('Markdown preview updated');
        } catch (error) {
            toast.error('Failed to update preview');
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
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Markdown Previewer</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Preview and test your markdown in real-time
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
                                        Markdown Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Write or paste your markdown here
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Markdown
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Write or paste your markdown here..."
                                        className="min-h-[400px] text-xs sm:text-sm font-mono"
                                    />
                                </div>

                                <Button
                                    onClick={handlePreview}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating Preview...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Update Preview
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Preview
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Live preview of your markdown
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="relative">
                                <div className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 rounded-md border">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: '1em 0',
                                                            borderRadius: '0.375rem',
                                                        }}
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            p: ({ children }) => <p className="mb-4">{children}</p>,
                                            h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-4">{children}</h3>,
                                            h4: ({ children }) => <h4 className="text-lg font-bold mb-2 mt-4">{children}</h4>,
                                            h5: ({ children }) => <h5 className="text-base font-bold mb-2 mt-3">{children}</h5>,
                                            h6: ({ children }) => <h6 className="text-sm font-bold mb-2 mt-3">{children}</h6>,
                                            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4">
                                                    {children}
                                                </blockquote>
                                            ),
                                            table: ({ children }) => (
                                                <div className="overflow-x-auto my-4">
                                                    <table className="min-w-full divide-y divide-border">
                                                        {children}
                                                    </table>
                                                </div>
                                            ),
                                            thead: ({ children }) => (
                                                <thead className="bg-muted">
                                                    {children}
                                                </thead>
                                            ),
                                            tbody: ({ children }) => (
                                                <tbody className="divide-y divide-border">
                                                    {children}
                                                </tbody>
                                            ),
                                            tr: ({ children }) => <tr>{children}</tr>,
                                            th: ({ children }) => (
                                                <th className="px-4 py-2 text-left font-medium">
                                                    {children}
                                                </th>
                                            ),
                                            td: ({ children }) => (
                                                <td className="px-4 py-2">
                                                    {children}
                                                </td>
                                            ),
                                            hr: () => <hr className="my-6 border-border" />,
                                            a: ({ href, children }) => (
                                                <a
                                                    href={href}
                                                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            img: ({ src, alt }) => (
                                                <img
                                                    src={src}
                                                    alt={alt}
                                                    className="rounded-lg my-4 max-w-full h-auto"
                                                />
                                            ),
                                        }}
                                    >
                                        {output}
                                    </ReactMarkdown>
                                </div>
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
                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                    History
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    Your recent markdown previews
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
                            {history.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No preview history yet
                                </div>
                            ) : (
                                <div className="space-y-4 pr-4">
                                    {history.map((item, index) => (
                                        <Card key={index} className="overflow-hidden">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        Preview
                                                    </Badge>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-medium mb-2">Markdown:</p>
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
                                                        <p className="text-xs sm:text-sm font-medium mb-2">Preview:</p>
                                                        <div className="relative">
                                                            <div className="prose prose-sm dark:prose-invert max-w-none p-3 rounded-md border bg-muted">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        code({ node, inline, className, children, ...props }) {
                                                                            const match = /language-(\w+)/.exec(className || '');
                                                                            return !inline && match ? (
                                                                                <SyntaxHighlighter
                                                                                    style={vscDarkPlus}
                                                                                    language={match[1]}
                                                                                    PreTag="div"
                                                                                    customStyle={{
                                                                                        margin: '1em 0',
                                                                                        borderRadius: '0.375rem',
                                                                                    }}
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, '')}
                                                                                </SyntaxHighlighter>
                                                                            ) : (
                                                                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                                                                                    {children}
                                                                                </code>
                                                                            );
                                                                        },
                                                                        p: ({ children }) => <p className="mb-4">{children}</p>,
                                                                        h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
                                                                        h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
                                                                        h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-4">{children}</h3>,
                                                                        h4: ({ children }) => <h4 className="text-lg font-bold mb-2 mt-4">{children}</h4>,
                                                                        h5: ({ children }) => <h5 className="text-base font-bold mb-2 mt-3">{children}</h5>,
                                                                        h6: ({ children }) => <h6 className="text-sm font-bold mb-2 mt-3">{children}</h6>,
                                                                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                                                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                                                                        li: ({ children }) => <li className="mb-1">{children}</li>,
                                                                        blockquote: ({ children }) => (
                                                                            <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4">
                                                                                {children}
                                                                            </blockquote>
                                                                        ),
                                                                        table: ({ children }) => (
                                                                            <div className="overflow-x-auto my-4">
                                                                                <table className="min-w-full divide-y divide-border">
                                                                                    {children}
                                                                                </table>
                                                                            </div>
                                                                        ),
                                                                        thead: ({ children }) => (
                                                                            <thead className="bg-muted">
                                                                                {children}
                                                                            </thead>
                                                                        ),
                                                                        tbody: ({ children }) => (
                                                                            <tbody className="divide-y divide-border">
                                                                                {children}
                                                                            </tbody>
                                                                        ),
                                                                        tr: ({ children }) => <tr>{children}</tr>,
                                                                        th: ({ children }) => (
                                                                            <th className="px-4 py-2 text-left font-medium">
                                                                                {children}
                                                                            </th>
                                                                        ),
                                                                        td: ({ children }) => (
                                                                            <td className="px-4 py-2">
                                                                                {children}
                                                                            </td>
                                                                        ),
                                                                        hr: () => <hr className="my-6 border-border" />,
                                                                        a: ({ href, children }) => (
                                                                            <a
                                                                                href={href}
                                                                                className="text-primary underline underline-offset-4 hover:text-primary/80"
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                {children}
                                                                            </a>
                                                                        ),
                                                                        img: ({ src, alt }) => (
                                                                            <img
                                                                                src={src}
                                                                                alt={alt}
                                                                                className="rounded-lg my-4 max-w-full h-auto"
                                                                            />
                                                                        ),
                                                                    }}
                                                                >
                                                                    {item.to}
                                                                </ReactMarkdown>
                                                            </div>
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