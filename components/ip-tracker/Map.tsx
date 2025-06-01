'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: '/images/marker-icon.svg',
    shadowUrl: '/images/marker-shadow.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
}

// Dynamically import the ClientMap component
const ClientMap = dynamic(() => import('./ClientMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border flex items-center justify-center bg-muted/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    ),
});

export default function Map(props: MapProps) {
    return <ClientMap {...props} />;
} 