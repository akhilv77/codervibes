import { MetadataRoute } from 'next';
import { apps } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://codervibes.in';
  
  // Add home page
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ];

  // Add all app pages
  apps.forEach(app => {
    routes.push({
      url: `${baseUrl}${app.href}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    });
  });

  return routes;
} 