// Dynamic Open Graph preview image for embedded scores.
// Returns 1200x630 SVG with title, artist, subtitle, and Ploddings branding.
// Usage: /api/og?title=Spoonful%20Blues&artist=Charley%20Patton&subtitle=June%2014%2C%201929

function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export default function handler(req, res) {
  const title    = escape(truncate(req.query.title    || 'Untitled',  60));
  const artist   = escape(truncate(req.query.artist   || '',          50));
  const subtitle = escape(truncate(req.query.subtitle || '',          70));
  const verified = req.query.verified === '1';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#1f1f23"/>
      <stop offset="100%" stop-color="#0d0d12"/>
    </linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#fafaf6"/>
      <stop offset="100%" stop-color="#eeece4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- centered "page" card mimicking the embed -->
  <rect x="120" y="80" width="960" height="450" rx="6" fill="url(#paper)" stroke="#000" stroke-width="2"/>

  <!-- title -->
  <text x="600" y="200" text-anchor="middle"
        font-family="Times New Roman, serif" font-size="68" font-weight="bold" fill="#1a1a1a">${title}</text>

  ${subtitle ? `<text x="600" y="252" text-anchor="middle"
        font-family="Times New Roman, serif" font-size="28" fill="#444">${subtitle}</text>` : ''}

  ${artist ? `<text x="600" y="${subtitle ? 305 : 270}" text-anchor="middle"
        font-family="Times New Roman, serif" font-size="32" font-style="italic" fill="#222">${artist}</text>` : ''}

  ${verified ? `
    <g transform="translate(600, ${subtitle ? 360 : 325})">
      <rect x="-110" y="-22" width="220" height="44" rx="22" fill="#1f7a3a"/>
      <path d="M -78 0 l 12 12 l 28 -28" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="14" y="6" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="#fff">Verified by ear</text>
    </g>
  ` : ''}

  <!-- footer ribbon -->
  <rect x="0" y="555" width="1200" height="75" fill="#0d0d12"/>
  <text x="60" y="603" font-family="sans-serif" font-size="22" fill="#aaa">
    <tspan>Powered by </tspan>
    <tspan font-weight="bold" fill="#f07820">Ploddings</tspan>
  </text>
  <text x="1140" y="603" text-anchor="end" font-family="sans-serif" font-size="20" fill="#888">Interactive score with playback ▶</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.status(200).send(svg);
}
