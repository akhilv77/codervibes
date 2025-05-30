'use client';

import { RootPageShell } from "@/components/layout/root-page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Server, Mail, Clock, FileText, Users } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="container max-w-screen-xl px-4 py-8">
            <div className="max-w-screen-xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground text-lg">
                        Your privacy is important to us. Learn how we collect, use, and protect your information.
                    </p>
                </div>

                <div className="grid gap-8">
                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>We collect information that you provide directly to us, including when you:</p>
                                        <ul className="list-disc pl-6 space-y-2">
                                            <li>Create an account</li>
                                            <li>Use our tools and services</li>
                                            <li>Contact us for support</li>
                                            <li>Request new tools or features</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Eye className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Analytics and Tracking</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>We use Google Analytics to understand how visitors interact with our website. This helps us improve our services and user experience. Google Analytics may collect:</p>
                                        <ul className="list-disc pl-6 space-y-2">
                                            <li>Pages visited and time spent on each page</li>
                                            <li>Device and browser information</li>
                                            <li>Geographic location (country/region level)</li>
                                            <li>Traffic sources and user behavior</li>
                                        </ul>
                                        <p>You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>We use the information we collect to:</p>
                                        <ul className="list-disc pl-6 space-y-2">
                                            <li>Provide and maintain our services</li>
                                            <li>Improve and personalize your experience</li>
                                            <li>Analyze usage patterns and optimize our website</li>
                                            <li>Communicate with you about updates and new features</li>
                                            <li>Respond to your requests and support needs</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>You have the right to:</p>
                                        <ul className="list-disc pl-6 space-y-2">
                                            <li>Access your personal information</li>
                                            <li>Correct inaccurate data</li>
                                            <li>Request deletion of your data</li>
                                            <li>Opt out of analytics tracking</li>
                                            <li>Withdraw consent for data processing</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
                                        <p>
                                            <a href="mailto:support@codervibes.in" className="text-primary hover:underline">
                                                support@codervibes.in
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Clock className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.</p>
                                        <p className="text-sm">
                                            Last Updated: {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 