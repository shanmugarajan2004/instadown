/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.instagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.facebook.com' },
    ],
    unoptimized: true,
  },

  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const renderUrl = 'https://instadow-backend.onrender.com';
    const connectSrc = "connect-src 'self' " + apiUrl + " http://localhost:4000 " + renderUrl;

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-XSS-Protection',       value: '1; mode=block' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: https: blob:",
              connectSrc,
              "media-src 'self' blob: https:",
              "frame-src 'none'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
