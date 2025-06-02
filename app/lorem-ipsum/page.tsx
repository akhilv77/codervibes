'use client';

import { useState } from 'react';
import { useLoremIpsumStore } from '@/lib/lorem-ipsum-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, FileText, Type } from 'lucide-react';
import { toast } from 'sonner';

const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
    'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
    'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
    'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
    'est', 'laborum'
];

export default function LoremIpsumPage() {
    const {
        paragraphs: paragraphCount,
        words,
        sentences,
        startWithLorem,
        generatedText,
        setParagraphs,
        setWords,
        setSentences,
        setStartWithLorem,
        setGeneratedText,
        reset
    } = useLoremIpsumStore();

    const [isGenerating, setIsGenerating] = useState(false);

    const generateRandomWord = () => {
        return loremWords[Math.floor(Math.random() * loremWords.length)];
    };

    const generateSentence = (wordCount: number) => {
        const sentenceWords = Array.from({ length: wordCount }, generateRandomWord);
        return sentenceWords.join(' ') + '.';
    };

    const generateParagraph = (sentenceCount: number, wordsPerSentence: number) => {
        const sentences = Array.from(
            { length: sentenceCount },
            () => generateSentence(wordsPerSentence)
        );
        return sentences.join(' ');
    };

    const generateLoremIpsum = () => {
        setIsGenerating(true);
        try {
            const wordsPerSentence = Math.ceil(words / sentences);
            const generatedParagraphs = Array.from(
                { length: paragraphCount },
                () => generateParagraph(sentences, wordsPerSentence)
            );

            let text = generatedParagraphs.join('\n\n');
            if (startWithLorem) {
                text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + text;
            }

            setGeneratedText(text);
            toast.success('Lorem Ipsum text generated successfully');
        } catch (error) {
            toast.error('Error generating Lorem Ipsum text');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedText);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Lorem Ipsum Generator</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Generate placeholder text for your designs and layouts
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
                                        <Type className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Generator Settings
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Customize your Lorem Ipsum text generation
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <Type className="w-3 h-3 mr-1" />
                                    Text Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paragraphs" className="text-xs sm:text-sm">Number of Paragraphs</Label>
                                    <Input
                                        id="paragraphs"
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={paragraphCount}
                                        onChange={(e) => setParagraphs(Number(e.target.value))}
                                        className="text-xs sm:text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="words" className="text-xs sm:text-sm">Words per Paragraph</Label>
                                    <Input
                                        id="words"
                                        type="number"
                                        min={10}
                                        max={200}
                                        value={words}
                                        onChange={(e) => setWords(Number(e.target.value))}
                                        className="text-xs sm:text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sentences" className="text-xs sm:text-sm">Sentences per Paragraph</Label>
                                    <Input
                                        id="sentences"
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={sentences}
                                        onChange={(e) => setSentences(Number(e.target.value))}
                                        className="text-xs sm:text-sm"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="startWithLorem"
                                        checked={startWithLorem}
                                        onCheckedChange={setStartWithLorem}
                                    />
                                    <Label htmlFor="startWithLorem" className="text-xs sm:text-sm">Start with &ldquo;Lorem ipsum&rdquo;</Label>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        className="flex-1 text-xs sm:text-sm"
                                        onClick={generateLoremIpsum}
                                        disabled={isGenerating}
                                    >
                                        <RefreshCw className={`mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                        Generate Text
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={reset}
                                        className="text-xs sm:text-sm"
                                    >
                                        Reset
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
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Generated Text
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Your generated Lorem Ipsum text
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <Textarea
                                    value={generatedText}
                                    onChange={(e) => setGeneratedText(e.target.value)}
                                    className="min-h-[300px] sm:min-h-[400px] font-mono text-xs sm:text-sm resize-none"
                                    placeholder="Generated Lorem Ipsum text will appear here..."
                                />
                                <Button
                                    className="w-full text-xs sm:text-sm"
                                    onClick={copyToClipboard}
                                    disabled={!generatedText}
                                >
                                    <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    Copy to Clipboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 