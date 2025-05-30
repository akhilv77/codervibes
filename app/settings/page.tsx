"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, AlertTriangle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { RootPageShell } from "@/components/layout/root-page-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/back-button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { resetAll } = useStore();
  const { toast } = useToast();
  const { settings, setSettings, initialize } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
    initialize();
  }, []);

  useEffect(() => {
    if (mounted && settings.theme) {
      setTheme(settings.theme);
    }
  }, [mounted, settings.theme, setTheme]);

  if (!mounted) {
    return null;
  }

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    await setSettings({ theme: newTheme });
  };

  const handleReset = () => {
    resetAll();
    setResetDialogOpen(false);
    toast({
      title: "Reset Complete",
      description: "All data has been cleared from local storage",
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <BackButton path="/" />
        <PageHeader
          title="Settings"
          description="Manage your app preferences and data"
        />
      </div>
      <div className="container max-w-screen-xl">
        <div className="grid gap-8">
          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the app looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="flex items-center justify-center gap-2 h-auto py-4"
                >
                  <Sun className="h-5 w-5" />
                  <div className="flex flex-col items-center">
                    <span className="font-medium">Light</span>
                    <span className="text-xs text-muted-foreground">Default theme</span>
                  </div>
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="flex items-center justify-center gap-2 h-auto py-4"
                >
                  <Moon className="h-5 w-5" />
                  <div className="flex flex-col items-center">
                    <span className="font-medium">Dark</span>
                    <span className="text-xs text-muted-foreground">Dark mode</span>
                  </div>
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('system')}
                  className="flex items-center justify-center gap-2 h-auto py-4"
                >
                  <Monitor className="h-5 w-5" />
                  <div className="flex flex-col items-center">
                    <span className="font-medium">System</span>
                    <span className="text-xs text-muted-foreground">Follow system</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Manage your app data and reset options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your games, players, and scores data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                About Codervibes App
              </CardTitle>
              <CardDescription>
                App information and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Technologies</p>
                  <p className="text-sm text-muted-foreground">Next.js, TypeScript, Tailwind CSS, and Shadcn UI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}