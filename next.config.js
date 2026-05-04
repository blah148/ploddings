// next.config.js

const { AlphaTabWebPackPlugin } = require('@coderline/alphatab-webpack');

module.exports = {
  webpack: (config, { isServer }) => {
    // alphaTab is browser-only; only wire the plugin into the client bundle.
    // assetOutputDir:false — we already serve fonts + soundfont from /public/alphatab/.
    if (!isServer) {
      config.plugins.push(new AlphaTabWebPackPlugin({ assetOutputDir: false }));
    }
    return config;
  },
  images: {
    remotePatterns: [
      { hostname: 'ploddings-threads.s3.us-east-005.backblazeb2.com' },
      { hostname: 'f005.backblazeb2.com' },
      { hostname: 'bmvuqgfxczoytjwjpvcn.supabase.co' },
      { hostname: 'th.bing.com' } // Includes th.bing.com for image optimization
    ],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/join-ploddings',
        destination: '/about',
        permanent: true, // Makes this a 301 redirect
      },
      {
        source: '/blog/an-archive-of-blues-and-other-style-song-walk-throughs',
        destination: '/blog/youtube-video-and-tab-directory',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*', // Apply headers to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

