import Head from 'next/head';
import PloddingsScoreEmbed from '../components/PloddingsScoreEmbed';

const MUSICXML_URL = 'https://f005.backblazeb2.com/file/ploddings-songs/spoonful-blues_charley-patton.musicxml';
const SONG_SLUG = 'spoonful-blues-charley-patton';
const SONG_NAME = 'Spoonful Blues';
const ARTIST_NAME = 'Charley Patton';

export default function EmbedTest() {
  // Page-level OG tags so external embeds of this URL get a rich preview
  const ogParams = new URLSearchParams({
    title: SONG_NAME, artist: ARTIST_NAME, verified: '1',
  });
  const ogUrl = `https://www.ploddings.com/api/og?${ogParams.toString()}`;
  const pageUrl = `https://www.ploddings.com/embed/${SONG_SLUG}`;
  const desc = `${SONG_NAME} — interactive transcription with synced audio playback by ${ARTIST_NAME}. Transcribed by Blahnok on Ploddings.`;

  return (
    <>
      <Head>
        <title>{SONG_NAME} — {ARTIST_NAME} | Ploddings</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title"        content={`${SONG_NAME} — ${ARTIST_NAME}`} />
        <meta property="og:description"  content={desc} />
        <meta property="og:image"        content={ogUrl} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url"          content={pageUrl} />
        <meta property="og:type"         content="music.song" />
        <meta property="og:site_name"    content="Ploddings" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={`${SONG_NAME} — ${ARTIST_NAME}`} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image"       content={ogUrl} />
      </Head>
      <PloddingsScoreEmbed
        musicXMLUrl={MUSICXML_URL}
        songName={SONG_NAME}
        artistName={ARTIST_NAME}
        songSlug={SONG_SLUG}
      />
    </>
  );
}
