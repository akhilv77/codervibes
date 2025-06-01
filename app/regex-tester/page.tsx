'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, AlertCircle, Info, History, Clock, Code, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RegexTesterPageShell } from '@/components/layout/regex-tester-page-shell';
import { useServiceTracking } from '@/hooks/useServiceTracking';
import { useRegexStore } from '@/lib/regex-store';
import { useServiceUsage } from '@/lib/hooks/use-service-usage';

interface Match {
    index: number;
    match: string;
    groups: string[];
}

export default function RegexTester() {
    const { trackServiceUsage } = useServiceTracking();
    const { history, addToHistory, loadHistory, clearHistory } = useRegexStore();
    const { trackUsage } = useServiceUsage();
    const [pattern, setPattern] = useState('');
    const [testString, setTestString] = useState('');
    const [flags, setFlags] = useState({
        g: true,
        i: false,
        m: false,
        s: false,
        u: false,
        y: false
    });
    const [matches, setMatches] = useState<Match[]>([]);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        trackServiceUsage('Regex Tester', 'page_view');
        loadHistory();
    }, []);

    const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) {
            const message = error.message;
            
            // Handle common regex errors with more user-friendly messages
            if (message.includes('Invalid regular expression')) {
                return 'Invalid regular expression pattern. Please check your syntax.';
            }
            if (message.includes('Invalid flags')) {
                return 'Invalid regex flags. Please use only valid flags (g, i, m, s, u, y).';
            }
            if (message.includes('Unterminated character class')) {
                return 'Unterminated character class. Make sure all brackets are properly closed.';
            }
            if (message.includes('Unterminated group')) {
                return 'Unterminated group. Make sure all parentheses are properly closed.';
            }
            if (message.includes('Invalid quantifier')) {
                return 'Invalid quantifier. Please check your repetition operators (?, *, +, {n,m}).';
            }
            if (message.includes('Invalid escape')) {
                return 'Invalid escape sequence. Please check your backslash usage.';
            }
            
            return message;
        }
        return 'An unexpected error occurred while processing the regular expression.';
    };

    const testRegex = () => {
        try {
            if (!pattern.trim()) {
                toast.error('Please enter a regular expression pattern.');
                setMatches([]);
                return;
            }

            if (!testString.trim()) {
                setMatches([]);
                return;
            }

            const flagString = Object.entries(flags)
                .filter(([_, enabled]) => enabled)
                .map(([flag]) => flag)
                .join('');

            const regex = new RegExp(pattern, flagString);
            const matches: Match[] = [];
            let match;

            while ((match = regex.exec(testString)) !== null) {
                matches.push({
                    index: match.index,
                    match: match[0],
                    groups: match.slice(1)
                });
            }

            if (matches.length === 0) {
                toast.error('No matches found for the given pattern in the test string.');
                setMatches([]);
                return;
            }

            setMatches(matches);
            if (pattern) {
                addToHistory(pattern, flagString);
            }
            toast.success(`Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} in the test string`);
            trackServiceUsage('Regex Tester', 'regex_test', `Pattern: ${pattern}`);
            trackUsage('regex-tester', 'test');
        } catch (err) {
            if (testString.trim()) {
                toast.error(getErrorMessage(err));
            }
            setMatches([]);
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

    const toggleFlag = (flag: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
    };

    const loadHistoryItem = (pattern: string, flags: string) => {
        setPattern(pattern);
        setFlags({
            g: flags.includes('g'),
            i: flags.includes('i'),
            m: flags.includes('m'),
            s: flags.includes('s'),
            u: flags.includes('u'),
            y: flags.includes('y')
        });
        // Add a small delay to ensure state updates before testing
        setTimeout(() => {
            testRegex();
        }, 0);
    };

    const handleHistoryClick = (pattern: string, flags: string) => {
        setPattern(pattern);
        setFlags({
            g: flags.includes('g'),
            i: flags.includes('i'),
            m: flags.includes('m'),
            s: flags.includes('s'),
            u: flags.includes('u'),
            y: flags.includes('y')
        });
        setMatches([]);
    };

    return (
        <RegexTesterPageShell>
            <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Regex Tester</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Test and debug regular expressions in real-time</p>
                    </div>
                </div>

                <div className="grid gap-6 sm:gap-8">
                    <Card>
                        <CardHeader className="pb-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                        <Code className="h-5 w-5" />
                                        Regular Expression
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                        Enter your pattern and test string
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    Real-time Testing
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm flex items-center gap-2 font-medium">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Pattern
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            value={pattern}
                                            onChange={(e) => setPattern(e.target.value)}
                                            placeholder="Enter your regular expression"
                                            className="font-mono h-12 text-base bg-muted/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => copyToClipboard(pattern, 'Pattern')}
                                            >
                                                {copied === 'Pattern' ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Flags</Label>
                                    <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border border-muted-foreground/20">
                                        {Object.entries(flags).map(([flag, enabled]) => (
                                            <Badge
                                                key={flag}
                                                variant={enabled ? "default" : "secondary"}
                                                className="cursor-pointer hover:bg-primary/10 transition-colors h-8 px-3 text-sm"
                                                onClick={() => toggleFlag(flag as keyof typeof flags)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono">{flag}</span>
                                                    <span className="text-xs opacity-70">
                                                        {flag === 'g' ? '(global)' :
                                                         flag === 'i' ? '(case-insensitive)' :
                                                         flag === 'm' ? '(multiline)' :
                                                         flag === 's' ? '(dotAll)' :
                                                         flag === 'u' ? '(unicode)' :
                                                         '(sticky)'}
                                                    </span>
                                                </div>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm flex items-center gap-2 font-medium">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Test String
                                    </Label>
                                    <div className="relative group">
                                        <Textarea
                                            value={testString}
                                            onChange={(e) => setTestString(e.target.value)}
                                            placeholder="Enter text to test against"
                                            className="min-h-[120px] font-mono text-base bg-muted/50 border-muted-foreground/20 focus:border-primary/50 transition-colors resize-none"
                                        />
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => copyToClipboard(testString, 'Test String')}
                                            >
                                                {copied === 'Test String' ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    onClick={testRegex} 
                                    className="w-full sm:w-auto h-12 px-6 text-base font-medium bg-primary hover:bg-primary/90 transition-colors"
                                >
                                    Test Pattern
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {history.length > 0 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        <CardTitle className="text-xl sm:text-2xl">Recent Patterns</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        Last 10 patterns
                                    </Badge>
                                </div>
                                <CardDescription className="text-sm">
                                    Your recently used regular expressions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {history.map((item, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-secondary/80 transition-colors"
                                            onClick={() => loadHistoryItem(item.pattern, item.flags)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                <span className="font-mono">{item.pattern}</span>
                                                {item.flags && (
                                                    <span className="text-xs opacity-70">
                                                        /{item.flags}
                                                    </span>
                                                )}
                                            </div>
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {matches.length > 0 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl sm:text-2xl">Matches</CardTitle>
                                <CardDescription className="text-sm">
                                    Found {matches.length} match{matches.length !== 1 ? 'es' : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {matches.map((match, index) => (
                                        <div key={index} className="p-4 rounded-lg border bg-card">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    Match {index + 1} at index {match.index}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => copyToClipboard(match.match, `Match ${index + 1}`)}
                                                >
                                                    {copied === `Match ${index + 1}` ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="font-mono bg-muted/50 p-2 rounded">
                                                {match.match}
                                            </div>
                                            {match.groups.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-medium text-muted-foreground mb-1">
                                                        Capture Groups
                                                    </div>
                                                    <div className="space-y-1">
                                                        {match.groups.map((group, groupIndex) => (
                                                            <div key={groupIndex} className="font-mono bg-muted/50 p-2 rounded">
                                                                Group {groupIndex + 1}: {group}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </RegexTesterPageShell>
    );
} 