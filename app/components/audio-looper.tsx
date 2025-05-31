"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface AudioLooperProps {
  audioUrl: string;
}

export function AudioLooper({ audioUrl }: AudioLooperProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(5);
  const [endTime, setEndTime] = useState(95);
  const [gap, setGap] = useState(50); // Default to 50ms
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const endTimeInSeconds = (endTime / 100) * duration;

      if (currentTime >= endTimeInSeconds) {
        audioRef.current.pause();
        // Use a very short timeout for the gap
        timeoutRef.current = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = startTime;
            audioRef.current.play();
          }
        }, gap); // gap is now in milliseconds
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Audio Looper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="startTime">Start Time (seconds)</Label>
            <Input
              id="startTime"
              type="number"
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endTime">End Time (percentage)</Label>
            <Input
              id="endTime"
              type="number"
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              min={0}
              max={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gap">Gap (milliseconds)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="gap"
                min={0}
                max={200}
                step={1}
                value={[gap]}
                onValueChange={(value) => setGap(value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                min={0}
                max={200}
                className="w-20"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Lower values create more seamless loops (0-200ms)
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={isPlaying ? handlePause : handlePlay}>
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            style={{ display: 'none' }}
          />
        </div>
      </CardContent>
    </Card>
  );
} 