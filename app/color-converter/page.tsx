'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, RefreshCw, FileText, Check, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useColorConverterStore } from "@/lib/color-converter-store";
import { useServiceTracking } from '@/hooks/useServiceTracking';

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

export default function ColorConverterPage() {
    const [hexInput, setHexInput] = useState('');
    const [rgbInput, setRgbInput] = useState<RGB>({ r: 0, g: 0, b: 0 });
    const [hslInput, setHslInput] = useState<HSL>({ h: 0, s: 0, l: 0 });
    const [copied, setCopied] = useState<string | null>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useColorConverterStore();
    const { trackServiceUsage } = useServiceTracking();
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        loadHistory();
        trackServiceUsage('Color Studio', 'page_view');
    }, [loadHistory, trackServiceUsage]);

    const hexToRgb = (hex: string): RGB | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHex = (rgb: RGB): string => {
        return '#' + [rgb.r, rgb.g, rgb.b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };

    const rgbToHsl = (rgb: RGB): HSL => {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };

    const hslToRgb = (hsl: HSL): RGB => {
        const h = hsl.h / 360;
        const s = hsl.s / 100;
        const l = hsl.l / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };

    const handleHexChange = (value: string) => {
        setHexInput(value);
        if (value.match(/^#?[0-9A-Fa-f]{6}$/)) {
            const rgb = hexToRgb(value);
            if (rgb) {
                setRgbInput(rgb);
                setHslInput(rgbToHsl(rgb));
                addToHistory('HEX to RGB/HSL', value, `RGB(${rgb.r}, ${rgb.g}, ${rgb.b}) / HSL(${rgbToHsl(rgb).h}°, ${rgbToHsl(rgb).s}%, ${rgbToHsl(rgb).l}%)`);
                trackServiceUsage('Color Studio', 'color_converted');
            }
        }
    };

    const handleRgbChange = (component: keyof RGB, value: string) => {
        const numValue = parseInt(value) || 0;
        const newRgb = { ...rgbInput, [component]: Math.min(255, Math.max(0, numValue)) };
        setRgbInput(newRgb);
        setHexInput(rgbToHex(newRgb));
        setHslInput(rgbToHsl(newRgb));
        addToHistory('RGB to HEX/HSL', `RGB(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`, `HEX: ${rgbToHex(newRgb)} / HSL(${rgbToHsl(newRgb).h}°, ${rgbToHsl(newRgb).s}%, ${rgbToHsl(newRgb).l}%)`);
        trackServiceUsage('Color Studio', 'color_converted');
    };

    const handleHslChange = (component: keyof HSL, value: string) => {
        const numValue = parseInt(value) || 0;
        const newHsl = { ...hslInput, [component]: Math.min(component === 'h' ? 360 : 100, Math.max(0, numValue)) };
        setHslInput(newHsl);
        const rgb = hslToRgb(newHsl);
        setRgbInput(rgb);
        setHexInput(rgbToHex(rgb));
        addToHistory('HSL to HEX/RGB', `HSL(${newHsl.h}°, ${newHsl.s}%, ${newHsl.l}%)`, `HEX: ${rgbToHex(rgb)} / RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        trackServiceUsage('Color Studio', 'color_converted');
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        toast.success('Copied to clipboard');
        trackServiceUsage('Color Studio', 'clipboard_copy');
    };

    const handleClearHistory = async () => {
        await clearHistory();
        toast.success('History cleared');
        trackServiceUsage('Color Studio', 'history_cleared');
    };

    const getContrastColor = (hex: string): string => {
        const rgb = hexToRgb(hex);
        if (!rgb) return '#000000';
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    };

    const handleColorPreviewClick = () => {
        setShowColorPicker(true);
    };

    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        handleHexChange(newColor);
        setShowColorPicker(false);
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Color Studio</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Professional color format conversion and management tool
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
                                        <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Color Input
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter color in any format to convert
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <Palette className="w-3 h-3 mr-1" />
                                    Color Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hex" className="text-xs sm:text-sm">HEX</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="hex"
                                            value={hexInput}
                                            onChange={(e) => handleHexChange(e.target.value)}
                                            placeholder="#000000"
                                            className="text-xs sm:text-sm font-mono"
                                        />
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={hexInput}
                                                onChange={handleColorPickerChange}
                                                className="w-10 h-10 cursor-pointer rounded-md border"
                                                style={{
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'none',
                                                    appearance: 'none',
                                                    backgroundColor: hexInput.match(/^#?[0-9A-Fa-f]{6}$/) ? hexInput : '#ffffff',
                                                    padding: 0,
                                                    border: '1px solid var(--border)',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">RGB</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <Label htmlFor="r" className="text-xs">R</Label>
                                            <Input
                                                id="r"
                                                type="number"
                                                min="0"
                                                max="255"
                                                value={rgbInput.r}
                                                onChange={(e) => handleRgbChange('r', e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="g" className="text-xs">G</Label>
                                            <Input
                                                id="g"
                                                type="number"
                                                min="0"
                                                max="255"
                                                value={rgbInput.g}
                                                onChange={(e) => handleRgbChange('g', e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="b" className="text-xs">B</Label>
                                            <Input
                                                id="b"
                                                type="number"
                                                min="0"
                                                max="255"
                                                value={rgbInput.b}
                                                onChange={(e) => handleRgbChange('b', e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm">HSL</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <Label htmlFor="h" className="text-xs">H</Label>
                                            <Input
                                                id="h"
                                                type="number"
                                                min="0"
                                                max="360"
                                                value={hslInput.h}
                                                onChange={(e) => handleHslChange('h', e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="s" className="text-xs">S</Label>
                                            <Input
                                                id="s"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={hslInput.s}
                                                onChange={(e) => handleHslChange('s', e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="l" className="text-xs">L</Label>
                                            <Input
                                                id="l"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={hslInput.l}
                                                onChange={(e) => handleHslChange('l', e.target.value)}
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    </div>
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
                                        History
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Your recent color conversions
                                    </CardDescription>
                                </div>
                                {history.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearHistory}
                                        className="h-7 w-7 sm:h-8 sm:w-8"
                                    >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <ScrollArea className="h-[300px] sm:h-[400px]">
                                <div className="space-y-2 pr-4">
                                    {history.length === 0 ? (
                                        <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                                            No history yet
                                        </p>
                                    ) : (
                                        history.map((item, index) => (
                                            <div
                                                key={index}
                                                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.type}
                                                                </Badge>
                                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    {new Date(item.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs sm:text-sm font-mono break-all">
                                                                    From: {item.from}
                                                                </p>
                                                                <p className="text-xs sm:text-sm font-mono break-all">
                                                                    To: {item.to}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(item.to, `${item.type}-${index}`)}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            {copied === `${item.type}-${index}` ? (
                                                                <Check className="h-3 w-3 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 