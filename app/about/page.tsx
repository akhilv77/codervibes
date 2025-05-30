'use client';

import { RootPageShell } from "@/components/layout/root-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Shield, Zap } from "lucide-react";

export default function AboutPage() {
    return (
        <RootPageShell>
            <div className="container flex justify-center">
                <div className="w-full max-w-4xl py-8">
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight">About CoderVibes</h1>
                            <p className="text-xl text-muted-foreground">
                                Your all-in-one suite of developer tools and utilities
                            </p>
                        </div>

                        {/* Mission Statement */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Our Mission</CardTitle>
                                <CardDescription>
                                    Empowering developers with efficient, privacy-focused tools
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    At CoderVibes, we believe in creating powerful, user-friendly tools that enhance your development workflow.
                                    Our suite of applications is designed to be intuitive, efficient, and most importantly, privacy-focused.
                                    We understand the importance of data security, which is why all our tools operate locally without storing
                                    any sensitive information on external servers.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Key Features */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <div className="mb-2">
                                        <Zap className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Lightning Fast</CardTitle>
                                    <CardDescription>
                                        Optimized for performance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Our tools are built with performance in mind, ensuring you can work efficiently without any lag or delays.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-2">
                                        <Shield className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Privacy First</CardTitle>
                                    <CardDescription>
                                        Your data stays local
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        All processing happens locally on your device. We don't store or transmit any of your data to external servers.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-2">
                                        <Code className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Developer Focused</CardTitle>
                                    <CardDescription>
                                        Built by developers, for developers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Our tools are designed with developers in mind, featuring intuitive interfaces and powerful functionality.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Call to Action */}
                        <Card className="bg-primary/5">
                            <CardHeader>
                                <CardTitle>Ready to Get Started?</CardTitle>
                                <CardDescription>
                                    Explore our suite of tools and enhance your development workflow
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href="/"
                                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                                >
                                    Browse our tools <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RootPageShell>
    );
} 