// /home/owner/ploddings/next.config.js
// Redirect-only deployment. Every request gets a 308 to blahnok.com.
// Specific patterns translate content URLs (preserves SEO equity from the 514
// ranked pages); the catch-all at the end sweeps everything else
// (incl. /api/* and account/auth pages) to blahnok home.
//
// Next matches these IN ORDER, first hit wins — every exact-path rule below has
// to stay ahead of the /:type/:slug patterns it would otherwise fall through to.
module.exports = {
  async redirects() {
    return [
      // ---- Legacy consolidations, formerly public/_redirects -------------
      // That file was a Netlify/Render static-hosting artifact. This is a Next
      // server on Render, which never reads it, so all 26 of these were falling
      // through to /blog/:slug and /threads/:slug and landing on blahnok 404s.
      // Retargeted at the consolidated blahnok posts and kept in the config,
      // which is the only redirect source this deployment actually honours.

      // Learning the strings (was public/_redirects, from GTO)
      { source: '/blog/extra-notes', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-a-string', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-b-string', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-d-string', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-g-string', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-thick-e-string', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },
      { source: '/blog/the-thin-e-string', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },
      { source: '/threads/learning-the-strings', destination: 'https://blahnok.com/notes/learning-the-strings', permanent: true },

      // Reading sheet music
      { source: '/blog/bars', destination: 'https://blahnok.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/clefs', destination: 'https://blahnok.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/music-staff', destination: 'https://blahnok.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/note-values', destination: 'https://blahnok.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/reading-guitar-tablature', destination: 'https://blahnok.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/blog/time-signature', destination: 'https://blahnok.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },
      { source: '/threads/reading-sheet-music-for-the-guitar', destination: 'https://blahnok.com/notes/how-to-read-traditional-music-notation-for-guitar', permanent: true },

      // Amazing Grace in the style of Fahey
      { source: '/blog/conclusion', destination: 'https://blahnok.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/going-over-the-v-chord', destination: 'https://blahnok.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/looking-at-the-iv-chord', destination: 'https://blahnok.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/putting-together-an-arrangement', destination: 'https://blahnok.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },
      { source: '/blog/starting-with-the-i-chord', destination: 'https://blahnok.com/notes/amazing-grace-in-the-style-of-john-fahey', permanent: true },

      // Twinkle Twinkle fingerstyle
      { source: '/blog/pt-1-5-key-of-a-on-the-g-string', destination: 'https://blahnok.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-2-5-key-of-a-on-the-b-string', destination: 'https://blahnok.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-3-5-key-of-a-on-the-5th-string', destination: 'https://blahnok.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-4-5-key-of-b-on-the-3rd-string', destination: 'https://blahnok.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/blog/pt-5-5-key-of-f-on-the-6th-string', destination: 'https://blahnok.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },
      { source: '/threads/playing-twinkle-twinkle-in-fingerstyle', destination: 'https://blahnok.com/notes/playing-twinkle-twinkle-little-star-fingerstyle', permanent: true },

      // ---- Internal redirects flattened to land directly on blahnok --------
      { source: '/join-ploddings', destination: 'https://blahnok.com/words', permanent: true },
      {
        source: '/blog/an-archive-of-blues-and-other-style-song-walk-throughs',
        destination: 'https://blahnok.com/notes/youtube-video-and-tab-directory',
        permanent: true,
      },

      // The YouTube archive used to be an iframed /embed/yt-archive page. The
      // notes post renders that table natively now, so point the old embed URL
      // at the post rather than at a transcription slug that doesn't exist.
      {
        source: '/embed/yt-archive',
        destination: 'https://blahnok.com/notes/youtube-video-and-tab-directory',
        permanent: true,
      },

      // Blog post that wasn't carried over — send it to the notes index rather
      // than to a 404.
      { source: '/blog/picking-the-guitar', destination: 'https://blahnok.com/notes', permanent: true },

      // ---- Threads that aren't blahnok artist pages -----------------------
      // These three came across as notes, not as artists.
      { source: '/threads/memorizing-the-fretboard', destination: 'https://blahnok.com/notes/memorizing-the-fretboard', permanent: true },
      { source: '/threads/fingerpicking-chords', destination: 'https://blahnok.com/notes/fingerpicking-chords', permanent: true },
      { source: '/threads/tuning-the-guitar', destination: 'https://blahnok.com/notes/tuning-the-guitar', permanent: true },

      // Artists with no transcriptions on blahnok yet: the artist page would
      // 404, so land them on the transcriptions index instead.
      { source: '/threads/lane-hardin', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/pre-war-blues-blogs', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/blind-joe-reynolds', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/blind-willie-mctell', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/hambone-willie-newbern', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/jimi-hendrix', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/lead-belly', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/mance-lipscomb', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/mississippi-fred-mcdowell', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/muddy-waters', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/bukka-white', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/eddie-van-halen', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/robert-pete-williams', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/blind-blake', destination: 'https://blahnok.com/transcriptions', permanent: true },
      { source: '/threads/peg-leg-howell', destination: 'https://blahnok.com/transcriptions', permanent: true },

      // ---- Per-slug content URL translations — the SEO core ---------------
      // /songs/:slug lands on blahnok's one-segment resolver, which 308s on to
      // the canonical /transcriptions/:artist/:song. Two hops, but it keeps the
      // artist mapping in the one repo that owns the data.
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
        destination: 'https://blahnok.com/notes/:slug',
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
      { source: '/blog',    destination: 'https://blahnok.com/notes',           permanent: true },

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
