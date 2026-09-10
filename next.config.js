// /home/owner/ploddings/next.config.js
// Redirect-only deployment. Every request gets a 308 to blah148.com.
// Specific patterns translate content URLs (preserves SEO equity from the 514
// ranked pages); the catch-all at the end sweeps everything else
// (incl. /api/* and account/auth pages) to blah148 home.
//
// Next matches these IN ORDER, first hit wins — every exact-path rule below has
// to stay ahead of the /:type/:slug patterns it would otherwise fall through to.
module.exports = {
  async redirects() {
    return [
      // ---- Legacy consolidations, formerly public/_redirects -------------
      // That file was a Netlify/Render static-hosting artifact. This is a Next
      // server on Render, which never reads it, so all 26 of these were falling
      // through to /blog/:slug and /threads/:slug and landing on blah148 404s.
      // Retargeted at the consolidated blah148 posts and kept in the config,
      // which is the only redirect source this deployment actually honours.

      // Learning the strings (was public/_redirects, from GTO)
      { source: '/blog/extra-notes', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-a-string', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-b-string', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-d-string', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-g-string', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-thick-e-string', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-thin-e-string', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },
      { source: '/threads/learning-the-strings', destination: 'https://blah148.com/notes/learning-the-strings', permanent: true },

      // Reading sheet music
      { source: '/blog/bars', destination: 'https://blah148.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/clefs', destination: 'https://blah148.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/music-staff', destination: 'https://blah148.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/note-values', destination: 'https://blah148.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/reading-guitar-tablature', destination: 'https://blah148.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/time-signature', destination: 'https://blah148.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/threads/reading-sheet-music-for-the-guitar', destination: 'https://blah148.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },

      // Amazing Grace in the style of Fahey
      { source: '/blog/conclusion', destination: 'https://blah148.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/going-over-the-v-chord', destination: 'https://blah148.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/looking-at-the-iv-chord', destination: 'https://blah148.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/putting-together-an-arrangement', destination: 'https://blah148.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/starting-with-the-i-chord', destination: 'https://blah148.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },

      // Twinkle Twinkle fingerstyle
      { source: '/blog/pt-1-5-key-of-a-on-the-g-string', destination: 'https://blah148.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-2-5-key-of-a-on-the-b-string', destination: 'https://blah148.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-3-5-key-of-a-on-the-5th-string', destination: 'https://blah148.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-4-5-key-of-b-on-the-3rd-string', destination: 'https://blah148.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-5-5-key-of-f-on-the-6th-string', destination: 'https://blah148.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/threads/playing-twinkle-twinkle-in-fingerstyle', destination: 'https://blah148.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },

      // ---- Internal redirects flattened to land directly on blah148 --------
      { source: '/join-ploddings', destination: 'https://blah148.com/words', permanent: true },
      {
        source: '/blog/an-archive-of-blues-and-other-style-song-walk-throughs',
        destination: 'https://blah148.com/notes/youtube-video-and-tab-directory',
        permanent: true,
      },

      // The YouTube archive used to be an iframed /embed/yt-archive page. The
      // notes post renders that table natively now, so point the old embed URL
      // at the post rather than at a transcription slug that doesn't exist.
      {
        source: '/embed/yt-archive',
        destination: 'https://blah148.com/notes/youtube-video-and-tab-directory',
        permanent: true,
      },

      // Blog post that wasn't carried over — send it to the notes index rather
      // than to a 404.
      { source: '/blog/picking-the-guitar', destination: 'https://blah148.com/notes', permanent: true },

      // ---- Threads that aren't blah148 artist pages -----------------------
      // These three came across as notes, not as artists.
      { source: '/threads/memorizing-the-fretboard', destination: 'https://blah148.com/memorizing-the-fretboard', permanent: true },
      { source: '/threads/fingerpicking-chords', destination: 'https://blah148.com/notes/fingerpicking-chords', permanent: true },
      { source: '/threads/tuning-the-guitar', destination: 'https://blah148.com/notes/tuning-the-guitar', permanent: true },

      // Artists with no transcriptions on blah148 yet: the artist page would
      // 404, so land them on the transcriptions index instead.
      { source: '/threads/lane-hardin', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/pre-war-blues-blogs', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/blind-joe-reynolds', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/blind-willie-mctell', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/hambone-willie-newbern', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/jimi-hendrix', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/lead-belly', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/mance-lipscomb', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/mississippi-fred-mcdowell', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/muddy-waters', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/bukka-white', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/eddie-van-halen', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/robert-pete-williams', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/blind-blake', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads/peg-leg-howell', destination: 'https://blah148.com/transcriptions', permanent: true },

      // ---- Per-slug content URL translations — the SEO core ---------------
      // /songs/:slug lands on blah148's one-segment resolver, which 308s on to
      // the canonical /transcriptions/:artist/:song. Two hops, but it keeps the
      // artist mapping in the one repo that owns the data.
      {
        source: '/songs/:slug',
        destination: 'https://blah148.com/transcriptions/:slug',
        permanent: true,
      },
      {
        source: '/threads/:slug',
        destination: 'https://blah148.com/transcriptions/:slug',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: 'https://blah148.com/notes/:slug',
        permanent: true,
      },
      {
        source: '/embed/:slug',
        destination: 'https://blah148.com/transcriptions/:slug',
        permanent: true,
      },

      // Index pages
      { source: '/songs',   destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/threads', destination: 'https://blah148.com/transcriptions', permanent: true },
      { source: '/blog',    destination: 'https://blah148.com/notes',           permanent: true },

      // Static pages
      { source: '/about',          destination: 'https://blah148.com/words',          permanent: true },
      { source: '/contact',        destination: 'https://blah148.com/write',          permanent: true },
      { source: '/privacy-policy', destination: 'https://blah148.com/privacy-policy', permanent: true },
      { source: '/slow-downer',    destination: 'https://blah148.com/slow-downer',    permanent: true },
      { source: '/sitemap.xml',    destination: 'https://blah148.com/sitemap.xml',    permanent: true },

      // Homepage
      { source: '/', destination: 'https://blah148.com/transcriptions', permanent: true },

      // Catch-all — anything else (account, login, /api/*, etc.) → portfolio home
      { source: '/:path*', destination: 'https://blah148.com/', permanent: true },
    ];
  },
};
