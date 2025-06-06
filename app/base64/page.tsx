'use client';

import { useState, useCallback, DragEvent, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Copy, Check, FileText, Image as ImageIcon, FileIcon, Download, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServiceTracking } from '@/hooks/useServiceTracking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';

interface FileDetails {
  name: string;
  size: number;
  type: string;
  preview?: string;
  data?: string;
}

// Add MIME type to extension mapping
const MIME_TO_EXTENSION: { [key: string]: string } = {
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
  'text/xml': 'xml',
  'text/csv': 'csv',
  'text/markdown': 'md',
  'text/yaml': 'yml',
  'application/json': 'json',
  'application/xml': 'xml',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/msword': 'doc',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-powerpoint': 'ppt',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'font/ttf': 'ttf',
  'font/otf': 'otf',
  'font/woff': 'woff',
  'font/woff2': 'woff2',
};

const DocxPreview = ({ file }: { file: FileDetails }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDocx = async () => {
      try {
        if (!file.data || !containerRef.current) return;
        const base64Data = file.data.split(',')[1];
        const binary = atob(base64Data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        containerRef.current.innerHTML = ''; // Clear previous content
        await renderAsync(blob, containerRef.current);
      } catch (error) {
        console.error('Error rendering DOCX:', error);
        toast.error('Failed to preview Word document');
      }
    };

    renderDocx();
  }, [file]);

  return (
    <div className="w-full h-[500px] overflow-auto border rounded-lg bg-background">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

const AudioPreview = ({ file }: { file: FileDetails }) => {
  return (
    <div className="w-full h-[500px] flex items-center justify-center bg-background border rounded-lg">
      <audio
        controls
        className="w-full max-w-md"
        src={file.data}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

const VideoPreview = ({ file }: { file: FileDetails }) => {
  return (
    <div className="w-full h-[500px] overflow-auto border rounded-lg bg-background">
      <video
        controls
        className="w-full h-full object-contain"
        src={file.data}
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
};

export default function Base64Page() {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [base64String, setBase64String] = useState<string>('');
  const [base64Url, setBase64Url] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const [decodeInput, setDecodeInput] = useState<string>('');
  const [decodedFile, setDecodedFile] = useState<FileDetails | null>(null);
  const { trackServiceUsage } = useServiceTracking();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBase64String(result);
      setBase64Url(result);
      
      // Set file details with data for preview
      setFileDetails({
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? result : undefined,
        data: result
      });

      trackServiceUsage('Base64 Encoder', 'file_encoded');
      toast.success('File encoded successfully');
    };

    reader.readAsDataURL(file);
  }, [trackServiceUsage]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBase64String(result);
      setBase64Url(result);
      
      // Set file details with data for preview
      setFileDetails({
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? result : undefined,
        data: result
      });

      trackServiceUsage('Base64 Encoder', 'file_encoded');
      toast.success('File encoded successfully');
    };

    reader.readAsDataURL(file);
  }, [trackServiceUsage]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = useCallback((mimeType: string): string => {
    // First try to get from our mapping
    const extension = MIME_TO_EXTENSION[mimeType];
    if (extension) return extension;

    // If not found in mapping, try to extract from MIME type
    const parts = mimeType.split('/');
    if (parts.length === 2) {
      const subtype = parts[1];
      // Handle special cases
      if (subtype === 'plain') return 'txt';
      if (subtype === 'javascript') return 'js';
      if (subtype === 'svg+xml') return 'svg';
      if (subtype === 'x-zip-compressed') return 'zip';
      if (subtype.includes('wordprocessingml.document')) return 'docx';
      if (subtype.includes('spreadsheetml.sheet')) return 'xlsx';
      if (subtype.includes('presentationml.presentation')) return 'pptx';
      // Return the subtype as extension if it looks valid
      if (/^[a-z0-9]+$/.test(subtype)) return subtype;
    }

    // Default to bin if no valid extension found
    return 'bin';
  }, []);

  const handleDecode = useCallback(() => {
    try {
      // Check if the input is a valid data URL
      if (!decodeInput.startsWith('data:')) {
        toast.error('Invalid Base64 URL format');
        return;
      }

      // Extract MIME type and base64 data
      const matches = decodeInput.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        toast.error('Invalid Base64 URL format');
        return;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: mimeType });
      const size = blob.size;
      
      // Generate filename with proper extension
      const extension = getFileExtension(mimeType);
      const filename = `decoded_file.${extension}`;

      setDecodedFile({
        name: filename,
        size: size,
        type: mimeType,
        preview: decodeInput,
        data: decodeInput
      });

      trackServiceUsage('Base64 Encoder', 'file_decoded');
      toast.success('File decoded successfully');
    } catch (error) {
      console.error('Decode error:', error);
      toast.error('Failed to decode Base64 URL');
    }
  }, [decodeInput, trackServiceUsage, getFileExtension]);

  const handleDownload = useCallback((file: FileDetails) => {
    if (!file.data) return;

    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackServiceUsage('Base64 Encoder', 'file_downloaded');
    toast.success('File downloaded successfully');
  }, [trackServiceUsage]);

  const clearEncodeState = useCallback(() => {
    setFileDetails(null);
    setBase64String('');
    setBase64Url('');
    setCopied(null);
    trackServiceUsage('Base64 Encoder', 'encode_cleared');
    toast.success('Encode state cleared');
  }, [trackServiceUsage]);

  const clearDecodeState = useCallback(() => {
    setDecodeInput('');
    setDecodedFile(null);
    trackServiceUsage('Base64 Encoder', 'decode_cleared');
    toast.success('Decode state cleared');
  }, [trackServiceUsage]);

  const handleTabChange = useCallback((value: string) => {
    if (value === 'encode') {
      clearDecodeState();
    } else {
      clearEncodeState();
    }
  }, [clearEncodeState, clearDecodeState]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try downloading the file instead.');
    toast.error('Failed to load PDF');
  }, []);

  const renderPreview = useCallback((file: FileDetails) => {
    if (file.type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center gap-2 w-full h-full">
          {pdfError ? (
            <div className="text-center p-4">
              <p className="text-red-500 text-sm mb-2">{pdfError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(file)}
                className="mt-2"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          ) : (
            <div className="w-full h-[500px] overflow-auto border rounded-lg">
              <iframe
                src={file.data}
                className="w-full h-full border-0"
                onError={() => {
                  setPdfError('Failed to load PDF. Please try downloading the file instead.');
                  toast.error('Failed to load PDF');
                }}
              />
            </div>
          )}
        </div>
      );
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <DocxPreview file={file} />;
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      try {
        const base64Data = file.data?.split(',')[1];
        if (!base64Data) return <FileIcon className="h-8 w-8 text-muted-foreground" />;
        
        const binary = atob(base64Data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        
        const workbook = XLSX.read(array, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const html = XLSX.utils.sheet_to_html(firstSheet);
        
        return (
          <div className="w-full h-[500px] overflow-auto border rounded-lg bg-background">
            <div 
              className="p-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        );
      } catch (error) {
        console.error('Error rendering XLSX:', error);
        return <FileIcon className="h-8 w-8 text-muted-foreground" />;
      }
    }

    if (file.type.startsWith('audio/')) {
      return <AudioPreview file={file} />;
    }

    if (file.type.startsWith('video/')) {
      return <VideoPreview file={file} />;
    }

    if (file.type.startsWith('text/')) {
      try {
        const base64Data = file.data?.split(',')[1];
        if (!base64Data) return <FileIcon className="h-8 w-8 text-muted-foreground" />;
        
        const textContent = atob(base64Data);
        
        return (
          <div className="w-full h-[500px] overflow-auto border rounded-lg bg-background">
            <pre className="p-4 text-sm whitespace-pre-wrap break-words font-mono">
              {textContent}
            </pre>
          </div>
        );
      } catch (error) {
        console.error('Error decoding text file:', error);
        return <FileIcon className="h-8 w-8 text-muted-foreground" />;
      }
    }

    if (file.preview) {
      return (
        <img
          src={file.preview}
          alt="Preview"
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    return <FileIcon className="h-8 w-8 text-muted-foreground" />;
  }, [pdfError, handleDownload]);

  // Reset PDF error when switching tabs or clearing state
  useEffect(() => {
    setPdfError(null);
  }, [decodeInput, fileDetails]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Base64 Encoder & Decoder</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Convert files to Base64 encoding and decode Base64 URLs
          </p>
        </div>
      </div>

      <Tabs defaultValue="encode" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="encode" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Encode
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Decode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode">
          <div className="grid gap-4 sm:gap-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        File Upload
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        Upload a file to convert to Base64
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {(fileDetails || base64String || base64Url) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearEncodeState}
                          className="h-7 px-2 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        <Code className="w-3 h-3 mr-1" />
                        Base64 Format
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload" className="text-xs sm:text-sm">Select File</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center"
                           onDragOver={handleDragOver}
                           onDrop={handleDrop}>
                        <input
                          type="file"
                          id="file-upload"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                        </label>
                      </div>
                    </div>

                    {fileDetails && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">File Details</Label>
                            <div className="text-xs space-y-1">
                              <p><span className="font-medium">Name:</span> {fileDetails.name}</p>
                              <p><span className="font-medium">Size:</span> {formatFileSize(fileDetails.size)}</p>
                              <p><span className="font-medium">Type:</span> {fileDetails.type}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">Preview</Label>
                            <div className="aspect-square border rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                              {renderPreview(fileDetails)}
                            </div>
                          </div>
                        </div>
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
                        <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                        Base64 Output
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        Your Base64 encoded string and URL
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs sm:text-sm">Base64 String</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(base64String, 'string')}
                          className="h-7 w-7 p-0"
                        >
                          {copied === 'string' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <Textarea
                        value={base64String}
                        readOnly
                        className="min-h-[100px] text-xs sm:text-sm resize-none font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs sm:text-sm">Base64 URL</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(base64Url, 'url')}
                          className="h-7 w-7 p-0"
                        >
                          {copied === 'url' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <Textarea
                        value={base64Url}
                        readOnly
                        className="min-h-[100px] text-xs sm:text-sm resize-none font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decode">
          <div className="grid gap-4 sm:gap-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      Decode Base64
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      Paste a Base64 URL to decode
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {(decodeInput || decodedFile) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearDecodeState}
                        className="h-7 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      <Code className="w-3 h-3 mr-1" />
                      Base64 Format
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="decode-input" className="text-xs sm:text-sm">Base64 URL</Label>
                    <Textarea
                      id="decode-input"
                      value={decodeInput}
                      onChange={(e) => setDecodeInput(e.target.value)}
                      placeholder="Paste your Base64 URL here (e.g., data:image/png;base64,...)"
                      className="min-h-[500px] text-xs sm:text-sm resize-none font-mono"
                    />
                    <Button
                      onClick={handleDecode}
                      className="w-full text-xs sm:text-sm"
                    >
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Decode
                    </Button>
                  </div>

                  {decodedFile && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">File Details</Label>
                          <div className="text-xs space-y-1">
                            <p><span className="font-medium">Name:</span> {decodedFile.name}</p>
                            <p><span className="font-medium">Size:</span> {formatFileSize(decodedFile.size)}</p>
                            <p><span className="font-medium">Type:</span> {decodedFile.type}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(decodedFile)}
                            className="mt-2 w-full"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">Preview</Label>
                          <div className="aspect-square border rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                            {renderPreview(decodedFile)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 