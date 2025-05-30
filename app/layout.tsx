import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { useAnalytics } from "@/hooks/useAnalytics";
import { RootPageShell } from "@/components/layout/root-page-shell";
import { checkAndMigrate } from "@/lib/db/migrate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoderVibes - Tools for Developers",
  description: "A collection of useful tools for developers",
};

// Initialize IndexedDB and handle migration
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise setTimeout
  const initDB = () => {
    try {
      checkAndMigrate().catch(console.error);
    } catch (error) {
      console.error('Error during IndexedDB initialization:', error);
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initDB);
  } else {
    setTimeout(initDB, 0);
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/assets/favicon.png" />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RootPageShell>
            {children}
          </RootPageShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}