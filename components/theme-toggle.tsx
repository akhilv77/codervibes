'use client';

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useEffect } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { settings, setSettings, initialize } = useSettingsStore();

    // Initialize settings from IndexedDB on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Sync theme from settings to UI
    useEffect(() => {
        if (settings.theme && settings.theme !== theme) {
            setTheme(settings.theme);
        }
    }, [settings.theme, theme, setTheme]);

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        try {
            // Update settings first
            await setSettings({ theme: newTheme });
            // Then update UI
            setTheme(newTheme);
        } catch (error) {
            console.error('Error updating theme:', error);
            // Fallback to just UI update if settings update fails
            setTheme(newTheme);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => handleThemeChange(theme === "light" ? "dark" : "light")}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
} 