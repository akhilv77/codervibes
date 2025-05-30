'use client';

import { RootPageShell } from "@/components/layout/root-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Github } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically handle the form submission
        // For now, we'll just log it
        console.log('Form submitted:', formData);
        // Reset form
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="container flex justify-center">
            <div className="w-full max-w-screen-xl py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
                        <p className="text-xl text-muted-foreground">
                            Have questions or feedback? We&apos;d love to hear from you.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Contact Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">
                                            Message
                                        </label>
                                        <Textarea
                                            id="message"
                                            placeholder="Your message..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Send Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Get in Touch</CardTitle>
                                    <CardDescription>
                                        Choose your preferred method of contact
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Mail className="h-5 w-5 text-primary" />
                                        <div>
                                            <h3 className="font-medium">Email</h3>
                                            <p className="text-sm text-muted-foreground">
                                                support@codervibes.in
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        <div>
                                            <h3 className="font-medium">Discord</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Join our community
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Github className="h-5 w-5 text-primary" />
                                        <div>
                                            <h3 className="font-medium">GitHub</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Follow our development
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Response Time</CardTitle>
                                    <CardDescription>
                                        What to expect after contacting us
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        We typically respond to all inquiries within 24-48 hours during business days.
                                        For urgent matters, please use our Discord community for faster assistance.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 