'use client';

import Link from "next/link";
import { Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

export function Header() {
    return (
        <header className="border-b">
            <div className="container max-w-screen-xl px-4 mx-auto flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                    <Image src="/assets/logo.png" alt="CoderVibes Logo" width={120} height={120} />
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
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
                <div className="flex items-center gap-4">
                    {/* Mobile Navigation */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <nav className="flex flex-col gap-4 mt-8">
                                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                                    Home
                                </Link>
                                <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                                    About
                                </Link>
                                <Link href="/contact" className="text-lg font-medium hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                                <Link href="/privacy" className="text-lg font-medium hover:text-primary transition-colors">
                                    Privacy
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/settings">
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Settings</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
} 