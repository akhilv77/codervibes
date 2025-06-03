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
import { cn } from '@/lib/utils';
import { useMusic } from '@/components/providers/music-provider';

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
    name: 'Water',
    url: '/sounds/water.mp3',
    icon: '💧',
  },
  waves: {
    name: 'Waves',
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<'top' | 'bottom'>('bottom');
  const { settings, setSettings, initialize } = useSettingsStore();
  const playerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlaying, setIsPlaying, currentSound, setCurrentSound } = useMusic();

  // Initialize settings store
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set default sound if none is selected
  useEffect(() => {
    if (!currentSound && settings?.preferredSound) {
      const defaultSound = (settings.preferredSound as SoundKey) || 'rain';
      setCurrentSound(defaultSound);
    }
  }, [currentSound, setCurrentSound, settings?.preferredSound]);

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

  // Load saved preferences
  useEffect(() => {
    if (settings?.autoPlaySound) {
      setIsPlaying(true);
    }
  }, [settings?.autoPlaySound]);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current && settings?.preferredVolume !== undefined) {
      // Validate volume before setting it
      const validVolume = typeof settings.preferredVolume === 'number' && isFinite(settings.preferredVolume)
        ? Math.max(0, Math.min(1, settings.preferredVolume))
        : 0.5;
      audioRef.current.volume = validVolume;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, settings?.preferredVolume, audioRef]);

  // Create new audio when sound changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const soundKey = (currentSound || settings?.preferredSound || 'rain') as SoundKey;
    const sound = AMBIENT_SOUNDS[soundKey];
    if (!sound) {
      console.error('Invalid sound selected:', soundKey);
      return;
    }

    setIsLoading(true);
    audioRef.current = new Audio(sound.url);
    audioRef.current.loop = true;
    // Validate volume before setting it
    const validVolume = typeof settings?.preferredVolume === 'number' && isFinite(settings.preferredVolume)
      ? Math.max(0, Math.min(1, settings.preferredVolume))
      : 0.5;
    audioRef.current.volume = validVolume;

    // Add event listener for when audio ends to ensure looping
    audioRef.current.addEventListener('ended', () => {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
    });

    // Add event listener for when audio is loaded
    audioRef.current.addEventListener('canplaythrough', () => {
      setIsLoading(false);
      if (isPlaying) {
        audioRef.current!.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    });

    return () => {
      audioRef.current!.pause();
      audioRef.current!.removeEventListener('ended', () => {
        audioRef.current!.currentTime = 0;
        audioRef.current!.play();
      });
      audioRef.current!.removeEventListener('canplaythrough', () => {
        setIsLoading(false);
      });
    };
  }, [currentSound, settings?.preferredSound, settings?.preferredVolume]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setSettings({ preferredVolume: newVolume });
  };

  const handleSoundSelect = async (soundKey: SoundKey) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const sound = AMBIENT_SOUNDS[soundKey];
    if (!sound) {
      console.error('Invalid sound selected:', soundKey);
      return;
    }

    setCurrentSound(soundKey);
    setSettings({ preferredSound: soundKey });
    audioRef.current = new Audio(sound.url);
    audioRef.current.loop = true;

    try {
      setIsLoading(true);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
    setShowSettings(false);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      } finally {
        setIsLoading(false);
      }
    }
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
            {!isLoading && currentSound && (
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
                  {AMBIENT_SOUNDS[currentSound]?.icon}
                </motion.span>
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  {AMBIENT_SOUNDS[currentSound]?.name}
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
            className={`absolute ${dialogPosition === 'bottom' ? 'top-12' : 'bottom-12'} right-0 w-[280px] sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 space-y-3 sm:space-y-4 z-[101]`}
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label>Ambient Sound</Label>
                <RadioGroup
                  value={currentSound || 'rain'}
                  onValueChange={(value) => {
                    handleSoundSelect(value as SoundKey);
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                >
                  {Object.entries(AMBIENT_SOUNDS).map(([key, sound]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="flex items-center gap-2">
                        {sound.icon}
                        <span>{sound.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Volume</Label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Slider
                    value={[settings?.preferredVolume ?? 0.5]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-12 text-right">
                    {Math.round((settings?.preferredVolume ?? 0.5) * 100)}%
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