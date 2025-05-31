'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettingsStore } from '@/lib/stores/settings-store';

const AMBIENT_SOUNDS = {
  rain: {
    name: 'Rain',
    url: '/sounds/rain.mp3',
  },
  forest: {
    name: 'Forest',
    url: '/sounds/forest.mp3',
  },
  water: {
    name: 'Water Stream',
    url: '/sounds/water.mp3',
  },
  waves: {
    name: 'Ocean Waves',
    url: '/sounds/waves.mp3',
  },
  fire: {
    name: 'Crackling Fire',
    url: '/sounds/fire.mp3',
  },
} as const;

type SoundKey = keyof typeof AMBIENT_SOUNDS;

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { settings, setSettings } = useSettingsStore();

  // Ensure we have a valid sound
  const currentSound = AMBIENT_SOUNDS[settings.preferredSound as SoundKey] 
    ? settings.preferredSound 
    : 'rain';

  // Load saved preferences
  useEffect(() => {
    if (settings.autoPlaySound) {
      setIsPlaying(true);
    }
  }, [settings.autoPlaySound]);

  // Handle audio playback
  useEffect(() => {
    if (audio) {
      audio.volume = settings.preferredVolume;
      if (isPlaying) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, settings.preferredVolume, audio]);

  // Create new audio when sound changes
  useEffect(() => {
    if (audio) {
      audio.pause();
    }

    const sound = AMBIENT_SOUNDS[currentSound as SoundKey];
    if (!sound) {
      console.error('Invalid sound selected:', currentSound);
      return;
    }

    const newAudio = new Audio(sound.url);
    newAudio.loop = true;
    newAudio.volume = settings.preferredVolume;
    
    if (isPlaying) {
      newAudio.play();
    }

    setAudio(newAudio);

    return () => {
      newAudio.pause();
    };
  }, [currentSound]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setSettings({ preferredVolume: newVolume });
  };

  const handleSoundChange = (value: string) => {
    if (value in AMBIENT_SOUNDS) {
      setSettings({ preferredSound: value });
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-8 w-8"
      >
        {isPlaying ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      <Slider
        value={[settings.preferredVolume]}
        onValueChange={handleVolumeChange}
        max={1}
        step={0.1}
        className="w-24"
      />

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sound Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Ambient Sound</Label>
              <RadioGroup
                value={currentSound}
                onValueChange={handleSoundChange}
                className="grid grid-cols-2 gap-4"
              >
                {Object.entries(AMBIENT_SOUNDS).map(([key, sound]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{sound.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Auto-play on app start</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoPlay"
                  checked={settings.autoPlaySound}
                  onChange={(e) => {
                    setSettings({ autoPlaySound: e.target.checked });
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="autoPlay">Enable auto-play</Label>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 