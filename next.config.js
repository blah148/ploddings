// next.config.js

module.exports = {
  images: {
    remotePatterns: [
      { hostname: 'ploddings-threads.s3.us-east-005.backblazeb2.com' },
      { hostname: 'f005.backblazeb2.com' },
      { hostname: 'bmvuqgfxczoytjwjpvcn.supabase.co' },
      { hostname: 'th.bing.com' } // Includes th.bing.com for image optimization
    ],
  },
  async redirects() {
    return [
      {
        source: '/join-ploddings',
        destination: '/about',
        permanent: true, // Makes this a 301 redirect
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
            value: "frame-ancestors 'self' https://yoursite.com", // Ensure to replace 'https://yoursite.com' with your actual domain
          },
        ],
      },
    ];
  },
};

