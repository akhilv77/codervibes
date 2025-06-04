import { Metadata } from 'next';
import { apps } from './config';

const defaultMetadata: Metadata = {
  metadataBase: new URL('https://codervibes.in'),
  title: {
    default: 'CoderVibes - Developer Tools Suite',
    template: '%s | CoderVibes'
  },
  description: 'A comprehensive suite of developer tools for everyday coding tasks',
  keywords: ['developer tools', 'coding utilities', 'web development', 'programming tools'],
  authors: [{ name: 'CoderVibes Team' }],
  creator: 'CoderVibes',
  publisher: 'CoderVibes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://codervibes.in',
    siteName: 'CoderVibes',
    title: 'CoderVibes - Developer Tools Suite',
    description: 'A comprehensive suite of developer tools for everyday coding tasks',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CoderVibes - Developer Tools Suite'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoderVibes - Developer Tools Suite',
    description: 'A comprehensive suite of developer tools for everyday coding tasks',
    images: ['/og-image.png'],
    creator: '@codervibes'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification'
  }
};

export const generateAppMetadata = (appId: string): Metadata => {
  const app = apps.find(a => a.id === appId);
  if (!app) return defaultMetadata;

  const title = `${app.name} - ${app.description}`;
  const description = `${app.description}. ${app.features.join('. ')}`;

  return {
    ...defaultMetadata,
    title,
    description,
    keywords: [...defaultMetadata.keywords as string[], ...app.tags],
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url: `https://codervibes.in${app.href}`,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
    }
  };
};

export const generateHomeMetadata = (): Metadata => {
  return {
    ...defaultMetadata,
    alternates: {
      canonical: 'https://codervibes.in'
    }
  };
}; 