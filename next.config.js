// /home/owner/ploddings/next.config.js
// Redirect-only deployment. Every request gets a 308 to blahnok.com.
// Specific patterns translate content URLs (preserves SEO equity from the 514
// ranked pages); the catch-all at the end sweeps everything else
// (incl. /api/* and account/auth pages) to blahnok home.
module.exports = {
  async redirects() {
    return [
      // Preserve existing internal redirects, flattened to land directly on blahnok
      {
        source: '/join-ploddings',
        destination: 'https://blahnok.com/words',
        permanent: true,
      },
      {
        source: '/blog/an-archive-of-blues-and-other-style-song-walk-throughs',
        destination: 'https://blahnok.com/posts/youtube-video-and-tab-directory',
        permanent: true,
      },

      // Per-slug content URL translations — the SEO core
      {
        source: '/songs/:slug',
        destination: 'https://blahnok.com/transcriptions/:slug',
        permanent: true,
      },
      {
        source: '/threads/:slug',
        destination: 'https://blahnok.com/transcriptions/:slug',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: 'https://blahnok.com/posts/:slug',
        permanent: true,
      },
      {
        source: '/embed/:slug',
        destination: 'https://blahnok.com/transcriptions/:slug',
        permanent: true,
      },

      // Index pages
      { source: '/songs',   destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/blog',    destination: 'https://blahnok.com/blog',           permanent: true },

      // Static pages
      { source: '/about',          destination: 'https://blahnok.com/words',          permanent: true },
      { source: '/contact',        destination: 'https://blahnok.com/write',          permanent: true },
      { source: '/privacy-policy', destination: 'https://blahnok.com/privacy-policy', permanent: true },
      { source: '/slow-downer',    destination: 'https://blahnok.com/slow-downer',    permanent: true },
      { source: '/sitemap.xml',    destination: 'https://blahnok.com/sitemap.xml',    permanent: true },

      // Homepage
      { source: '/', destination: 'https://blahnok.com/transcriptions', permanent: true },

      // Catch-all — anything else (account, login, /api/*, etc.) → portfolio home
      { source: '/:path*', destination: 'https://blahnok.com/', permanent: true },
    ];
  },
};
