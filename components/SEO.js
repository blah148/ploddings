import Head from 'next/head';

export default function SEO({
  title,
  description,
  image,
  page_type,
  slug,
  alternativeUrl,
  author,
  nofollow,
  published_date,
  noTitleTag,          // ← NEW PROP
}) {

  // Handle title formatting
  const siteTitle = noTitleTag
    ? (title || 'Home')
    : (title ? `${title} - Ploddings` : 'Home - Ploddings');

  const imageUrl = image
    ? `${image}`
    : 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_550px/lead-belly.webp';

  const pageUrl = page_type
    ? `https://www.ploddings.com/${page_type}/${slug}`
    : `https://www.ploddings.com${slug}`;

  const canonicalUrl = alternativeUrl || pageUrl;

  return (
    <Head>
      <title>{siteTitle}</title>

      <meta name="description" content={description} />
      <meta property="og:site_name" content="Ploddings | Guitar for Blues, Jazz, and Folk" />

      {/* OG Title should NOT append " - Ploddings" unless it’s in siteTitle */}
      <meta property="og:title" content={title || siteTitle} />

      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={pageUrl} />

      <link rel="canonical" href={canonicalUrl} />

      {author && <meta name="author" content={author} />}
      {nofollow
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow" />
      }

      <meta httpEquiv="content-language" content="en-US" />
      <meta name="twitter:card" content="summary_large_image" />

      {published_date && (
        <meta property="og:article:published_time" content={published_date} />
      )}
    </Head>
  );
}

