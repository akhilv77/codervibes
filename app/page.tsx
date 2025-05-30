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
                            Open Tool
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <div className="mt-12 text-center">
                <h3 className="text-xl font-semibold mb-4">Need a Specific Tool?</h3>
                <p className="text-muted-foreground mb-6">
                  Can&apos;t find what you&apos;re looking for? We&apos;re constantly expanding our tool suite. Let us know what you need, and we&apos;ll build it for you!
                </p>
                <Button asChild>
                  <Link href="/contact">
                    Request a Tool
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RootPageShell>
  );
}
