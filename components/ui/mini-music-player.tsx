'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Pause, Music, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { motion, AnimatePresence } from 'framer-motion';

const AMBIENT_SOUNDS = {
  rain: {
    name: 'Rain',
    url: '/sounds/rain.mp3',
    icon: '🌧️',
  },
  forest: {
    name: 'Forest',
    url: '/sounds/forest.mp3',
    icon: '🌲',
  },
  water: {
    name: 'Water Stream',
    url: '/sounds/water.mp3',
    icon: '💧',
  },
  waves: {
    name: 'Ocean Waves',
    url: '/sounds/waves.mp3',
    icon: '🌊',
  },
  fire: {
    name: 'Crackling Fire',
    url: '/sounds/fire.mp3',
    icon: '🔥',
  },
} as const;

type SoundKey = keyof typeof AMBIENT_SOUNDS;

export function MiniMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<'top' | 'bottom'>('bottom');
  const [isLoading, setIsLoading] = useState(true);
  const { settings, setSettings } = useSettingsStore();
  const playerRef = useRef<HTMLDivElement>(null);

  // Update dialog position based on available space
  useEffect(() => {
    if (!playerRef.current) return;

    const updatePosition = () => {
      const rect = playerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dialogHeight = 400; // Approximate height of the dialog

      setDialogPosition(spaceBelow >= dialogHeight ? 'bottom' : 'top');
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

    setIsLoading(true);
    const newAudio = new Audio(sound.url);
    newAudio.loop = true;
    newAudio.volume = settings.preferredVolume;
    
    // Add event listener for when audio ends to ensure looping
    newAudio.addEventListener('ended', () => {
      newAudio.currentTime = 0;
      newAudio.play();
    });

    // Add event listener for when audio is loaded
    newAudio.addEventListener('canplaythrough', () => {
      setIsLoading(false);
      if (isPlaying) {
        newAudio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    });
    
    setAudio(newAudio);

    return () => {
      newAudio.pause();
      newAudio.removeEventListener('ended', () => {
        newAudio.currentTime = 0;
        newAudio.play();
      });
      newAudio.removeEventListener('canplaythrough', () => {
        setIsLoading(false);
      });
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
    <div className="relative z-[100]" ref={playerRef}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-white dark:bg-gray-800 rounded-full shadow-lg p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 z-[100] transition-all duration-300 ease-in-out overflow-hidden"
      >
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full relative z-10 bg-primary/10 hover:bg-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
            ) : isPlaying ? (
              <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            ) : (
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            )}
          </Button>
          <div className="flex items-center gap-1 sm:gap-2 relative z-10">
            {!isLoading && (
              <>
                <motion.span 
                  className="text-lg sm:text-xl"
                  animate={isPlaying ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {AMBIENT_SOUNDS[currentSound as SoundKey].icon}
                </motion.span>
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  {AMBIENT_SOUNDS[currentSound as SoundKey].name}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 sm:h-8 sm:w-8 relative z-10"
            disabled={isLoading}
          >
            <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: dialogPosition === 'bottom' ? 20 : -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dialogPosition === 'bottom' ? 20 : -20 }}
            className={`absolute ${
              dialogPosition === 'bottom' ? 'top-12' : 'bottom-12'
            } right-0 w-[280px] sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 space-y-3 sm:space-y-4 z-[101]`}
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label>Ambient Sound</Label>
                <RadioGroup
                  value={currentSound}
                  onValueChange={handleSoundChange}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                >
                  {Object.entries(AMBIENT_SOUNDS).map(([key, sound]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="flex items-center gap-2 text-sm">
                        <span>{sound.icon}</span>
                        {sound.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Volume</Label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Slider
                    value={[settings.preferredVolume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-12 text-right">
                    {Math.round(settings.preferredVolume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 