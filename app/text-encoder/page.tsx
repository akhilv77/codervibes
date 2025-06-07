'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/db/indexed-db';
import { toast } from 'sonner';
import { FileInput, Copy, ArrowRight, History, Trash2, X } from 'lucide-react';

interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'encode' | 'decode';
  format: string;
  input: string;
  output: string;
}

interface TextEncoderState {
  encodeInput: string;
  encodeOutput: string;
  decodeInput: string;
  decodeOutput: string;
  format: string;
  history: HistoryEntry[];
}

// Supported encoding formats
const encodingFormats = [
  { id: 'base64', name: 'Base64' },
  { id: 'url', name: 'URL' },
  { id: 'html', name: 'HTML' },
  { id: 'hex', name: 'Hexadecimal' },
  { id: 'binary', name: 'Binary' },
  { id: 'ascii', name: 'ASCII' },
];

// Function to encode text
const encodeText = (text: string, format: string): string => {
  try {
    switch (format) {
      case 'base64':
        return btoa(text);
      case 'url':
        return encodeURIComponent(text);
      case 'html':
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      case 'hex':
        return Array.from(text)
          .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('');
      case 'binary':
        return Array.from(text)
          .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
          .join(' ');
      case 'ascii':
        return Array.from(text)
          .map(c => c.charCodeAt(0))
          .join(' ');
      default:
        return text;
    }
  } catch (error) {
    console.error('Error encoding text:', error);
    return 'Error encoding text';
  }
};

// Function to decode text
const decodeText = (text: string, format: string): string => {
  try {
    switch (format) {
      case 'base64':
        return atob(text);
      case 'url':
        return decodeURIComponent(text);
      case 'html':
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
      case 'hex':
        return text
          .match(/.{1,2}/g)
          ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
          .join('') || '';
      case 'binary':
        return text
          .split(' ')
          .map(byte => String.fromCharCode(parseInt(byte, 2)))
          .join('');
      case 'ascii':
        return text
          .split(' ')
          .map(code => String.fromCharCode(parseInt(code)))
          .join('');
      default:
        return text;
    }
  } catch (error) {
    console.error('Error decoding text:', error);
    return 'Error decoding text';
  }
};

export default function TextEncoder() {
  const [state, setState] = useState<TextEncoderState>({
    encodeInput: '',
    encodeOutput: '',
    decodeInput: '',
    decodeOutput: '',
    format: 'base64',
    history: []
  });

  useEffect(() => {
    // Load saved state
    const loadSavedState = async () => {
      try {
        const savedState = await db.get<TextEncoderState>('textEncoder', 'lastState');
        if (savedState) {
          setState({
            ...savedState,
            history: savedState.history || []
          });
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        // Initialize with default state if there's an error
        setState({
          encodeInput: '',
          encodeOutput: '',
          decodeInput: '',
          decodeOutput: '',
          format: 'base64',
          history: []
        });
      }
    };
    loadSavedState();
  }, []);

  const addToHistory = (type: 'encode' | 'decode', input: string, output: string) => {
    if (!input || !output) return;

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      format: state.format,
      input,
      output
    };

    setState(prevState => {
      const newHistory = [newEntry, ...(prevState.history || [])].slice(0, 10);
      const newState = {
        ...prevState,
        history: newHistory
      };
      saveState(newState);
      return newState;
    });
  };

  const handleEncodeInputChange = (value: string) => {
    const encoded = encodeText(value, state.format);
    const newState = {
      ...state,
      encodeInput: value,
      encodeOutput: encoded
    };
    setState(newState);
    saveState(newState);
    if (value) {
      addToHistory('encode', value, encoded);
    }
  };

  const handleDecodeInputChange = (value: string) => {
    const decoded = decodeText(value, state.format);
    const newState = {
      ...state,
      decodeInput: value,
      decodeOutput: decoded
    };
    setState(newState);
    saveState(newState);
    if (value) {
      addToHistory('decode', value, decoded);
    }
  };

  const handleFormatChange = (format: string) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        format
      };
      saveState(newState);
      return newState;
    });
  };

  const clearHistory = () => {
    setState(prevState => {
      const newState = {
        ...prevState,
        history: []
      };
      saveState(newState);
      return newState;
    });
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setState(prevState => {
      const newState = entry.type === 'encode' 
        ? {
            ...prevState,
            encodeInput: entry.input,
            encodeOutput: entry.output,
            format: entry.format
          }
        : {
            ...prevState,
            decodeInput: entry.input,
            decodeOutput: entry.output,
            format: entry.format
          };
      saveState(newState);
      return newState;
    });
  };

  const saveState = async (newState: TextEncoderState) => {
    try {
      await db.set('textEncoder', 'lastState', newState);
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error('Failed to save state');
    }
  };

  const handleEncode = async () => {
    if (!state.encodeInput) return;
    
    try {
      const encoded = encodeText(state.encodeInput, state.format);
      
      setState(prevState => {
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'encode',
          format: prevState.format,
          input: prevState.encodeInput,
          output: encoded
        };
        
        const newHistory = [newEntry, ...(prevState.history || [])].slice(0, 10);
        
        const newState = {
          ...prevState,
          encodeOutput: encoded,
          history: newHistory
        };
        
        saveState(newState);
        return newState;
      });
    } catch (error) {
      console.error('Error encoding text:', error);
      toast.error('Error encoding text');
    }
  };

  const handleDecode = async () => {
    if (!state.decodeInput) return;
    
    try {
      const decoded = decodeText(state.decodeInput, state.format);
      
      setState(prevState => {
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'decode',
          format: prevState.format,
          input: prevState.decodeInput,
          output: decoded
        };
        
        const newHistory = [newEntry, ...(prevState.history || [])].slice(0, 10);
        
        const newState = {
          ...prevState,
          decodeOutput: decoded,
          history: newHistory
        };
        
        saveState(newState);
        return newState;
      });
    } catch (error) {
      console.error('Error decoding text:', error);
      toast.error('Error decoding text');
    }
  };

  const clearEncodeSection = () => {
    setState({
      ...state,
      encodeInput: '',
      encodeOutput: ''
    });
  };

  const clearDecodeSection = () => {
    setState({
      ...state,
      decodeInput: '',
      decodeOutput: ''
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileInput className="h-5 w-5" />
            Text Encoder/Decoder
          </CardTitle>
          <CardDescription>Encode and decode text in various formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Encoding Format</label>
              <Select value={state.format} onValueChange={handleFormatChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {encodingFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Encoding Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Encode</CardTitle>
                    <CardDescription>Convert text to encoded format</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearEncodeSection}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Input Text</label>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(state.encodeInput);
                        toast.success('Input copied to clipboard');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    type="text"
                    value={state.encodeInput}
                    onChange={(e) => setState({ ...state, encodeInput: e.target.value })}
                    placeholder="Enter text to encode"
                    className="font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={handleEncode}
                    disabled={!state.encodeInput}
                  >
                    Encode
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearEncodeSection}
                    disabled={!state.encodeInput && !state.encodeOutput}
                  >
                    Clear
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Encoded Output</label>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(state.encodeOutput);
                        toast.success('Output copied to clipboard');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[100px] w-full rounded-md border p-4">
                    <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                      {state.encodeOutput || 'Encoded output will appear here...'}
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Decoding Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Decode</CardTitle>
                    <CardDescription>Convert encoded text back to original format</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearDecodeSection}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Encoded Input</label>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(state.decodeInput);
                        toast.success('Input copied to clipboard');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    type="text"
                    value={state.decodeInput}
                    onChange={(e) => setState({ ...state, decodeInput: e.target.value })}
                    placeholder="Enter encoded text to decode"
                    className="font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={handleDecode}
                    disabled={!state.decodeInput}
                  >
                    Decode
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearDecodeSection}
                    disabled={!state.decodeInput && !state.decodeOutput}
                  >
                    Clear
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Decoded Output</label>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(state.decodeOutput);
                        toast.success('Output copied to clipboard');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[100px] w-full rounded-md border p-4">
                    <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                      {state.decodeOutput || 'Decoded output will appear here...'}
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

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
                      onClick={clearHistory}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear History
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>Recent encoding and decoding operations</CardDescription>
            </CardHeader>
            <CardContent>
              {!state.history?.length ? (
                <div className="text-center text-muted-foreground py-4">
                  No history yet. Start encoding or decoding text to see your history.
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {state.history.map((entry) => (
                      <Card
                        key={entry.id}
                        className="p-3 hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => loadFromHistory(entry)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                entry.type === 'encode' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {entry.type === 'encode' ? 'Encoded' : 'Decoded'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm font-mono truncate">
                              {entry.input}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Format: {entry.format}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(entry.output);
                                toast.success('Output copied to clipboard');
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newHistory = state.history.filter(h => h.id !== entry.id);
                                setState({ ...state, history: newHistory });
                                saveState({ ...state, history: newHistory });
                                toast.success('Entry removed from history');
                              }}
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