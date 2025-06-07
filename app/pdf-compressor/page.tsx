'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { db } from '@/lib/db/indexed-db';
import { toast } from 'sonner';
import { FileText, Download, History, Trash2, X, Upload, Settings2, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PDFFile {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  timestamp: number;
}

interface PDFCompressorState {
  quality: number;
  history: PDFFile[];
  currentFile: File | null;
  previewUrl: string | null;
}

export default function PDFCompressor() {
  const [state, setState] = useState<PDFCompressorState>({
    quality: 0.8,
    history: [],
    currentFile: null,
    previewUrl: null
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load saved state
    const loadSavedState = async () => {
      try {
        const savedState = await db.get<PDFCompressorState>('pdfCompressor', 'lastState');
        if (savedState) {
          setState(savedState);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        // Initialize with default state if loading fails
        setState({
          quality: 0.8,
          history: [],
          currentFile: null,
          previewUrl: null
        });
      }
    };
    loadSavedState();
  }, []);

  const saveState = async (newState: PDFCompressorState) => {
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
      await db.set('pdfCompressor', 'lastState', stateToSave);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      currentFile: file,
      previewUrl: objectUrl
    }));
  };

  const processPDF = async () => {
    if (!state.currentFile) return;

    try {
      setIsProcessing(true);
      
      // Read the PDF file
      const arrayBuffer = await state.currentFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Compress the PDF
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50
      });

      // Create a blob from the compressed PDF
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const compressedUrl = URL.createObjectURL(blob);

      const newPDF: PDFFile = {
        id: Date.now().toString(),
        name: state.currentFile.name,
        originalSize: state.currentFile.size,
        compressedSize: blob.size,
        url: compressedUrl,
        timestamp: Date.now()
      };

      try {
        setState(prev => {
          const newState = {
            ...prev,
            previewUrl: compressedUrl,
            history: [newPDF, ...prev.history].slice(0, 5)
          };
          saveState(newState);
          return newState;
        });

        toast.success(`Compressed from ${formatSize(state.currentFile.size)} to ${formatSize(blob.size)}`);
      } catch (error) {
        console.error('Error updating state:', error);
        toast.error('Failed to update PDF preview');
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Failed to process PDF');
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      toast.error('Please drop a PDF file');
      return;
    }

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please drop a PDF file');
      return;
    }

    await handleFileSelect(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      toast.error('Please select a PDF file');
      return;
    }

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    await handleFileSelect(file);
  };

  const downloadPDF = (pdf: PDFFile) => {
    const a = document.createElement('a');
    a.href = pdf.url;
    a.download = `compressed_${pdf.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deletePDF = (id: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        history: prev.history.filter(pdf => pdf.id !== id)
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
            <FileText className="h-5 w-5" />
            PDF Compressor
          </CardTitle>
          <CardDescription>Compress PDF files while maintaining quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Compression Quality: {Math.round(state.quality * 100)}%</label>
              <Slider
                value={[state.quality * 100]}
                onValueChange={([value]) => setState(prev => ({ ...prev, quality: value / 100 }))}
                min={1}
                max={100}
                step={1}
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center relative ${
                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="text-sm text-muted-foreground">Processing PDF...</div>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
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
                  {isProcessing ? 'Processing...' : 'Drag and drop a PDF file here or click to select'}
                </div>
              </label>
            </div>
          </div>

          {/* Preview Section */}
          {state.previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border">
                    <iframe
                      src={state.previewUrl}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">PDF Details</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compression Quality:</span>
                        <span className="font-medium">{Math.round(state.quality * 100)}%</span>
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
                        onClick={processPDF}
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
                            Compress PDF
                          </>
                        )}
                      </Button>
                      {state.history[0] && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => state.history[0] && downloadPDF(state.history[0])}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Compressed PDF
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
              <CardDescription>Your compressed PDFs</CardDescription>
            </CardHeader>
            <CardContent>
              {!state.history?.length ? (
                <div className="text-center text-muted-foreground py-4">
                  No compressed PDFs yet. Upload a PDF to see it here.
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {state.history.map((pdf) => (
                      <Card
                        key={pdf.id}
                        className="p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(pdf.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm font-medium">
                              {pdf.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatSize(pdf.originalSize)} → {formatSize(pdf.compressedSize)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadPDF(pdf)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deletePDF(pdf.id)}
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