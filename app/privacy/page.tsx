'use client';

import { RootPageShell } from "@/components/layout/root-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Server } from "lucide-react";

export default function PrivacyPage() {
    return (
        <RootPageShell>
            <div className="container flex justify-center">
                <div className="w-full max-w-4xl py-8">
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
                            <p className="text-xl text-muted-foreground">
                                Your privacy is our top priority
                            </p>
                        </div>

                        {/* Key Privacy Points */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <div className="mb-2">
                                        <Shield className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Local-First Approach</CardTitle>
                                    <CardDescription>
                                        Your data never leaves your device
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        All our tools operate entirely within your browser. Your data is processed locally
                                        and never transmitted to our servers. This ensures maximum privacy and security
                                        for your information.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-2">
                                        <Lock className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>No Data Storage</CardTitle>
                                    <CardDescription>
                                        We don&apos;t store your information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Unlike many other services, we don&apos;t maintain any databases or servers to store
                                        user data. This means there&apos;s no risk of data breaches or unauthorized access
                                        to your information.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-2">
                                        <Eye className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Transparent Operations</CardTitle>
                                    <CardDescription>
                                        Open source and verifiable
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Our code is open source, allowing you to verify exactly how your data is handled.
                                        We believe in complete transparency about our operations and data handling practices.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-2">
                                        <Server className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>No Server Requirements</CardTitle>
                                    <CardDescription>
                                        Works entirely in your browser
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Our tools are designed to work without any server-side processing. Everything
                                        happens in your browser, ensuring your data never needs to be sent anywhere.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Privacy Policy */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Privacy Policy</CardTitle>
                                <CardDescription>
                                    Last updated: {new Date().toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <section>
                                    <h3 className="text-lg font-semibold mb-2">1. Data Collection</h3>
                                    <p className="text-muted-foreground">
                                        We do not collect any personal data. Our tools operate entirely within your browser
                                        and do not require any server-side processing or data storage.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-semibold mb-2">2. Data Processing</h3>
                                    <p className="text-muted-foreground">
                                        All data processing occurs locally on your device. Your information never leaves
                                        your browser, ensuring complete privacy and security.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-semibold mb-2">3. Third-Party Services</h3>
                                    <p className="text-muted-foreground">
                                        We do not use any third-party services that collect or process user data. Our
                                        tools are completely self-contained within your browser.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-semibold mb-2">4. Cookies and Tracking</h3>
                                    <p className="text-muted-foreground">
                                        We do not use cookies or any form of tracking. Your browsing activity remains
                                        completely private while using our tools.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-semibold mb-2">5. Contact Information</h3>
                                    <p className="text-muted-foreground">
                                        If you have any questions about our privacy policy, please contact us through
                                        our contact page. We&apos;re committed to being transparent about our practices
                                        and addressing any concerns you may have.
                                    </p>
                                </section>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RootPageShell>
    );
} 