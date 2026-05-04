import Head from 'next/head';
import PloddingsAlphaTabEmbed from '../components/PloddingsAlphaTabEmbed';

const MUSICXML_URL = 'https://f005.backblazeb2.com/file/ploddings-musescore-files/lute-suite-in-e-minor-bwv-996-2-allemande_andres-segovia.mxl';

export default function TestAlphaTab() {
  // Backblaze doesn't return CORS headers; route through our authenticated proxy.
  const proxied = `/api/proxy-musicxml?url=${encodeURIComponent(MUSICXML_URL)}`;

  return (
    <>
      <Head>
        <title>alphaTab Test | Ploddings</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ fontFamily: 'sans-serif', padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px' }}>alphaTab — test</h1>
        <PloddingsAlphaTabEmbed musicXMLUrl={proxied} />
      </div>
    </>
  );
}
