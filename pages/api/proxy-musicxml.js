export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith('https://f005.backblazeb2.com/')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return res.status(upstream.status).json({ error: 'Upstream fetch failed' });
  }

  const text = await upstream.text();
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(text);
}
