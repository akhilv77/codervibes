'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { db } from '@/lib/db/indexed-db';
import { toast } from 'sonner';
import { Volume2, Play, Pause, Square, VolumeX, Copy, History, Trash2, X } from 'lucide-react';

interface Voice {
  name: string;
  lang: string;
  default: boolean;
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  text: string;
  voice: string;
  rate: number;
  pitch: number;
}

interface TextToSpeechState {
  text: string;
  voice: string;
  rate: number;
  pitch: number;
  isPlaying: boolean;
  history: HistoryEntry[];
}

export default function TextToSpeech() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [state, setState] = useState<TextToSpeechState>({
    text: '',
    voice: '',
    rate: 1,
    pitch: 1,
    isPlaying: false,
    history: []
  });
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);

      // Load voices
      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        const formattedVoices = availableVoices.map(voice => ({
          name: voice.name,
          lang: voice.lang,
          default: voice.default
        }));
        setVoices(formattedVoices);

        // Set default voice
        if (formattedVoices.length > 0 && !state.voice) {
          const defaultVoice = formattedVoices.find(v => v.default) || formattedVoices[0];
          setState(prev => ({ ...prev, voice: defaultVoice.name }));
        }
      };

      // Chrome loads voices asynchronously
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }

    // Load saved state
    const loadSavedState = async () => {
      try {
        const savedState = await db.get<TextToSpeechState>('textToSpeech', 'lastState');
        if (savedState) {
          setState({
            ...savedState,
            isPlaying: false,
            history: savedState.history || []
          });
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };
    loadSavedState();

    // Cleanup
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const saveState = async (newState: TextToSpeechState) => {
    try {
      await db.set('textToSpeech', 'lastState', newState);
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error('Failed to save state');
    }
  };

  const addToHistory = (text: string, voice: string, rate: number, pitch: number) => {
    if (!text) return;

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      text,
      voice,
      rate,
      pitch
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

  const handleSpeak = () => {
    if (!speechSynthesis || !state.text) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(state.text);
    const selectedVoice = voices.find(v => v.name === state.voice);
    
    if (selectedVoice) {
      utterance.voice = speechSynthesis.getVoices().find(v => v.name === selectedVoice.name) || null;
    }
    
    utterance.rate = state.rate;
    utterance.pitch = state.pitch;

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      addToHistory(state.text, state.voice, state.rate, state.pitch);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setState(prev => ({ ...prev, isPlaying: false }));
      toast.error('Error during speech synthesis');
    };

    speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (speechSynthesis) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        setIsPaused(false);
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const handleStop = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setState(prev => ({ ...prev, isPlaying: false }));
      setIsPaused(false);
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        text: entry.text,
        voice: entry.voice,
        rate: entry.rate,
        pitch: entry.pitch
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

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Text to Speech
          </CardTitle>
          <CardDescription>Convert text to speech using the Web Speech API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Text to Speak</label>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(state.text);
                    toast.success('Text copied to clipboard');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={state.text}
                onChange={(e) => setState(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter text to speak"
                className="font-mono min-h-[300px] resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 flex flex-col items-center">
                <label className="text-sm font-medium">Voice</label>
                <Select value={state.voice} onValueChange={(value) => setState(prev => ({ ...prev, voice: value }))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 flex flex-col items-center">
                <label className="text-sm font-medium">Rate: {state.rate.toFixed(1)}x</label>
                <div className="pt-2">
                  <Slider
                    value={[state.rate]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) => setState(prev => ({ ...prev, rate: value }))}
                    className="w-[200px]"
                  />
                </div>
              </div>

              <div className="space-y-4 flex flex-col items-center">
                <label className="text-sm font-medium">Pitch: {state.pitch.toFixed(1)}</label>
                <div className="pt-2">
                  <Slider
                    value={[state.pitch]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) => setState(prev => ({ ...prev, pitch: value }))}
                    className="w-[200px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleSpeak}
                disabled={!state.text || state.isPlaying}
              >
                <Play className="h-4 w-4 mr-2" />
                Speak
              </Button>
              <Button
                variant="outline"
                onClick={handlePause}
                disabled={!state.isPlaying}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleStop}
                disabled={!state.isPlaying}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
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
              <CardDescription>Recent text-to-speech conversions</CardDescription>
            </CardHeader>
            <CardContent>
              {!state.history?.length ? (
                <div className="text-center text-muted-foreground py-4">
                  No history yet. Start converting text to speech to see your history.
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
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm font-mono truncate">
                              {entry.text}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Voice: {entry.voice} • Rate: {entry.rate.toFixed(1)}x • Pitch: {entry.pitch.toFixed(1)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(entry.text);
                                toast.success('Text copied to clipboard');
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
                                setState(prev => ({ ...prev, history: newHistory }));
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