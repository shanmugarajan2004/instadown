import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'InstaDown — Download Instagram Videos & Reels Free',
  description: 'Download public Instagram videos, reels and IGTV for free. No account needed.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'InstaDown — Download Instagram Videos & Reels Free',
    description: 'Download public Instagram videos, reels and IGTV for free.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className="min-h-screen flex flex-col"
        style={{
          background: 'linear-gradient(160deg,#09000f 0%,#0e000e 60%,#0a0a00 100%)',
          color: '#fff',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
        }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}