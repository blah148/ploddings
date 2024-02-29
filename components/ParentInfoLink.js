import React from 'react';
import Link from 'next/link'; // Import Link from Next.js for navigation
import styles from '../styles/songs.module.css';

export default function ParentInfoLink({ threadData = null, fallBack }) {
  // Check if threadData exists and has the necessary properties, otherwise use fallBack
  const href = threadData && threadData.page_type && threadData.slug
               ? `/${threadData.page_type}/${threadData.slug}`
               : `/${fallBack}`;

  return (
    <Link href={href} className={styles.parentInfoLinkContainer} passHref>
			<div className={styles.parentInfoLinkContents}>
        <img loading="lazy" alt={threadData?.featured_img_alt_text || 'Ploddings guitar thread image'} src={threadData?.thumbnail_200x200 || 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px/ploddings_default_200x200.webp'} />
        <div>{threadData?.name || 'Blog'}</div>
			</div>
    </Link>
  );
}

