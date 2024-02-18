import React from 'react';
import Link from 'next/link'; // Import Link from Next.js for navigation

export default function ParentInfoLink({ threadData, fallBack }) {
  // Check if threadData exists and has the necessary properties, otherwise use fallBack
  const href = threadData && threadData.page_type && threadData.slug
               ? `/${threadData.page_type}/${threadData.slug}`
               : `/${fallBack}`;

  return (
    <Link href={href} passHref>
        <img loading="lazy" alt={threadData?.featured_img_alt_text || 'Default Alt Text'} src={threadData?.thumbnail_200x200 || '/default-thumbnail.png'} />
        <div>{threadData?.name || 'Default Name'}</div>
    </Link>
  );
}

