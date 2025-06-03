'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '@/lib/codervibes-store';
import { useEffect } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { theme: storedTheme, setTheme: setStoredTheme, initialize } = useSettingsStore();

    // Initialize settings from IndexedDB on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Sync theme from IndexedDB to UI
    useEffect(() => {
        if (storedTheme && storedTheme !== theme) {
            setTheme(storedTheme);
        }
    }, [storedTheme, theme, setTheme]);

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        try {
            // Update IndexedDB first
            await setStoredTheme(newTheme);
            // Then update UI
            setTheme(newTheme);
        } catch (error) {
            console.error('Error updating theme:', error);
            // Fallback to just UI update if IndexedDB fails
            setTheme(newTheme);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className="h-8 w-8 p-0"
            >
                <Sun className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="h-8 w-8 p-0"
            >
                <Moon className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('system')}
                className="h-8 w-8 p-0"
            >
                <Monitor className="h-4 w-4" />
            </Button>
        </div>
    );
} 