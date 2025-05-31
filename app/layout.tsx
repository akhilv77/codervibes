import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { useAnalytics } from "@/hooks/useAnalytics";
import { RootPageShell } from "@/components/layout/root-page-shell";
import { MiniMusicPlayer } from "@/components/ui/mini-music-player";
import { MusicProvider } from "@/components/providers/music-provider";
import { TimerProvider } from "@/components/providers/timer-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coder Vibes",
  description: "Your coding companion for focus and productivity",
};

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
          <MusicProvider>
            <TimerProvider>
              <RootPageShell>
                {children}
              </RootPageShell>
            </TimerProvider>
          </MusicProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}