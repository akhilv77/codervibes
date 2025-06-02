'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2, MessageCircle, Users, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/sendgrid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            toast.success('Message sent successfully!');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact Us</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Get in touch with our team</p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6">
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Send Message
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Fill out the form below to contact us
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            required
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            required
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-xs sm:text-sm">Subject</Label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Message subject"
                                        required
                                        className="text-xs sm:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-xs sm:text-sm">Message</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Your message"
                                        required
                                        className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm resize-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/2" />
                        <CardHeader className="p-4 sm:p-6 relative">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Join Our Discord
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Connect with our community on Discord
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    Active Community
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 relative">
                            <div className="flex flex-col items-center justify-center space-y-6 text-center">
                                <div className="relative">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                                        <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow-md">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                        Join Our Community
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm sm:text-base text-muted-foreground">
                                            Get instant support, share feedback, and connect with other users
                                        </p>
                                        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>Active Members</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" />
                                                <span>24/7 Support</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <Button
                                        className="w-full bg-primary hover:bg-primary/90 text-white group transition-all duration-300"
                                        onClick={() => window.open(process.env.NEXT_PUBLIC_DISCORD_INVITE_LINK, '_blank')}
                                    >
                                        <span className="flex items-center gap-2">
                                            Join Discord Server
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Instant access to our community
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 