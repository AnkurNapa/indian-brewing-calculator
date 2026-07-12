import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const brandFont = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-brand',
});

export const metadata: Metadata = {
  title: 'Indian Brewing Water Calculator',
  description: 'A metric brewing water chemistry calculator: residual alkalinity, mash pH prediction, salt & acid dosing, sparge adjustment, and water blending.',
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
    title: 'Brew Water',
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
      <body className="min-h-screen bg-parchment font-body text-ink">{children}</body>
    </html>
  );
}
