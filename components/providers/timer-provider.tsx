'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TimerContextType {
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  initialTime: number;
  setInitialTime: (time: number) => void;
  minutes: string;
  setMinutes: (minutes: string) => void;
  seconds: string;
  setSeconds: (seconds: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  return (
    <TimerContext.Provider 
      value={{ 
        isRunning, 
        setIsRunning, 
        timeLeft, 
        setTimeLeft, 
        initialTime, 
        setInitialTime,
        minutes,
        setMinutes,
        seconds,
        setSeconds
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
} 