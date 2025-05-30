import { event } from '@/lib/gtag';

export const useServiceTracking = () => {
  const trackServiceUsage = (serviceName: string, action: string, details?: string) => {
    event({
      action: action,
      category: 'service_usage',
      label: `${serviceName}${details ? ` - ${details}` : ''}`,
    });
  };

  return { trackServiceUsage };
}; 