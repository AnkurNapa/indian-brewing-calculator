import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Indian Brewing Water Calculator',
  description: 'A metric brewing water chemistry calculator: residual alkalinity, mash pH prediction, salt & acid dosing, sparge adjustment, and water blending.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-parchment font-body text-ink">{children}</body>
    </html>
  );
}
