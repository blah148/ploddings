export const config = {
  api: { responseLimit: false },
};

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith('https://f005.backblazeb2.com/')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return res.status(upstream.status).json({ error: 'Upstream fetch failed' });
  }

  // .mxl is zip-compressed binary, .musicxml/.xml is plain text — stream as raw bytes either way
  const isMxl = /\.mxl(\?|$)/i.test(url);
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.setHeader('Content-Type', isMxl ? 'application/vnd.recordare.musicxml' : 'application/xml');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.send(buf);
}
