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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.features.some(feature =>
      feature.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <RootPageShell>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container flex items-center justify-between">
            {/* <h1 className="text-3xl font-bold">App Suite</h1> */}
            <Image src="/assets/logo.png" alt="CoderVibes Logo" width={80} height={80} />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-8">
          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Coder Vibes App Suite</h2>
              <p className="text-muted-foreground mb-6">
                Welcome to your coder vibes app suite. Use the search bar below to quickly find the app you need.
              </p>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search apps by name, description, or features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              {filteredApps.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No Matching Apps Found' : 'No Apps Available'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Please check back later for new apps'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredApps.map((app) => (
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
                            Open App
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </RootPageShell>
  );
}
