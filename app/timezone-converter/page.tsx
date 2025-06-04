import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/ui/back-button";
import { useServiceTracking } from '@/hooks/useServiceTracking';
import { db } from '@/lib/db/indexed-db';
import { Clock, Copy, RefreshCw, Trash2 } from "lucide-react";

interface TimezoneHistory {
    sourceTime: string;
    sourceZone: string;
    targetZone: string;
    convertedTime: string;
    timestamp: number;
}

export default function TimezoneConverter() {
    const { trackServiceUsage } = useServiceTracking();
    const { toast } = useToast();
    const [sourceTime, setSourceTime] = useState('');
    const [sourceZone, setSourceZone] = useState('UTC');
    const [targetZone, setTargetZone] = useState('UTC');
    const [convertedTime, setConvertedTime] = useState('');
    const [history, setHistory] = useState<TimezoneHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadHistory = async () => {
        try {
            const storedHistory = await db.get<TimezoneHistory[]>('timeConversion', 'history') || [];
            setHistory(storedHistory);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToHistory = async (sourceTimeFormatted: string, convertedTimeFormatted: string, sourceZone: string, targetZone: string) => {
        try {
            const newHistory = {
                sourceTime: sourceTimeFormatted,
                sourceZone,
                targetZone,
                convertedTime: convertedTimeFormatted,
                timestamp: Date.now()
            };

            const updatedHistory = [newHistory, ...history.slice(0, 9)];
            setHistory(updatedHistory);
            await db.set('timeConversion', 'history', updatedHistory);
        } catch (error) {
            console.error('Error saving history:', error);
            toast({
                title: "Error saving history",
                description: "Failed to save conversion history",
                variant: "destructive"
            });
        }
    };

    const updateTimes = (time: string) => {
        setSourceTime(time);
    };

    useEffect(() => {
        trackServiceUsage('Timezone Converter', 'page_view');
        loadHistory();
    }, []);

    const convertTime = () => {
        if (!sourceTime) {
            toast({
                title: "Error",
                description: "Please enter a time to convert",
                variant: "destructive"
            });
            return;
        }

        try {
            // Parse the input date and time
            const [datePart, timePart] = sourceTime.split('T');
            const [day, month, year] = datePart.split('-').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);

            // Create a date object in the source time zone
            const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));

            // Format the time in the target time zone
            const formattedResult = date.toLocaleString('en-US', {
                timeZone: targetZone,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            });

            // Format the source time for display
            const sourceTimeFormatted = date.toLocaleString('en-US', {
                timeZone: sourceZone,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            });

            setConvertedTime(formattedResult);
            addToHistory(sourceTimeFormatted, formattedResult, sourceZone, targetZone);
            updateTimes(sourceTime);
            trackServiceUsage('Timezone Converter', 'time_converted', `From: ${sourceZone} To: ${targetZone}`);

            // Update the input field to show the correct time in yyyy-MM-ddThh:mm format
            const formattedInput = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            setSourceTime(formattedInput);
        } catch (error) {
            console.error('Error converting time:', error);
            toast({
                title: "Error",
                description: "Failed to convert time. Please check your input.",
                variant: "destructive"
            });
        }
    };

    const handleSourceZoneChange = (value: string) => {
        setSourceZone(value);
        trackServiceUsage('Timezone Converter', 'source_zone_changed', `Zone: ${value}`);
        if (sourceTime) {
            convertTime();
        }
    };

    const handleTargetZoneChange = (value: string) => {
        setTargetZone(value);
        trackServiceUsage('Timezone Converter', 'target_zone_changed', `Zone: ${value}`);
        if (sourceTime) {
            convertTime();
        }
    };

    const handleClearHistory = async () => {
        try {
            await db.set('timeConversion', 'history', []);
            setHistory([]);
            trackServiceUsage('Timezone Converter', 'history_cleared');
            toast({
                title: "Success",
                description: "History cleared successfully",
            });
        } catch (error) {
            console.error('Error clearing history:', error);
            toast({
                title: "Error",
                description: "Failed to clear history",
                variant: "destructive"
            });
        }
    };

    // ... rest of the existing code ...
} 