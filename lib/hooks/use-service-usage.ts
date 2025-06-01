'use client';

import { useCallback } from 'react';
import { db } from '@/lib/db/indexed-db';

interface ServiceUsage {
  [key: string]: number;
}

export function useServiceUsage() {
  const trackUsage = useCallback(async (service: string, action: string) => {
    try {
      const usage = (await db.get('settings', 'serviceUsage') as ServiceUsage) || {};
      const key = `${service}_${action}`;
      usage[key] = (usage[key] || 0) + 1;
      await db.set('settings', 'serviceUsage', usage);
    } catch (error) {
      console.error('Error tracking service usage:', error);
    }
  }, []);

  return { trackUsage };
} 