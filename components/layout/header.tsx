'use client';

import Link from "next/link";
import { Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { MiniMusicPlayer } from "@/components/ui/mini-music-player";
import { PandoraTimer } from "@/components/ui/pandora-timer";

export function Header() {
    return (
        <header className="border-b">
            <div className="container max-w-screen-xl px-2 sm:px-4 mx-auto flex items-center justify-between py-2">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Image 
                        src="/assets/logo.png" 
                        alt="CoderVibes Logo" 
                        width={100} 
                        height={100}
                        className="w-16 h-16 sm:w-20 sm:h-20" 
                    />
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                            Contact Us
                        </Link>
                        <Link href="/privacy" className="text-sm font-medium hover:text-primary transition-colors">
                            Privacy
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-1 sm:gap-4">
                    {/* Mobile Navigation */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[280px] sm:w-[400px]">
                            <nav className="flex flex-col gap-4 mt-8">
                                <Link href="/" className="text-base sm:text-lg font-medium hover:text-primary transition-colors">
                                    Home
                                </Link>
                                <Link href="/about" className="text-base sm:text-lg font-medium hover:text-primary transition-colors">
                                    About
                                </Link>
                                <Link href="/contact" className="text-base sm:text-lg font-medium hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                                <Link href="/privacy" className="text-base sm:text-lg font-medium hover:text-primary transition-colors">
                                    Privacy
                                </Link>
                                <div className="pt-4 mt-4 border-t">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <PandoraTimer />
                                            <span className="text-base font-medium">Timer</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MiniMusicPlayer />
                                            <span className="text-base font-medium">Music</span>
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    {/* Desktop Timer and Music Player */}
                    <div className="hidden md:flex items-center gap-2">
                        <PandoraTimer />
                        <MiniMusicPlayer />
                    </div>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9">
                        <Link href="/settings">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="sr-only">Settings</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
} 