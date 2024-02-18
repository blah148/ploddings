import React from 'react';
import Link from 'next/link'; // Import Link from Next.js for navigation

export default function ParentInfoLink({ threadData }) {
  return ( 
    <Link href={`/${threadData.page_type}/${threadData.slug}`} passHref>
      <img loading="lazy" alt={threadData.featured_img_alt_text} src={threadData.thumbnail_200x200} />
      <div>{threadData.name}</div>
    </Link>
  );
}

