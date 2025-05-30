'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="h-8 w-8 p-0"
            >
                <Sun className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="h-8 w-8 p-0"
            >
                <Moon className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="h-8 w-8 p-0"
            >
                <Monitor className="h-4 w-4" />
            </Button>
        </div>
    );
} 