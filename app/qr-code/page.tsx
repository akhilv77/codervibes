'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QrCode, Upload, Download, RefreshCw, FileText, Camera, Check, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQRCodeStore } from "@/lib/qr-code-store";
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { useServiceTracking } from '@/hooks/useServiceTracking';

export default function QRCodePage() {
    const [input, setInput] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [isReading, setIsReading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { history, addToHistory, clearHistory, loadHistory } = useQRCodeStore();
    const { trackServiceUsage } = useServiceTracking();

    useEffect(() => {
        loadHistory();
        trackServiceUsage('QR Code Studio', 'page_view');
    }, [loadHistory, trackServiceUsage]);

    const generateQRCode = async () => {
        try {
            if (!input.trim()) {
                toast.error('Please enter some text to generate QR code');
                return;
            }
            const url = await QRCode.toDataURL(input, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            setQrCodeUrl(url);
            addToHistory('Generated', input);
            toast.success('QR code generated successfully');
            trackServiceUsage('QR Code Studio', 'qr_generated');
        } catch (error) {
            toast.error('Failed to generate QR code');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const imageUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = imageUrl;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    setInput(code.data);
                    addToHistory('Scanned', code.data);
                    toast.success('QR code scanned successfully');
                    trackServiceUsage('QR Code Studio', 'qr_scanned');
                } else {
                    toast.error('No QR code found in the image');
                }
            };
        } catch (error) {
            toast.error('Failed to read QR code from image');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsReading(true);
            }
        } catch (error) {
            toast.error('Failed to access camera');
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsReading(false);
        }
    };

    useEffect(() => {
        let animationFrameId: number;

        const scanQRCode = () => {
            if (videoRef.current && canvasRef.current && isReading) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        setInput(code.data);
                        addToHistory('Scanned', code.data);
                        toast.success('QR code scanned successfully');
                        stopCamera();
                        trackServiceUsage('QR Code Studio', 'qr_scanned');
                    }
                }
                animationFrameId = requestAnimationFrame(scanQRCode);
            }
        };

        if (isReading) {
            scanQRCode();
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isReading, addToHistory, trackServiceUsage]);

    const downloadQRCode = () => {
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = 'qrcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('QR code downloaded successfully');
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        toast.success('Copied to clipboard');
    };

    const handleClearHistory = async () => {
        await clearHistory();
        toast.success('History cleared');
        trackServiceUsage('QR Code Studio', 'history_cleared');
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">QR Code Generator & Reader</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Generate QR codes and scan them from images or camera
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
                                        <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                                        QR Code Generator
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Enter text to generate a QR code
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <QrCode className="w-3 h-3 mr-1" />
                                    QR Format
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="input" className="text-xs sm:text-sm">Text</Label>
                                    <Input
                                        id="input"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter text to generate QR code..."
                                        className="text-xs sm:text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        onClick={generateQRCode}
                                        className="w-full text-xs sm:text-sm"
                                    >
                                        <QrCode className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                        Generate QR
                                    </Button>
                                    {qrCodeUrl && (
                                        <Button
                                            onClick={downloadQRCode}
                                            variant="outline"
                                            className="w-full text-xs sm:text-sm"
                                        >
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                            Download
                                        </Button>
                                    )}
                                </div>

                                {qrCodeUrl && (
                                    <div className="flex justify-center p-4 bg-white rounded-lg">
                                        <img src={qrCodeUrl} alt="Generated QR Code" className="max-w-full h-auto" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                                        QR Code Reader
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Scan QR codes from images or camera
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full text-xs sm:text-sm"
                                    >
                                        <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                        Upload Image
                                    </Button>
                                    <Button
                                        onClick={isReading ? stopCamera : startCamera}
                                        variant="outline"
                                        className="w-full text-xs sm:text-sm"
                                    >
                                        <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                        {isReading ? 'Stop Camera' : 'Start Camera'}
                                    </Button>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {isReading && (
                                    <div className="relative">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full rounded-lg"
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            className="hidden"
                                        />
                                    </div>
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
                                    Your recent QR code operations
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
                                                        <p className="text-xs sm:text-sm font-mono break-all">
                                                            {item.content}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(item.content, `${item.type}-${index}`)}
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
    );
} 