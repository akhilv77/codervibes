'use client';

import Link from "next/link";
import { Settings, Search, ChevronLeft, ChevronRight, X, Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apps } from "@/lib/config";
import { RootPageShell } from "@/components/layout/root-page-shell";
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/lib/codervibes-store";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 12;
  const { toggleFavoriteApp, isAppFavorite, initialize, settings } = useSettingsStore();

  // Initialize settings when component mounts
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initialize();
      setIsLoading(false);
    };
    init();
  }, [initialize]);

  // Get all unique tags and group them by category
  const tagCategories = useMemo(() => {
    const categories: { [key: string]: string[] } = {
      'Development': ['development', 'code', 'format', 'editor', 'debug', 'testing'],
      'Data': ['data', 'json', 'csv', 'yaml', 'xml'],
      'Design': ['design', 'color', 'preview', 'format'],
      'Security': ['security', 'password', 'crypto', 'hash', 'jwt'],
      'Utility': ['utility', 'conversion', 'generator', 'tracking', 'management'],
      'Web': ['web', 'html', 'url', 'encoding'],
    };
    return categories;
  }, []);

  // Filter and sort apps based on search query, selected tags, and favorites
  const filteredApps = useMemo(() => {
    if (isLoading) return [];

    // First filter based on search and tags
    const filtered = apps.filter(app => {
      const matchesSearch = searchQuery === '' ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase())) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => app.tags.includes(tag));

      const matchesFavorites = !showFavoritesOnly || isAppFavorite(app.id);

      return matchesSearch && matchesTags && matchesFavorites;
    });

    // Split into favorites and non-favorites
    const favorites = filtered.filter(app => isAppFavorite(app.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    const nonFavorites = filtered.filter(app => !isAppFavorite(app.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Combine with favorites first
    return [...favorites, ...nonFavorites];
  }, [searchQuery, selectedTags, showFavoritesOnly, isAppFavorite, isLoading]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApps = filteredApps.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen mx-auto bg-background">
      <main className="container px-4 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Welcome to CoderVibes Tool Suite</h2>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-base sm:text-lg">
              Your one-stop destination for powerful utility tools. Whether you&apos;re a developer, designer, content creator, or just looking to boost your productivity, we&apos;ve got you covered.
            </p>

            {/* Search and Filter Section */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-full text-sm sm:text-base"
                    list="search-suggestions"
                  />
                  <datalist id="search-suggestions">
                    {apps.map(app => (
                      <option key={app.id} value={app.name} />
                    ))}
                  </datalist>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      className="flex items-center gap-2"
                    >
                      <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">Filter by Favorites</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Favorites</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className={cn(
                        "cursor-pointer",
                        showFavoritesOnly && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        setShowFavoritesOnly(!showFavoritesOnly);
                        setCurrentPage(1);
                      }}
                    >
                      Show Favorites Only
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setShowFavoritesOnly(false);
                        setCurrentPage(1);
                      }}
                    >
                      Show All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter by Category</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] sm:max-h-[500px] overflow-y-auto">
                    <DropdownMenuLabel className="sticky top-0 bg-background z-10 border-b">Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator className="sticky top-8 bg-background z-10" />
                    {Object.entries(tagCategories).map(([category, tags]) => (
                      <DropdownMenuGroup key={category}>
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground sticky top-9 bg-background z-10">
                          {category}
                        </DropdownMenuLabel>
                        {tags.map(tag => (
                          <DropdownMenuItem
                            key={tag}
                            className={cn(
                              "text-xs cursor-pointer",
                              selectedTags.includes(tag) && "bg-primary/10 text-primary"
                            )}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </DropdownMenuGroup>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Active Filters */}
              {(selectedTags.length > 0 || searchQuery || showFavoritesOnly) && (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm text-muted-foreground">Active filters:</span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm max-w-[200px] truncate"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        <X className="ml-1 h-3 w-3 flex-shrink-0" />
                      </Badge>
                    ))}
                    {searchQuery && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm max-w-[200px] truncate"
                        onClick={() => setSearchQuery('')}
                      >
                        Search: {searchQuery}
                        <X className="ml-1 h-3 w-3 flex-shrink-0" />
                      </Badge>
                    )}
                    {showFavoritesOnly && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm max-w-[200px] truncate"
                        onClick={() => setShowFavoritesOnly(false)}
                      >
                        Favorites Only
                        <X className="ml-1 h-3 w-3 flex-shrink-0" />
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `${filteredApps.length} ${filteredApps.length === 1 ? 'tool' : 'tools'} found`
              )}
            </div>

            {isLoading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-2">
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 sm:space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
                            <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
                          </div>
                          <Skeleton className="h-3 w-48 sm:h-4 sm:w-56" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                        <div className="space-y-1 sm:space-y-1.5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-3 w-full sm:h-4" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  {searchQuery || selectedTags.length > 0 ? 'No Matching Tools Found' : 'No Tools Available'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {searchQuery || selectedTags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Please check back later for new tools'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {currentApps.map((app) => (
                    <Card key={app.name} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                      <CardHeader className="pb-2 sm:pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 sm:space-y-1.5">
                            <div className="flex items-center gap-2">
                              <app.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                              <CardTitle className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors">
                                {app.name}
                              </CardTitle>
                            </div>
                            <CardDescription className="text-xs sm:text-sm line-clamp-2">
                              {app.description}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-9 sm:w-9 transition-opacity",
                              isAppFavorite(app.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavoriteApp(app.id);
                            }}
                          >
                            <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${isAppFavorite(app.id) ? 'fill-current text-yellow-500' : ''}`} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 sm:pb-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Features:</p>
                          <ul className="space-y-1 sm:space-y-1.5">
                            {app.features.map((feature, index) => (
                              <li key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary flex-shrink-0">•</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {app.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] sm:text-xs cursor-pointer hover:bg-muted max-w-[120px] truncate"
                                onClick={() => toggleTag(tag)}
                                title={tag}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                        <Link href={app.href} className="block">
                          <Button className="w-full text-sm sm:text-base group-hover:bg-primary/90 transition-colors">
                            Open Tool
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-xs sm:text-sm"
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
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </>
            )}
            <div className="mt-12 sm:mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
              <div className="relative">
                <div className="container max-w-screen-xl px-4">
                  <div className="bg-card border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8 md:p-12">
                      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                        <div className="inline-block">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-primary">
                            Custom Solutions
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">Can&apos;t Find What You Need?</h3>
                        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                          We&apos;re constantly expanding our tool suite to better serve your needs.
                          Share your requirements with us, and we&apos;ll help bring your vision to life.
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
                        <div className="bg-muted/50 p-6 sm:p-8 rounded-lg sm:rounded-xl border">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-base sm:text-lg">Why Request a Tool?</h4>
                          </div>
                          <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                            <li className="flex items-start gap-2 sm:gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Custom solutions tailored to your specific needs</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Priority development and dedicated support</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Early access to new features and updates</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-muted/50 p-6 sm:p-8 rounded-lg sm:rounded-xl border">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-base sm:text-lg">What to Include</h4>
                          </div>
                          <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                            <li className="flex items-start gap-2 sm:gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Detailed description of tool purpose and features</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Your target audience and use cases</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span>Any specific technical requirements</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="text-center">
                        <Button size="lg" asChild className="px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-base">
                          <Link href="/contact" className="flex items-center gap-2">
                            Request Your Tool
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
