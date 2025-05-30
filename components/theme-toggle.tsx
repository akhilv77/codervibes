'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useEffect } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { settings, setSettings, initialize } = useSettingsStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (settings.theme) {
            setTheme(settings.theme);
        }
    }, [settings.theme, setTheme]);

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        await setSettings({ theme: newTheme });
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