'use client';

import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apps } from "@/lib/config";
import { RootPageShell } from "@/components/layout/root-page-shell";
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.features.some(feature =>
      feature.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApps = filteredApps.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container py-8">
        <div className="grid gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Welcome to CoderVibes Tool Suite</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Your one-stop destination for powerful utility tools. Whether you&apos;re a developer, designer, content creator, or just looking to boost your productivity, we&apos;ve got you covered. Use the search bar below to find the perfect tool for your needs.
            </p>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search tools by name, description, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            {filteredApps.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'No Matching Tools Found' : 'No Tools Available'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Please check back later for new tools'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {currentApps.map((app) => (
                    <Card key={app.name} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <app.icon className="h-5 w-5 text-primary" />
                              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                {app.name}
                              </CardTitle>
                            </div>
                            <CardDescription className="text-sm line-clamp-2">
                              {app.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Features:</p>
                          <ul className="space-y-1.5">
                            {app.features.map((feature, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <div className="px-6 pb-4">
                        <Link href={app.href} className="block">
                          <Button className="w-full group-hover:bg-primary/90 transition-colors">
                            Open Tool
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </>
            )}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
              <div className="relative">
                <div className="container max-w-screen-xl px-4">
                  <div className="bg-card border rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-8 md:p-12">
                      <div className="text-center space-y-4 mb-12">
                        <div className="inline-block">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            Custom Solutions
                          </span>
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight">Can&apos;t Find What You Need?</h3>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                          We&apos;re constantly expanding our tool suite to better serve your needs.
                          Share your requirements with us, and we&apos;ll help bring your vision to life.
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-muted/50 p-8 rounded-xl border">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-lg">Why Request a Tool?</h4>
                          </div>
                          <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Custom solutions tailored to your specific needs</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Priority development and dedicated support</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Early access to new features and updates</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-muted/50 p-8 rounded-xl border">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-lg">What to Include</h4>
                          </div>
                          <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Detailed description of tool purpose and features</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Your target audience and use cases</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Any specific technical requirements</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="text-center">
                        <Button size="lg" asChild className="px-8 h-12 text-base">
                          <Link href="/contact" className="flex items-center gap-2">
                            Request Your Tool
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
