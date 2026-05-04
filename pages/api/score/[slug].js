// Returns the MusicXML for a song by slug, fetched server-side from a private Backblaze bucket.
// The Backblaze URL is never exposed to the client.
//
// .mxl (zip-compressed MusicXML) files are extracted server-side so the client always
// receives plain XML — no JSZip needed in the browser bundle.
//
// Required env vars:
//   B2_KEY_ID
//   B2_APPLICATION_KEY
//   B2_BUCKET_NAME_XML
import { supabase } from '../../../utils/supabase';

export const config = {
  api: { responseLimit: false },
};

let cachedAuth = null;
let authExpiry = 0;

async function getB2Auth() {
  if (cachedAuth && Date.now() < authExpiry) return cachedAuth;
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  if (!keyId || !appKey) {
    throw new Error('B2 credentials missing — set B2_KEY_ID and B2_APPLICATION_KEY env vars');
  }
  const basic = Buffer.from(`${keyId}:${appKey}`).toString('base64');
  const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`B2 auth failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  cachedAuth = { authToken: data.authorizationToken };
  authExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedAuth;
}

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  // Look up the song's MusicXML URL in Supabase
  const { data: song, error: sErr } = await supabase
    .from('content')
    .select('musicXML')
    .eq('slug', slug)
    .single();
  if (sErr || !song?.musicXML) {
    return res.status(404).json({ error: 'Score not found' });
  }

  const url = song.musicXML;
  const bucketName = process.env.B2_BUCKET_NAME_XML;
  const allowedPrefix = bucketName
    ? `https://f005.backblazeb2.com/file/${bucketName}/`
    : 'https://f005.backblazeb2.com/file/';
  if (!url.startsWith(allowedPrefix)) {
    return res.status(400).json({ error: 'Invalid score URL configured for this song' });
  }

  try {
    const auth = await getB2Auth();
    const upstream = await fetch(url, { headers: { Authorization: auth.authToken } });
    if (!upstream.ok) {
      if (upstream.status === 401) { cachedAuth = null; authExpiry = 0; }
      return res.status(upstream.status).json({ error: 'Upstream fetch failed' });
    }

    const isMxl = /\.mxl(\?|$)/i.test(url);
    const buf = Buffer.from(await upstream.arrayBuffer());

    let xmlText;
    if (isMxl) {
      // Extract inner score XML from the .mxl zip container, server-side
      const JSZipMod = await import('jszip');
      const JSZip = JSZipMod.default || JSZipMod;
      const zip = await JSZip.loadAsync(buf);
      let xmlPath;
      const container = zip.file('META-INF/container.xml');
      if (container) {
        const cText = await container.async('text');
        // Light regex parse — avoids bringing a full XML parser server-side
        const m = cText.match(/<rootfile[^>]*full-path\s*=\s*["']([^"']+)["']/i);
        if (m) xmlPath = m[1];
      }
      if (!xmlPath) {
        xmlPath = Object.keys(zip.files).find(
          (f) => /\.(musicxml|xml)$/i.test(f) && !f.startsWith('META-INF/')
        );
      }
      xmlText = xmlPath ? await zip.file(xmlPath).async('text') : '';
    } else {
      xmlText = buf.toString('utf-8');
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.send(xmlText);
  } catch (err) {
    console.error('score/[slug] error:', err);
    return res.status(500).json({ error: err.message || 'proxy error' });
  }
}
