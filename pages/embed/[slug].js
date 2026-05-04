import Head from 'next/head';
import PloddingsScoreEmbed from '../../components/PloddingsScoreEmbed';
import { fetchSongData, getParentObject } from '../../db-utilities';

export default function EmbedPage({ songData, threadData }) {
  if (!songData) {
    return (
      <>
        <Head>
          <title>Score not found | Ploddings</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#888' }}>
          Score not found.
        </div>
      </>
    );
  }

  const SONG_NAME = songData.name || '';
  const ARTIST_NAME = threadData?.name || '';
  const SONG_SLUG = songData.slug || '';

  const ogParams = new URLSearchParams({
    title: SONG_NAME,
    artist: ARTIST_NAME,
    verified: '1',
  });
  const ogUrl = `https://www.ploddings.com/api/og?${ogParams.toString()}`;
  const pageUrl = `https://www.ploddings.com/embed/${SONG_SLUG}`;
  const desc = `${SONG_NAME} — interactive transcription with synced audio playback by ${ARTIST_NAME}. Transcribed by Blahnok on Ploddings.`;

  return (
    <>
      <Head>
        <title>{SONG_NAME} — {ARTIST_NAME} | Ploddings</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {songData.musicXML && (
          <link
            rel="preload"
            as="fetch"
            href={`/api/score/${SONG_SLUG}`}
            crossOrigin="anonymous"
          />
        )}
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
        <style>{`
          /* Body background matches the share-row light-grey so any leftover iframe height
             below the embed blends in instead of showing a dark band. */
          html, body { margin: 0; padding: 0; background: #f9f9f9; }
        `}</style>
      </Head>
      {/* No surrounding chrome — the iframe IS the embed */}
      <PloddingsScoreEmbed
        musicXMLUrl={`/api/score/${SONG_SLUG}`}
        songName={SONG_NAME}
        artistName={ARTIST_NAME}
        songSlug={SONG_SLUG}
        hasTabAccess={false}
        verifiedByEar={true}
      />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const songData = await fetchSongData(params.slug);
  if (!songData || !songData.musicXML) {
    return { props: { songData: null, threadData: null } };
  }
  const threadData = await getParentObject(songData.thread_id);
  return {
    props: { songData, threadData },
  };
}
