import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { pageview } from '@/lib/gtag';

export const useAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      pageview(pathname + searchParams.toString());
    }
  }, [pathname, searchParams]);
}; 