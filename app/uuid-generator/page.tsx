'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, RefreshCw, Key, Hash, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4, v1 as uuidv1, v5 as uuidv5 } from 'uuid';

export default function UUIDGenerator() {
    const [uuid, setUUID] = useState('');
    const [version, setVersion] = useState<'v4' | 'v1' | 'v5'>('v4');
    const [namespace, setNamespace] = useState('');

    const generateUUID = () => {
        try {
            let newUUID = '';
            switch (version) {
                case 'v1':
                    newUUID = uuidv1();
                    break;
                case 'v4':
                    newUUID = uuidv4();
                    break;
                case 'v5':
                    // Using URL namespace as default for v5
                    const namespaceUUID = namespace || '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
                    newUUID = uuidv5('example', namespaceUUID);
                    break;
            }
            setUUID(newUUID);
        } catch (error) {
            toast.error('Failed to generate UUID');
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy UUID to clipboard');
        }
    };

    const getVersionBadgeColor = (version: string) => {
        switch (version) {
            case 'v1':
                return 'bg-blue-500 text-white border-blue-600 hover:bg-blue-500 hover:text-white';
            case 'v4':
                return 'bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white';
            case 'v5':
                return 'bg-purple-500 text-white border-purple-600 hover:bg-purple-500 hover:text-white';
            default:
                return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-500 hover:text-white';
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-screen-xl">
            <Card className="border-2">
                <CardHeader className="space-y-2 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        <CardTitle className="text-xl sm:text-2xl">UUID Generator</CardTitle>
                    </div>
                    <CardDescription className="text-sm sm:text-base">
                        Generate unique identifiers (UUIDs/GUIDs) in different versions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                    {/* UUID Display */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={uuid}
                                    readOnly
                                    className="w-full p-2 sm:p-3 pr-20 sm:pr-24 border-2 rounded-lg bg-background font-mono text-sm sm:text-lg"
                                    placeholder="Your generated UUID will appear here"
                                />
                                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(uuid)}
                                        disabled={!uuid}
                                        className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-transparent"
                                    >
                                        <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={generateUUID}
                                        className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-transparent"
                                    >
                                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {uuid && (
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2">
                                        <Key className="h-4 w-4" />
                                        <span className="text-sm font-medium">UUID Version</span>
                                    </div>
                                    <Badge
                                        variant="default"
                                        className={`flex items-center gap-1 ${getVersionBadgeColor(version)} cursor-default pointer-events-none`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Version {version}</span>
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Version Selection */}
                    <div className="space-y-6 pt-4 border-t">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                <h3 className="text-base sm:text-lg font-semibold">UUID Settings</h3>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Version 1</span>
                                        <span className="text-xs text-muted-foreground">(Time-based)</span>
                                    </div>
                                    <Button
                                        variant={version === 'v1' ? 'default' : 'outline'}
                                        onClick={() => setVersion('v1')}
                                        className="w-full sm:w-24"
                                    >
                                        Select
                                    </Button>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Version 4</span>
                                        <span className="text-xs text-muted-foreground">(Random)</span>
                                    </div>
                                    <Button
                                        variant={version === 'v4' ? 'default' : 'outline'}
                                        onClick={() => setVersion('v4')}
                                        className="w-full sm:w-24"
                                    >
                                        Select
                                    </Button>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Version 5</span>
                                        <span className="text-xs text-muted-foreground">(Namespace-based)</span>
                                    </div>
                                    <Button
                                        variant={version === 'v5' ? 'default' : 'outline'}
                                        onClick={() => setVersion('v5')}
                                        className="w-full sm:w-24"
                                    >
                                        Select
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={generateUUID}
                            className="w-full"
                            size="lg"
                        >
                            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Generate UUID
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 