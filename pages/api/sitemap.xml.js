import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BASE_URL = 'https://www.ploddings.com';

const STATIC_PAGES = [
  { url: '/',                      changefreq: 'daily',   priority: '1.0' },
  { url: '/about',                 changefreq: 'monthly', priority: '0.6' },
  { url: '/contact',               changefreq: 'yearly',  priority: '0.4' },
  { url: '/privacy-policy',        changefreq: 'yearly',  priority: '0.3' },
  { url: '/terms-and-conditions',  changefreq: 'yearly',  priority: '0.3' },
];

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod   ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority   ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

export default async function handler(req, res) {
  // Fetch all published content slugs and types in one query
  const { data, error } = await supabase
    .from('content')
    .select('slug, page_type, published_date')
    .not('slug', 'is', null);

  if (error) {
    res.status(500).json({ error: 'Failed to fetch content for sitemap' });
    return;
  }

  const songs   = data.filter(r => r.page_type === 'songs');
  const threads = data.filter(r => r.page_type === 'threads');
  const blogs   = data.filter(r => r.page_type === 'blog');

  const entries = [
    // Static pages
    ...STATIC_PAGES.map(p =>
      urlEntry({ loc: `${BASE_URL}${p.url}`, changefreq: p.changefreq, priority: p.priority })
    ),

    // Song / tab pages — highest priority content
    ...songs.map(r =>
      urlEntry({
        loc:        `${BASE_URL}/songs/${r.slug}`,
        lastmod:    r.published_date ? r.published_date.slice(0, 10) : undefined,
        changefreq: 'monthly',
        priority:   '0.9',
      })
    ),

    // Blog pages
    ...blogs.map(r =>
      urlEntry({
        loc:        `${BASE_URL}/blog/${r.slug}`,
        lastmod:    r.published_date ? r.published_date.slice(0, 10) : undefined,
        changefreq: 'monthly',
        priority:   '0.8',
      })
    ),

    // Artist / thread pages
    ...threads.map(r =>
      urlEntry({
        loc:        `${BASE_URL}/threads/${r.slug}`,
        lastmod:    r.published_date ? r.published_date.slice(0, 10) : undefined,
        changefreq: 'monthly',
        priority:   '0.7',
      })
    ),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // CDN cache 1hr
  res.status(200).send(xml);
}
