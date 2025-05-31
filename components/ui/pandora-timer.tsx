'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Timer, Bell, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PandoraTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSentRef = useRef(false);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      setHasNotificationPermission(permission === 'granted');
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    if (hasNotificationPermission && !notificationSentRef.current) {
      notificationSentRef.current = true;
      
      // Create a new notification
      const notification = new Notification('Coder Vibes', {
        body: 'Your focus session has ended. Ready for your next task?',
        icon: '/assets/logo.png',
        requireInteraction: true, // Keep notification visible until user interacts
        tag: 'coder-vibes-pandora-timer', // Group notifications with the same tag
      });

      // Play a sound when notification is shown
      try {
        const audio = new Audio('/assets/notification.mp3');
        audio.play();
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }
    setIsRunning(false);
    setTimeLeft(0);
    setInitialTime(0);
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      notificationSentRef.current = false;
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    const totalSeconds = minutesNum * 60 + secondsNum;
    
    if (totalSeconds > 0) {
      notificationSentRef.current = false;
      setInitialTime(totalSeconds);
      setTimeLeft(totalSeconds);
      setIsRunning(true);
      setShowInput(false);
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else if (timeLeft > 0) {
      setIsRunning(true);
    } else {
      setShowInput(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setInitialTime(0);
    setMinutes('');
    setSeconds('');
    setShowInput(true);
    notificationSentRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime ? (timeLeft / initialTime) * 100 : 0;

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-white dark:bg-gray-800 rounded-full shadow-lg p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 z-[100] transition-all duration-300 ease-in-out overflow-hidden"
      >
        <div className="relative w-7 h-7 sm:w-8 sm:h-8">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              className="text-primary/20"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              className="text-primary"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
              }}
            />
          </svg>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTimer}
            className="absolute inset-0 h-full w-full rounded-full bg-primary/10 hover:bg-primary/20"
          >
            {isRunning ? (
              <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            ) : (
              <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            )}
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {showInput ? (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="M"
                  className="w-16 h-7 sm:h-8 text-sm"
                  min="0"
                  max="120"
                />
                <span className="text-xs">:</span>
                <Input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="S"
                  className="w-16 h-7 sm:h-8 text-sm"
                  min="0"
                  max="59"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={startTimer}
                className="h-7 sm:h-8 text-sm"
              >
                Start
              </Button>
            </motion.div>
          ) : timeLeft > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {formatTime(timeLeft)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetTimer}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {!hasNotificationPermission && (
          <Button
            variant="ghost"
            size="icon"
            onClick={requestNotificationPermission}
            className="h-7 w-7 sm:h-8 sm:w-8 relative z-10"
            title="Enable notifications"
          >
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
} 