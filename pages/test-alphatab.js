import { useEffect } from 'react';
import Head from 'next/head';
import PloddingsAlphaTabEmbed from '../components/PloddingsAlphaTabEmbed';

const MUSICXML_URL = 'https://f005.backblazeb2.com/file/ploddings-musescore-files/lute-suite-in-e-minor-bwv-996-2-allemande_andres-segovia.mxl';

export default function TestAlphaTab() {
  // Backblaze doesn't return CORS headers; route through our authenticated proxy.
  const proxied = `/api/proxy-musicxml?url=${encodeURIComponent(MUSICXML_URL)}`;

  // Diagnose the persistent "XML Parsing Error: not well-formed at line 1, col 3" warning by capturing
  // the first bytes of every fetched resource related to this page and shipping them to the dev-server log.
  useEffect(() => {
    const sendLog = (tag, payload) => {
      try {
        fetch(`/api/debug-log?tag=${encodeURIComponent(tag)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch (_) {}
    };
    (async () => {
      try {
        const pageRes = await fetch('/test-alphatab', { headers: { Accept: 'text/html' } });
        const text = (await pageRes.text()).slice(0, 200);
        sendLog('page-bytes', {
          status: pageRes.status,
          contentType: pageRes.headers.get('content-type'),
          firstBytes: text,
          firstBytesHex: Array.from(text.slice(0, 12)).map((c) => c.charCodeAt(0).toString(16)).join(' '),
        });
      } catch (e) {
        sendLog('page-bytes-error', { message: e?.message });
      }
      try {
        const proxyRes = await fetch(proxied);
        const ab = await proxyRes.arrayBuffer();
        const u8 = new Uint8Array(ab);
        sendLog('proxy-bytes', {
          status: proxyRes.status,
          contentType: proxyRes.headers.get('content-type'),
          length: u8.length,
          firstBytesHex: Array.from(u8.slice(0, 16)).map((b) => b.toString(16).padStart(2, '0')).join(' '),
        });
      } catch (e) {
        sendLog('proxy-bytes-error', { message: e?.message });
      }
    })();
  }, [proxied]);

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
