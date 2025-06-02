'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePasswordGeneratorStore } from '@/lib/password-generator-store';
import { Copy, RefreshCw, Shield, Lock, Key, Zap, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Loading } from '@/components/ui/loading';

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const { settings, updateSettings, loadSettings } = usePasswordGeneratorStore();

    useEffect(() => {
        const initializeGenerator = async () => {
            try {
                await loadSettings();
                generatePassword();
            } catch (error) {
                console.error('Error initializing password generator:', error);
                toast.error('Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };

        initializeGenerator();
    }, [loadSettings]);

    const generatePassword = () => {
        const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = settings;

        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = '';
        if (includeUppercase) chars += uppercase;
        if (includeLowercase) chars += lowercase;
        if (includeNumbers) chars += numbers;
        if (includeSymbols) chars += symbols;

        if (chars === '') {
            toast.error('Please select at least one character type');
            return;
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setPassword(result);
        calculateStrength(result);
    };

    const calculateStrength = (pass: string) => {
        let score = 0;

        // Length contribution
        score += Math.min(pass.length * 4, 40);

        // Character type contribution
        if (/[A-Z]/.test(pass)) score += 10;
        if (/[a-z]/.test(pass)) score += 10;
        if (/[0-9]/.test(pass)) score += 10;
        if (/[^A-Za-z0-9]/.test(pass)) score += 10;

        // Variety contribution
        const uniqueChars = new Set(pass).size;
        score += Math.min(uniqueChars * 2, 20);

        setStrength(Math.min(score, 100));
    };

    const getStrengthColor = (strength: number) => {
        if (strength === 100) return 'bg-green-500';
        if (strength < 50) return 'bg-red-500';
        if (strength < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = (strength: number) => {
        if (strength < 50) return 'Weak';
        if (strength < 80) return 'Moderate';
        return 'Strong';
    };

    const getStrengthIcon = (strength: number) => {
        if (strength < 50) return <XCircle className="h-4 w-4" />;
        if (strength < 80) return <AlertCircle className="h-4 w-4" />;
        return <CheckCircle2 className="h-4 w-4" />;
    };

    const getStrengthBadgeVariant = (strength: number) => {
        if (strength < 50) return 'destructive';
        if (strength < 80) return 'secondary';
        return 'default';
    };

    const getStrengthBadgeColor = (strength: number) => {
        if (strength < 50) return 'bg-red-500 text-white border-red-600 hover:bg-red-500 hover:text-white';
        if (strength < 80) return 'bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-500 hover:text-black';
        return 'bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white';
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy password to clipboard');
        }
    };

    if (isLoading) {
        return <Loading variant="default" size="lg" text="Loading password generator..." />;
    }

    return (
        <div className="container mx-auto p-4 max-w-screen-xl">
            <Card className="border-2">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">Password Generator</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Create strong, secure passwords with customizable settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Password Display */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={password}
                                    readOnly
                                    className="w-full p-3 pr-12 border-2 rounded-lg bg-background font-mono text-lg"
                                    placeholder="Your generated password will appear here"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(password)}
                                        disabled={!password}
                                        className="hover:bg-transparent"
                                    >
                                        <Copy className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={generatePassword}
                                        className="hover:bg-transparent"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {password && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        <span className="text-sm font-medium">Password Strength</span>
                                    </div>
                                    <Badge
                                        variant={getStrengthBadgeVariant(strength)}
                                        className={`flex items-center gap-1 ${getStrengthBadgeColor(strength)} cursor-default pointer-events-none`}
                                    >
                                        {getStrengthIcon(strength)}
                                        <span>{getStrengthText(strength)}</span>
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div
                                            key={index}
                                            className={`h-2 rounded-full transition-all duration-300 ${index * 25 < strength
                                                ? getStrengthColor(strength)
                                                : 'bg-muted'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="space-y-6 pt-4 border-t">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Password Settings</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Password Length</label>
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {settings.length} characters
                                        </span>
                                    </div>
                                    <Slider
                                        value={[settings.length]}
                                        onValueChange={([value]) => updateSettings({ ...settings, length: value })}
                                        min={8}
                                        max={50}
                                        step={1}
                                        className="py-4"
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Uppercase Letters</span>
                                            <span className="text-xs text-muted-foreground">(A-Z)</span>
                                        </div>
                                        <Switch
                                            checked={settings.includeUppercase}
                                            onCheckedChange={(checked) => updateSettings({ ...settings, includeUppercase: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Lowercase Letters</span>
                                            <span className="text-xs text-muted-foreground">(a-z)</span>
                                        </div>
                                        <Switch
                                            checked={settings.includeLowercase}
                                            onCheckedChange={(checked) => updateSettings({ ...settings, includeLowercase: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Numbers</span>
                                            <span className="text-xs text-muted-foreground">(0-9)</span>
                                        </div>
                                        <Switch
                                            checked={settings.includeNumbers}
                                            onCheckedChange={(checked) => updateSettings({ ...settings, includeNumbers: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Special Characters</span>
                                            <span className="text-xs text-muted-foreground">(!@#$%^&*)</span>
                                        </div>
                                        <Switch
                                            checked={settings.includeSymbols}
                                            onCheckedChange={(checked) => updateSettings({ ...settings, includeSymbols: checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={generatePassword}
                            className="w-full"
                            size="lg"
                        >
                            <Zap className="h-5 w-5 mr-2" />
                            Generate Password
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 