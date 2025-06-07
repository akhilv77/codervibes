'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { db } from '@/lib/db/indexed-db';
import { toast } from 'sonner';
import { Image, Download, History, Trash2, X, Upload, Settings2, Loader2 } from 'lucide-react';

interface ImageFile {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  type: string;
  url: string;
  timestamp: number;
}

interface ImageCompressorState {
  quality: number;
  format: string;
  maxWidth: number;
  maxHeight: number;
  history: ImageFile[];
  currentFile: File | null;
  previewUrl: string | null;
}

// Supported image formats
const imageFormats = [
  { id: 'image/jpeg', name: 'JPEG' },
  { id: 'image/png', name: 'PNG' },
  { id: 'image/webp', name: 'WebP' }
];

export default function ImageCompressor() {
  const [state, setState] = useState<ImageCompressorState>({
    quality: 0.8,
    format: 'image/jpeg',
    maxWidth: 1920,
    maxHeight: 1080,
    history: [],
    currentFile: null,
    previewUrl: null
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load saved state
    const loadSavedState = async () => {
      try {
        const savedState = await db.get<ImageCompressorState>('imageCompressor', 'lastState');
        if (savedState) {
          setState(savedState);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        // Initialize with default state if loading fails
        setState({
          quality: 0.8,
          format: 'image/jpeg',
          maxWidth: 1920,
          maxHeight: 1080,
          history: [],
          currentFile: null,
          previewUrl: null
        });
      }
    };
    loadSavedState();
  }, []);

  const saveState = async (newState: ImageCompressorState) => {
    try {
      // Clean up URLs before saving to IndexedDB
      const stateToSave = {
        ...newState,
        currentFile: null, // Don't save File object
        previewUrl: null, // Don't save URL
        history: newState.history.map(item => ({
          ...item,
          url: null // Don't save URLs in history
        }))
      };
      await db.set('imageCompressor', 'lastState', stateToSave);
    } catch (error) {
      console.error('Error saving state:', error);
      // Don't show error toast for state saving failures
      // as they're not critical to the app's functionality
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = async (file: File) => {
    // Check if file type matches selected format
    if (file.type !== state.format) {
      toast.error(`Please select a ${state.format.split('/')[1].toUpperCase()} file`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      currentFile: file,
      previewUrl: objectUrl
    }));
  };

  const processImage = async () => {
    if (!state.currentFile) return;

    try {
      setIsProcessing(true);
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(state.currentFile);
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > state.maxWidth) {
          height = (state.maxWidth * height) / width;
          width = state.maxWidth;
        }
        
        if (height > state.maxHeight) {
          width = (state.maxHeight * width) / height;
          height = state.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          async (blob) => {
            if (!blob) return;

            const compressedUrl = URL.createObjectURL(blob);
            const newImage: ImageFile = {
              id: Date.now().toString(),
              name: state.currentFile!.name,
              originalSize: state.currentFile!.size,
              compressedSize: blob.size,
              type: state.format,
              url: compressedUrl,
              timestamp: Date.now()
            };

            try {
              setState(prev => {
                const newState = {
                  ...prev,
                  previewUrl: compressedUrl,
                  history: [newImage, ...prev.history].slice(0, 5)
                };
                // Save state after successful compression
                saveState(newState);
                return newState;
              });

              toast.success(`Compressed from ${formatSize(state.currentFile!.size)} to ${formatSize(blob.size)}`);
            } catch (error) {
              console.error('Error updating state:', error);
              toast.error('Failed to update image preview');
            } finally {
              setIsProcessing(false);
            }
          },
          state.format,
          state.quality
        );

        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      toast.error('Please drop an image file');
      return;
    }

    const file = files[0];
    if (file.type !== state.format) {
      toast.error(`Please drop a ${state.format.split('/')[1].toUpperCase()} file`);
      return;
    }

    await handleFileSelect(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      toast.error('Please select an image file');
      return;
    }

    const file = files[0];
    if (file.type !== state.format) {
      toast.error(`Please select a ${state.format.split('/')[1].toUpperCase()} file`);
      return;
    }

    await handleFileSelect(file);
  };

  const downloadImage = (image: ImageFile) => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `compressed_${image.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteImage = (id: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        history: prev.history.filter(img => img.id !== id)
      };
      saveState(newState);
      return newState;
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Image Compressor
          </CardTitle>
          <CardDescription>Compress and convert images using the Canvas API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <Select 
                  value={state.format} 
                  onValueChange={(value) => {
                    setState(prev => ({ 
                      ...prev, 
                      format: value,
                      currentFile: null,
                      previewUrl: null 
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quality: {Math.round(state.quality * 100)}%</label>
                <Slider
                  value={[state.quality * 100]}
                  onValueChange={([value]) => setState(prev => ({ ...prev, quality: value / 100 }))}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Width: {state.maxWidth}px</label>
                <Slider
                  value={[state.maxWidth]}
                  onValueChange={([value]) => setState(prev => ({ ...prev, maxWidth: value }))}
                  min={100}
                  max={3840}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Height: {state.maxHeight}px</label>
                <Slider
                  value={[state.maxHeight]}
                  onValueChange={([value]) => setState(prev => ({ ...prev, maxHeight: value }))}
                  min={100}
                  max={2160}
                  step={10}
                />
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center relative ${
                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="text-sm text-muted-foreground">Processing image...</div>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept={state.format}
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
                disabled={isProcessing}
              />
              <label
                htmlFor="file-input"
                className={`cursor-pointer flex flex-col items-center gap-2 ${
                  isProcessing ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {isProcessing ? 'Processing...' : `Drag and drop a ${state.format.split('/')[1].toUpperCase()} file here or click to select`}
                </div>
              </label>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Preview Section */}
          {state.previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <img
                      src={state.previewUrl}
                      alt="Preview"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Image Details</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span className="font-medium">{state.format.split('/')[1].toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quality:</span>
                        <span className="font-medium">{Math.round(state.quality * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Dimensions:</span>
                        <span className="font-medium">{state.maxWidth} × {state.maxHeight}px</span>
                      </div>
                      {state.currentFile && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Size:</span>
                          <span className="font-medium">{formatSize(state.currentFile.size)}</span>
                        </div>
                      )}
                      {state.history[0] && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Compressed Size:</span>
                            <span className="font-medium">{formatSize(state.history[0].compressedSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reduction:</span>
                            <span className="font-medium text-green-500">
                              {Math.round((1 - state.history[0].compressedSize / state.history[0].originalSize) * 100)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="pt-4 space-y-2">
                      <Button
                        className="w-full"
                        onClick={processImage}
                        disabled={isProcessing || !state.currentFile}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Compressing...
                          </>
                        ) : (
                          <>
                            <Settings2 className="h-4 w-4 mr-2" />
                            Compress Image
                          </>
                        )}
                      </Button>
                      {state.history[0] && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => state.history[0] && downloadImage(state.history[0])}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Compressed Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <CardTitle className="text-lg">History</CardTitle>
                </div>
                {state.history?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setState(prev => {
                          const newState = { ...prev, history: [] };
                          saveState(newState);
                          return newState;
                        });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>Your compressed images</CardDescription>
            </CardHeader>
            <CardContent>
              {!state.history?.length ? (
                <div className="text-center text-muted-foreground py-4">
                  No compressed images yet. Upload images to see them here.
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {state.history.map((image) => (
                      <Card
                        key={image.id}
                        className="p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(image.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm font-medium">
                              {image.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatSize(image.originalSize)} → {formatSize(image.compressedSize)} • {image.type.split('/')[1].toUpperCase()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadImage(image)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteImage(image.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
} 