'use client';

import { useEffect, useRef } from 'react';
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

interface ClientMapProps {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
}

export default function ClientMap({ latitude, longitude, city, country }: ClientMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialize map
        const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);
        mapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(`${city}, ${country}`).openPopup();

        // Cleanup
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [latitude, longitude, city, country]);

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border">
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
} 