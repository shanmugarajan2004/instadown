import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'InstaDown — Download Instagram Videos & Reels Free',
  description: 'Download public Instagram videos, reels and IGTV for free. No account needed.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico',    sizes: 'any' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg',       type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title:       'InstaDown — Download Instagram Videos & Reels Free',
    description: 'Download public Instagram videos, reels and IGTV for free.',
    type:        'website',
    images:      [{ url: '/icon-512.png', width: 512, height: 512 }],
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
      </body>
    </html>
  );
}
