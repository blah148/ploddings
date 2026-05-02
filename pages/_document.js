import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="dns-prefetch" href="//f005.backblazeb2.com" />
        <link rel="dns-prefetch" href="//ploddings-threads.s3.us-east-005.backblazeb2.com" />
        <link rel="dns-prefetch" href="//bmvuqgfxczoytjwjpvcn.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Ploddings',
            url: 'https://www.ploddings.com',
            logo: {
              '@type': 'ImageObject',
              url: 'https://f005.backblazeb2.com/file/ploddings-images/ploddings_logo-on-transparent.png',
            },
          })}}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
