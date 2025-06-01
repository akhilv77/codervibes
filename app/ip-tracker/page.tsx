'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, MapPin, Globe, Network, Clock, Shield, Copy, Share2, History, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loading } from '@/components/ui/loading';
import { useServiceTracking } from '@/hooks/useServiceTracking';
import dynamic from 'next/dynamic';
import { IPTrackerPageShell } from '@/components/layout/ip-tracker-page-shell';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useIPTrackerStore } from '@/lib/ip-tracker-store';

// Dynamically import the Map component to avoid SSR issues
const DynamicMap = dynamic(
    () => import('@/components/ip-tracker/ClientMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[400px] w-full rounded-lg overflow-hidden border flex items-center justify-center bg-muted/50">
                <Loading variant="spinner" size="lg" />
            </div>
        ),
    }
);

interface IPInfo {
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
    asn: string;
    isp: string;
    connection?: {
        type: string;
    };
}

export default function IPTracker() {
    const { trackServiceUsage } = useServiceTracking();
    const { searchHistory, addToHistory, clearHistory, loadHistory } = useIPTrackerStore();
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchIp, setSearchIp] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(field);
            toast.success(`Copied ${field} to clipboard`);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const shareIPInfo = async () => {
        if (!ipInfo) return;
        
        const shareData = {
            title: 'IP Information',
            text: `IP: ${ipInfo.ip}\nLocation: ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}\nISP: ${ipInfo.isp}`,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await copyToClipboard(shareData.text, 'IP Information');
            }
        } catch (err) {
            toast.error('Failed to share information');
        }
    };

    const fetchIPInfo = async (ip?: string) => {
        try {
            setRefreshing(true);
            const token = process.env.NEXT_PUBLIC_IPINFO_TOKEN;
            const url = ip 
                ? `https://ipinfo.io/${ip}/json?token=${token}`
                : `https://ipinfo.io/json?token=${token}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            setIpInfo(data);
            if (ip) {
                addToHistory(ip);
            }
            setLoading(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch IP information');
            setLoading(false);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        trackServiceUsage('IP Tracker', 'page_view');
        loadHistory();
        fetchIPInfo();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchIp) {
            trackServiceUsage('IP Tracker', 'ip_search', `IP: ${searchIp}`);
            fetchIPInfo(searchIp);
        }
    };

    if (loading) return (
        <IPTrackerPageShell>
            <Loading
                variant="default"
                size="lg"
                text="Loading IP information..."
                fullScreen
            />
        </IPTrackerPageShell>
    );

    if (error) return (
        <IPTrackerPageShell>
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center space-y-4">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={() => fetchIPInfo()} disabled={refreshing}>
                        {refreshing ? (
                            <Loading variant="spinner" size="sm" />
                        ) : (
                            "Try Again"
                        )}
                    </Button>
                </div>
            </div>
        </IPTrackerPageShell>
    );

    const [latitude, longitude] = ipInfo?.loc.split(',').map(Number) || [0, 0];

    return (
        <IPTrackerPageShell>
            <div className="container mx-auto px-4 py-4 sm:py-8 max-w-screen-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">IP Tracker</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track and analyze IP addresses</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => fetchIPInfo()} disabled={refreshing} className="w-full sm:w-auto">
                            {refreshing ? (
                                <Loading variant="spinner" size="sm" />
                            ) : (
                                "Refresh"
                            )}
                        </Button>
                        <Button variant="outline" onClick={shareIPInfo} className="w-full sm:w-auto">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Enter IP address"
                            value={searchIp}
                            onChange={(e) => setSearchIp(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={refreshing}>
                            {refreshing ? (
                                <Loading variant="spinner" size="sm" />
                            ) : (
                                "Search"
                            )}
                        </Button>
                    </div>
                </form>

                {searchHistory.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                <span className="text-sm font-medium">Recent Searches</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    clearHistory();
                                    toast.success('Search history cleared');
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {searchHistory.map((ip) => (
                                <Badge
                                    key={ip}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-secondary/80"
                                    onClick={() => {
                                        setSearchIp(ip);
                                        fetchIPInfo(ip);
                                    }}
                                >
                                    {ip}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {ipInfo && (
                    <div className="grid gap-6 sm:gap-8">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl sm:text-2xl">Location Map</CardTitle>
                                <CardDescription className="text-sm">Geographic location of the IP address</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DynamicMap
                                    latitude={latitude}
                                    longitude={longitude}
                                    city={ipInfo.city}
                                    country={ipInfo.country}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl sm:text-2xl">IP Information</CardTitle>
                                <CardDescription className="text-sm">Detailed information about the IP address</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 sm:gap-8">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                IP Address
                                            </Label>
                                            <div className="relative">
                                                <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center justify-between">
                                                    <span>{ipInfo.ip}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => copyToClipboard(ipInfo.ip, 'IP Address')}
                                                    >
                                                        {copied === 'IP Address' ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Location
                                            </Label>
                                            <div className="relative">
                                                <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center justify-between">
                                                    <span>{`${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => copyToClipboard(`${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`, 'Location')}
                                                    >
                                                        {copied === 'Location' ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm flex items-center gap-2">
                                                <Network className="h-4 w-4" />
                                                Network Information
                                            </Label>
                                            <div className="space-y-2">
                                                <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center justify-between">
                                                    <span>ISP: {ipInfo.isp}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => copyToClipboard(ipInfo.isp, 'ISP')}
                                                    >
                                                        {copied === 'ISP' ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center justify-between">
                                                    <span>ASN: {ipInfo.asn}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => copyToClipboard(ipInfo.asn, 'ASN')}
                                                    >
                                                        {copied === 'ASN' ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Timezone
                                            </Label>
                                            <div className="relative">
                                                <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center justify-between">
                                                    <span>{ipInfo.timezone}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => copyToClipboard(ipInfo.timezone, 'Timezone')}
                                                    >
                                                        {copied === 'Timezone' ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Additional Information
                                        </Label>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="p-4 rounded-lg border bg-card">
                                                <div className="text-sm font-medium text-muted-foreground mb-1">Organization</div>
                                                <div className="text-base flex items-center justify-between">
                                                    <span>{ipInfo.org || 'N/A'}</span>
                                                    {ipInfo.org && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => copyToClipboard(ipInfo.org, 'Organization')}
                                                        >
                                                            {copied === 'Organization' ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg border bg-card">
                                                <div className="text-sm font-medium text-muted-foreground mb-1">Postal Code</div>
                                                <div className="text-base flex items-center justify-between">
                                                    <span>{ipInfo.postal || 'N/A'}</span>
                                                    {ipInfo.postal && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => copyToClipboard(ipInfo.postal, 'Postal Code')}
                                                        >
                                                            {copied === 'Postal Code' ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {ipInfo.connection && (
                                                <div className="p-4 rounded-lg border bg-card sm:col-span-2">
                                                    <div className="text-sm font-medium text-muted-foreground mb-1">Connection Type</div>
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="secondary" className="text-base">
                                                            {ipInfo.connection.type}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => ipInfo.connection && copyToClipboard(ipInfo.connection.type, 'Connection Type')}
                                                        >
                                                            {copied === 'Connection Type' ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </IPTrackerPageShell>
    );
} 