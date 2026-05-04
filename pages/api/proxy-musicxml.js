// Server-side proxy for MusicXML files in the private Backblaze B2 bucket.
// Authenticates to B2 once (token cached for ~23h, B2 tokens last 24h) and
// uses the auth token to download files that are otherwise inaccessible.
//
// Required env vars on Vercel:
//   B2_KEY_ID            — your B2 Application Key ID
//   B2_APPLICATION_KEY   — the matching Application Key
//   B2_BUCKET_NAME_XML   — bucket name (e.g. "ploddings-musescore-files") used for URL validation

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
  cachedAuth = {
    authToken: data.authorizationToken,
  };
  // Refresh ~1h before B2's 24h expiry to be safe
  authExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedAuth;
}

export default async function handler(req, res) {
  const { url } = req.query;
  const bucketName = process.env.B2_BUCKET_NAME_XML || 'ploddings-musescore-files';
  // Allowed: dedicated MusicXML bucket OR the legacy public ploddings-songs bucket
  const allowedPrefixes = [
    bucketName && `https://f005.backblazeb2.com/file/${bucketName}/`,
    'https://f005.backblazeb2.com/file/ploddings-songs/',
  ].filter(Boolean);
  if (!url || !allowedPrefixes.some((p) => url.startsWith(p))) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const auth = await getB2Auth();
    const upstream = await fetch(url, {
      headers: { Authorization: auth.authToken },
    });
    if (!upstream.ok) {
      // If the cached token went stale (e.g. revoked), invalidate and let next request reauth
      if (upstream.status === 401) {
        cachedAuth = null;
        authExpiry = 0;
      }
      const text = await upstream.text().catch(() => '');
      return res.status(upstream.status).json({ error: 'Upstream fetch failed', detail: text });
    }

    const isMxl = /\.mxl(\?|$)/i.test(url);
    const buf = Buffer.from(await upstream.arrayBuffer());
    // .mxl is a zip archive — return a binary content type so Firefox's content-sniffer doesn't
    // try to parse it as XML (which would fail at column 3 on the PK\x03\x04 zip magic and surface
    // a misleading "XML Parsing Error" attached to the parent document URL).
    res.setHeader('Content-Type', isMxl ? 'application/zip' : 'application/xml');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.send(buf);
  } catch (err) {
    console.error('proxy-musicxml error:', err);
    return res.status(500).json({ error: err.message || 'proxy error' });
  }
}
