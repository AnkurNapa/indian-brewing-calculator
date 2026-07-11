import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Indian Brewing Water Calculator',
  description: 'A metric brewing water chemistry calculator: residual alkalinity, mash pH prediction, salt & acid dosing, sparge adjustment, and water blending.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment font-body text-ink">{children}</body>
    </html>
  );
}
