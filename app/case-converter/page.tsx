'use client';

import { useState, useEffect } from 'react';
import { useCaseConverterStore } from '@/lib/case-converter-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Type, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useServiceTracking } from '@/hooks/useServiceTracking';

const caseTypes = [
    { id: 'camelCase', name: 'camelCase', description: 'camelCase format' },
    { id: 'PascalCase', name: 'PascalCase', description: 'PascalCase format' },
    { id: 'snake_case', name: 'snake_case', description: 'snake_case format' },
    { id: 'kebab-case', name: 'kebab-case', description: 'kebab-case format' },
    { id: 'UPPER_CASE', name: 'UPPER_CASE', description: 'UPPER_CASE format' },
    { id: 'lowercase', name: 'lowercase', description: 'lowercase format' },
    { id: 'Title Case', name: 'Title Case', description: 'Title Case format' },
    { id: 'Sentence case', name: 'Sentence case', description: 'Sentence case format' },
];

export default function CaseConverterPage() {
    const {
        inputText,
        convertedText,
        selectedCase,
        setInputText,
        setConvertedText,
        setSelectedCase,
        reset
    } = useCaseConverterStore();

    const [isConverting, setIsConverting] = useState(false);
    const { trackServiceUsage } = useServiceTracking();

    useEffect(() => {
        trackServiceUsage('Case Transformer', 'page_view');
    }, []);

    const convertToCase = (text: string, caseType: string): string => {
        if (!text) return '';

        const words = text.split(/[\s-_]+/);

        switch (caseType) {
            case 'camelCase':
                return words.map((word, index) =>
                    index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join('');

            case 'PascalCase':
                return words.map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join('');

            case 'snake_case':
                return words.map(word => word.toLowerCase()).join('_');

            case 'kebab-case':
                return words.map(word => word.toLowerCase()).join('-');

            case 'UPPER_CASE':
                return words.map(word => word.toUpperCase()).join('_');

            case 'lowercase':
                return words.map(word => word.toLowerCase()).join(' ');

            case 'Title Case':
                return words.map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');

            case 'Sentence case':
                return words.map((word, index) =>
                    index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
                ).join(' ');

            default:
                return text;
        }
    };

    const handleConvert = () => {
        setIsConverting(true);
        try {
            const converted = convertToCase(inputText, selectedCase);
            setConvertedText(converted);
            toast.success('Text converted successfully');
            trackServiceUsage('Case Transformer', 'case_converted');
        } catch (error) {
            toast.error('Error converting text');
        } finally {
            setIsConverting(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(convertedText);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const resetCaseConverter = () => {
        reset();
        trackServiceUsage('Case Transformer', 'history_cleared');
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Case Converter</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Convert text between different case formats
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
                                        Input Text
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter text to convert
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
                                    <Label htmlFor="caseType" className="text-xs sm:text-sm">Case Type</Label>
                                    <Select
                                        value={selectedCase}
                                        onValueChange={setSelectedCase}
                                    >
                                        <SelectTrigger className="text-xs sm:text-sm">
                                            <SelectValue placeholder="Select case type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {caseTypes.map((type) => (
                                                <SelectItem
                                                    key={type.id}
                                                    value={type.id}
                                                    className="text-xs sm:text-sm"
                                                >
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="input" className="text-xs sm:text-sm">Text</Label>
                                    <Textarea
                                        id="input"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Enter text to convert..."
                                        className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm resize-none"
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        className="flex-1 text-xs sm:text-sm"
                                        onClick={handleConvert}
                                        disabled={isConverting || !inputText}
                                    >
                                        <RefreshCw className={`mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isConverting ? 'animate-spin' : ''}`} />
                                        Convert
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={resetCaseConverter}
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
                                        Converted Text
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Your converted text
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <Textarea
                                    value={convertedText}
                                    readOnly
                                    className="min-h-[200px] sm:min-h-[250px] font-mono text-xs sm:text-sm resize-none"
                                    placeholder="Converted text will appear here..."
                                />
                                <Button
                                    className="w-full text-xs sm:text-sm"
                                    onClick={copyToClipboard}
                                    disabled={!convertedText}
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