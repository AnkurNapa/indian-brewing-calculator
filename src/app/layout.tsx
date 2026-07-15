import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import Script from 'next/script';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import './globals.css';

const brandFont = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-brand',
});

const APP_TITLE = "Indian Brewer's Calculator";
const APP_DESCRIPTION =
  'A metric brewing water chemistry calculator: residual alkalinity, mash pH prediction, salt & acid dosing, sparge adjustment, IBU/SRM/ABV, BJCP style check, and a fermentation tracker.';

export const metadata: Metadata = {
  // Required for openGraph/twitter image URLs to resolve to absolute
  // addresses -- social platforms (WhatsApp, Twitter/X, iMessage, etc.)
  // fetch the preview image server-side and ignore relative paths.
  metadataBase: new URL('https://ankurnapa.github.io/indian-brewing-calculator/'),
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  manifest: 'manifest.webmanifest',
  icons: {
    icon: [
      { url: 'favicon.ico', sizes: 'any' },
      { url: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Brewer's Calc",
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: '/',
    siteName: APP_TITLE,
    images: [{ url: 'og-image.png', width: 1200, height: 630, alt: APP_TITLE }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ['og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e08b2d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={brandFont.variable}>
      <body className="min-h-screen bg-parchment font-body text-ink">
        <LanguageProvider>
          {children}
          <SiteFooter />
        </LanguageProvider>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
