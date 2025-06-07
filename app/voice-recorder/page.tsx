'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { db } from '@/lib/db/indexed-db';
import { toast } from 'sonner';
import { Mic, Play, Pause, Square, Download, History, Trash2, X, Circle } from 'lucide-react';

interface Recording {
  id: string;
  timestamp: number;
  name: string;
  format: string;
  blob: Blob;
  duration: number;
}

interface VoiceRecorderState {
  format: string;
  isRecording: boolean;
  isPaused: boolean;
  recordings: Recording[];
  currentRecording: Recording | null;
}

// Supported audio formats
const audioFormats = [
  { id: 'audio/webm', name: 'WebM' },
  { id: 'audio/mp4', name: 'MP4' },
  { id: 'audio/ogg', name: 'OGG' },
  { id: 'audio/wav', name: 'WAV' }
];

export default function VoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({
    format: 'audio/webm',
    isRecording: false,
    isPaused: false,
    recordings: [],
    currentRecording: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingName, setRecordingName] = useState('');

  useEffect(() => {
    // Load saved state
    const loadSavedState = async () => {
      try {
        const savedState = await db.get<VoiceRecorderState>('voiceRecorder', 'lastState');
        if (savedState) {
          setState({
            ...savedState,
            isRecording: false,
            isPaused: false,
            currentRecording: null
          });
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };
    loadSavedState();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const saveState = async (newState: VoiceRecorderState) => {
    try {
      await db.set('voiceRecorder', 'lastState', newState);
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error('Failed to save state');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: state.format
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: state.format });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }

        const newRecording: Recording = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          name: recordingName || `Recording ${state.recordings.length + 1}`,
          format: state.format,
          blob: audioBlob,
          duration: recordingTime
        };

        setState(prev => {
          const newState = {
            ...prev,
            isRecording: false,
            isPaused: false,
            recordings: [newRecording, ...prev.recordings].slice(0, 5),
            currentRecording: newRecording
          };
          saveState(newState);
          return newState;
        });

        setRecordingTime(0);
        setRecordingName('');
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      
      // Update recording time every second
      const timer = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false
      }));

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      if (state.isPaused) {
        mediaRecorderRef.current.resume();
        startTimeRef.current = Date.now() - (recordingTime * 1000);
      } else {
        mediaRecorderRef.current.pause();
      }
      setState(prev => ({
        ...prev,
        isPaused: !prev.isPaused
      }));
    }
  };

  const playRecording = (recording: Recording) => {
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(recording.blob);
      audioRef.current.play();
    }
  };

  const downloadRecording = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.${recording.format.split('/')[1]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteRecording = (id: string) => {
    setState(prev => {
      const newRecordings = prev.recordings.filter(r => r.id !== id);
      const newState = {
        ...prev,
        recordings: newRecordings
      };
      saveState(newState);
      return newState;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Recorder
          </CardTitle>
          <CardDescription>Record and save audio using the MediaRecorder API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recording Format</label>
                <Select value={state.format} onValueChange={(value) => setState(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Recording Name</label>
                <input
                  type="text"
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                  placeholder="Enter recording name"
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={state.isRecording}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              {state.isRecording && (
                <div className="text-lg font-mono">
                  {formatTime(recordingTime)}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              {!state.isRecording ? (
                <Button
                  className="flex-1 max-w-[200px]"
                  onClick={startRecording}
                  disabled={state.isRecording}
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={pauseRecording}
                    className="flex-1 max-w-[200px]"
                  >
                    {state.isPaused ? (
                      <Play className="h-4 w-4 mr-2" />
                    ) : (
                      <Pause className="h-4 w-4 mr-2" />
                    )}
                    {state.isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopRecording}
                    className="flex-1 max-w-[200px]"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>

            <audio ref={audioRef} className="hidden" />
          </div>

          {/* History Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <CardTitle className="text-lg">Recordings</CardTitle>
                </div>
                {state.recordings?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setState(prev => {
                          const newState = { ...prev, recordings: [] };
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
              <CardDescription>Your recorded audio files</CardDescription>
            </CardHeader>
            <CardContent>
              {!state.recordings?.length ? (
                <div className="text-center text-muted-foreground py-4">
                  No recordings yet. Start recording to see your audio files.
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {state.recordings.map((recording) => (
                      <Card
                        key={recording.id}
                        className="p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(recording.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm font-medium">
                              {recording.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Format: {recording.format.split('/')[1].toUpperCase()} • Duration: {formatTime(recording.duration)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => playRecording(recording)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadRecording(recording)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteRecording(recording.id)}
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