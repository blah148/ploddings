module.exports = {
  images: {
    remotePatterns: [
      { hostname: 'ploddings-threads.s3.us-east-005.backblazeb2.com' },
      { hostname: 'f005.backblazeb2.com' },
      { hostname: 'bmvuqgfxczoytjwjpvcn.supabase.co' },
      { hostname: 'th.bing.com' }  // This line includes th.bing.com for image optimization
    ],
  },
  async redirects() {
    return [
      {
        source: '/join-ploddings',
        destination: '/about',
        permanent: true, // This makes it a 301 redirect
      },
    ]
  },
};
